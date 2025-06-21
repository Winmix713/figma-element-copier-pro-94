import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, ExternalLink, Eye, Code2, Palette, FileType } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { GeneratedComponent } from '@/types/figma';
import { copyToClipboard, downloadFile } from '@/lib/utils';

interface CodePreviewProps {
  components: GeneratedComponent[];
}

export function CodePreview({ components }: CodePreviewProps) {
  const [selectedComponent, setSelectedComponent] = useState(0);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('jsx');
  const [copied, setCopied] = useState<string | null>(null);

  const component = components[selectedComponent];

  const handleCopy = async (content: string, type: string) => {
    try {
      await copyToClipboard(content);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    downloadFile(content, filename);
  };

  const getFileExtension = (type: string) => {
    switch (type) {
      case 'jsx': return component.typescript ? '.tsx' : '.jsx';
      case 'css': return '.css';
      case 'typescript': return '.d.ts';
      default: return '.txt';
    }
  };

  const downloadAll = () => {
    components.forEach((comp, index) => {
      downloadFile(comp.jsx, `${comp.name}.tsx`, 'text/typescript');
      downloadFile(comp.css, `${comp.name}.css`, 'text/css');
      if (comp.typescript) {
        downloadFile(comp.typescript, `${comp.name}.types.ts`, 'text/typescript');
      }
    });
  };

  if (!component) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Code2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nincs generált komponens</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Komponens választó */}
      {components.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {components.map((comp, index) => (
            <Button
              key={comp.id}
              variant={selectedComponent === index ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedComponent(index)}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <span>{comp.name}</span>
              <Badge variant="secondary" className="text-xs">
                {comp.metadata.complexity}
              </Badge>
            </Button>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Code2 className="w-5 h-5" />
              <span>{component.name}</span>
              <Badge variant="outline">
                {component.metadata.estimatedAccuracy}% pontosság
              </Badge>
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={downloadAll}>
                <Download className="w-4 h-4 mr-2" />
                Összes letöltése
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="jsx" className="flex items-center space-x-2">
                  <Code2 className="w-4 h-4" />
                  <span>JSX</span>
                </TabsTrigger>
                <TabsTrigger value="css" className="flex items-center space-x-2">
                  <Palette className="w-4 h-4" />
                  <span>CSS</span>
                </TabsTrigger>
                {component.typescript && (
                  <TabsTrigger value="typescript" className="flex items-center space-x-2">
                    <FileType className="w-4 h-4" />
                    <span>Types</span>
                  </TabsTrigger>
                )}
                <TabsTrigger value="preview" className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Előnézet</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(
                    activeTab === 'jsx' ? component.jsx :
                    activeTab === 'css' ? component.css :
                    component.typescript || '',
                    activeTab
                  )}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  {copied === activeTab ? 'Másolva!' : 'Másolás'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(
                    activeTab === 'jsx' ? component.jsx :
                    activeTab === 'css' ? component.css :
                    component.typescript || '',
                    `${component.name}${getFileExtension(activeTab)}`
                  )}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Letöltés
                </Button>
              </div>
            </div>

            <TabsContent value="jsx" className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">React Komponens</h4>
              </div>
              <div className="max-h-96 overflow-auto">
                <SyntaxHighlighter
                  language={component.typescript ? "tsx" : "jsx"}
                  style={tomorrow}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    background: '#1a1a1a',
                  }}
                  showLineNumbers
                >
                  {component.jsx}
                </SyntaxHighlighter>
              </div>
            </TabsContent>

            <TabsContent value="css" className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Stílusok</h4>
              </div>
              <div className="max-h-96 overflow-auto">
                <SyntaxHighlighter
                  language="css"
                  style={tomorrow}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    background: '#1a1a1a',
                  }}
                  showLineNumbers
                >
                  {component.css}
                </SyntaxHighlighter>
              </div>
            </TabsContent>

            {component.typescript && (
              <TabsContent value="typescript" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">TypeScript Típusok</h4>
                </div>
                <div className="max-h-96 overflow-auto">
                  <SyntaxHighlighter
                    language="typescript"
                    style={tomorrow}
                    customStyle={{
                      margin: 0,
                      borderRadius: 0,
                      background: '#1a1a1a',
                    }}
                    showLineNumbers
                  >
                    {component.typescript}
                  </SyntaxHighlighter>
                </div>
              </TabsContent>
            )}

            <TabsContent value="preview" className="space-y-4">
              <div className="p-4 border rounded-lg bg-white">
                <h4 className="font-medium mb-4">Komponens Információk</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Típus:</span> {component.metadata.componentType}
                  </div>
                  <div>
                    <span className="font-medium">Komplexitás:</span> {component.metadata.complexity}
                  </div>
                  <div>
                    <span className="font-medium">Generálási idő:</span> {component.metadata.generationTime}ms
                  </div>
                  <div>
                    <span className="font-medium">Függőségek:</span> {component.metadata.dependencies.join(', ')}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
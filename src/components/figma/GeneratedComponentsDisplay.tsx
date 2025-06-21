import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code2, 
  Download, 
  Eye, 
  FileText, 
  Clipboard,
  CheckCircle,
  Play,
  Settings,
  GitBranch,
  MessageSquare
} from 'lucide-react';
import type { GeneratedComponent } from '@shared/types/figma';
import { DocumentationGenerator } from './DocumentationGenerator';
import { FeedbackSystem } from './FeedbackSystem';
import { QualityReport } from './QualityReport';
import { VersionControl } from './VersionControl';
import { LivePreview } from './LivePreview';

interface GeneratedComponentsDisplayProps {
  components: GeneratedComponent[];
  onComponentUpdate?: (component: GeneratedComponent) => void;
}

export function GeneratedComponentsDisplay({ 
  components, 
  onComponentUpdate 
}: GeneratedComponentsDisplayProps) {
  const [selectedComponent, setSelectedComponent] = useState<GeneratedComponent | null>(
    components[0] || null
  );
  const [activeTab, setActiveTab] = useState('code');
  const [previewActive, setPreviewActive] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (components.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Code2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Components Generated</h3>
          <p className="text-gray-600">
            Load a Figma file and generate components to see them here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const downloadCode = (component: GeneratedComponent) => {
    const blob = new Blob([component.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${component.name}.tsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleVersionRestore = (component: GeneratedComponent) => {
    setSelectedComponent(component);
    onComponentUpdate?.(component);
  };

  return (
    <div className="space-y-6">
      {/* Component Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code2 className="w-5 h-5" />
            <span>Generated Components ({components.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {components.map((component) => (
              <Button
                key={component.id}
                variant={selectedComponent?.id === component.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedComponent(component)}
                className="flex items-center space-x-2"
              >
                <span>{component.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {component.metadata.complexity}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Component Details */}
      {selectedComponent && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="code" className="flex items-center space-x-2">
              <Code2 className="w-4 h-4" />
              <span>Code</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Docs</span>
            </TabsTrigger>
            <TabsTrigger value="quality" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Quality</span>
            </TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4" />
              <span>Versions</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Feedback</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Code2 className="w-5 h-5" />
                    <span>{selectedComponent.name}</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedComponent.code, 'code')}
                    >
                      {copiedSection === 'code' ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Clipboard className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadCode(selectedComponent)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedComponent.metadata.estimatedAccuracy}%
                    </div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedComponent.accessibility.score}
                    </div>
                    <div className="text-sm text-gray-600">A11y Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedComponent.metadata.generationTime}ms
                    </div>
                    <div className="text-sm text-gray-600">Gen Time</div>
                  </div>
                </div>
                
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
                  <code>{selectedComponent.code}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <LivePreview
              generatedCode={selectedComponent.code}
              isActive={previewActive}
              onToggle={() => setPreviewActive(!previewActive)}
            />
          </TabsContent>

          <TabsContent value="docs">
            <DocumentationGenerator component={selectedComponent} />
          </TabsContent>

          <TabsContent value="quality">
            <QualityReport component={selectedComponent} />
          </TabsContent>

          <TabsContent value="versions">
            <VersionControl 
              component={selectedComponent} 
              onVersionRestore={handleVersionRestore}
            />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackSystem 
              componentId={selectedComponent.id}
              generatedCode={selectedComponent.code}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
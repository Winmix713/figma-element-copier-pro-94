
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Layers, 
  Palette, 
  Image, 
  Download, 
  Play, 
  Calendar,
  User,
  Settings,
  Zap,
  MessageSquare,
  GitBranch,
  History,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Code,
  TestTube,
  BookOpen
} from 'lucide-react';
import { FigmaApiResponse, GeneratedComponent } from '@/types/figma';
import { AdvancedCodeGenerator, CodeGenerationOptions, CustomCodeInputs } from '@/services/advanced-code-generator';
import { VersionControlService, CodeVersion } from '@/services/version-control';
import { CodeGenerationPanel } from './CodeGenerationPanel';
import { CodePreview } from './CodePreview';
import { ProcessingPipeline } from './ProcessingPipeline';
import { QualityReport } from './QualityReport';
import { LivePreview } from './LivePreview';
import { DocumentationGenerator } from './DocumentationGenerator';
import { FeedbackSystem } from './FeedbackSystem';

interface FigmaInfoDisplayProps {
  figmaData: FigmaApiResponse;
  fileKey: string;
}

export function FigmaInfoDisplay({ figmaData, fileKey }: FigmaInfoDisplayProps) {
  const [generatedComponents, setGeneratedComponents] = useState<GeneratedComponent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [selectedComponent, setSelectedComponent] = useState<GeneratedComponent | null>(null);
  const [versionHistory, setVersionHistory] = useState<CodeVersion[]>([]);
  const [livePreviewActive, setLivePreviewActive] = useState(false);
  const [selectedComponentForDocs, setSelectedComponentForDocs] = useState<GeneratedComponent | null>(null);

  const versionControl = useMemo(() => VersionControlService.getInstance(), []);

  const handleCodeGeneration = useCallback(async (options: CodeGenerationOptions, customCode: CustomCodeInputs) => {
    setIsGenerating(true);
    try {
      if (!figmaData) {
        throw new Error('Nincs Figma adat betöltve');
      }

      const generator = new AdvancedCodeGenerator(figmaData, options);
      generator.setCustomCode(customCode);

      const components = await generator.generateComponents();
      setGeneratedComponents(components);

      // Load version history for first component
      if (components.length > 0) {
        const history = versionControl.getVersionHistory(components[0].id);
        setVersionHistory(history);
        setSelectedComponent(components[0]);
      }

      setActiveTab('code');
    } catch (error) {
      console.error('Kódgenerálási hiba:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [figmaData, versionControl]);

  const handleVersionRollback = useCallback((componentId: string, versionId: string) => {
    const rolledBackVersion = versionControl.rollbackToVersion(componentId, versionId);
    if (rolledBackVersion) {
      // Update the component with rolled back code
      setGeneratedComponents(prev => 
        prev.map(comp => 
          comp.id === componentId ? { ...comp, jsx: rolledBackVersion.code } : comp
        )
      );

      // Refresh version history
      const history = versionControl.getVersionHistory(componentId);
      setVersionHistory(history);
    }
  }, [versionControl]);

  const analyzeFileStructure = useMemo(() => {
    const components = Object.keys(figmaData.components || {}).length;
    const styles = Object.keys(figmaData.styles || {}).length;

    const countNodes = (node: any): number => {
      let count = 1;
      if (node.children) {
        count += node.children.reduce((sum: number, child: any) => sum + countNodes(child), 0);
      }
      return count;
    };

    const totalNodes = figmaData.document ? countNodes(figmaData.document) : 0;
    return { components, styles, totalNodes };
  }, [figmaData]);

  const { components, styles, totalNodes } = analyzeFileStructure;

  const renderVersionHistory = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="w-5 h-5" />
          Verzió Történet
          {selectedComponent && <Badge variant="outline">{selectedComponent.name}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {versionHistory.length > 0 ? (
          versionHistory.map((version, index) => (
            <div key={version.id} className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex flex-col items-center">
                <History className="h-4 w-4 text-blue-500" />
                {index < versionHistory.length - 1 && <div className="w-px h-8 bg-border mt-2" />}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{version.id}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {version.timestamp.toLocaleDateString('hu-HU')}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => selectedComponent && handleVersionRollback(selectedComponent.id, version.id)}
                  >
                    <History className="h-4 w-4 mr-1" />
                    Visszaállítás
                  </Button>
                </div>
                <p className="text-sm">{version.description}</p>
                {version.changes.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {version.changes.length} változás: {' '}
                    {version.changes.filter(c => c.type === 'addition').length} hozzáadás, {' '}
                    {version.changes.filter(c => c.type === 'deletion').length} törlés, {' '}
                    {version.changes.filter(c => c.type === 'modification').length} módosítás
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nincs verzió történet</p>
            <p className="text-sm">Generálj kódot a verziókövetés indításához</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderAIOptimizations = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Optimalizációk
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {generatedComponents.map((component) => {
          const aiOptimization = (component.metadata as any)?.aiOptimization;
          if (!aiOptimization) return null;

          return (
            <div key={component.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{component.name}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Pontszám: {aiOptimization.performanceScore}</Badge>
                  <Badge variant="secondary">-{aiOptimization.bundleSizeReduction}% méret</Badge>
                </div>
              </div>

              <div className="space-y-2">
                {aiOptimization.improvements.map((improvement: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-2 bg-muted rounded">
                    {improvement.type === 'performance' && <Zap className="h-4 w-4 text-yellow-500 mt-0.5" />}
                    {improvement.type === 'accessibility' && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />}
                    {improvement.type === 'security' && <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />}

                    <div className="flex-1">
                      <p className="text-sm font-medium">{improvement.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            improvement.impact === 'high' ? 'destructive' :
                            improvement.impact === 'medium' ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {improvement.impact} hatás
                        </Badge>
                        {improvement.autoFixed && (
                          <Badge variant="outline" className="text-xs">
                            Automatikusan javítva
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {generatedComponents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Generálj kódot az AI optimalizációk megtekintéséhez</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderEnhancedCodePreview = () => (
    <div className="space-y-6">
      {generatedComponents.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium">Komponens kiválasztása:</span>
            <div className="flex gap-2">
              {generatedComponents.map((component) => (
                <Button
                  key={component.id}
                  variant={selectedComponent?.id === component.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedComponent(component);
                    const history = versionControl.getVersionHistory(component.id);
                    setVersionHistory(history);
                  }}
                >
                  {component.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Összes Exportálása
            </Button>
            <Button size="sm" variant="outline">
              <Code className="h-4 w-4 mr-1" />
              Kód Másolása
            </Button>
          </div>
        </div>
      )}

      {selectedComponent && (
        <Tabs defaultValue="jsx" className="w-full">
          <TabsList>
            <TabsTrigger value="jsx">JSX</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
            {(selectedComponent as any).typescript && <TabsTrigger value="typescript">TypeScript</TabsTrigger>}
            {(selectedComponent as any).tests && <TabsTrigger value="tests">Tesztek</TabsTrigger>}
            {(selectedComponent as any).storybook && <TabsTrigger value="storybook">Storybook</TabsTrigger>}
          </TabsList>

          <TabsContent value="jsx">
            <Card>
              <CardHeader>
                <CardTitle>JSX Kód</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{selectedComponent.jsx}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="css">
            <Card>
              <CardHeader>
                <CardTitle>CSS Stílusok</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{selectedComponent.css}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {(selectedComponent as any).typescript && (
            <TabsContent value="typescript">
              <Card>
                <CardHeader>
                  <CardTitle>TypeScript Definíciók</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{(selectedComponent as any).typescript}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {(selectedComponent as any).tests && (
            <TabsContent value="tests">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5" />
                    Unit Tesztek
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{(selectedComponent as any).tests}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {(selectedComponent as any).storybook && (
            <TabsContent value="storybook">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Storybook Stories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{(selectedComponent as any).storybook}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}

      {generatedComponents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nincs generált kód
            </h3>
            <p className="text-gray-500 mb-4">
              Használd a "Generálás" fület a komponensek létrehozásához.
            </p>
            <Button onClick={() => setActiveTab('generate')}>
              Kódgenerálás Indítása
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="info" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Fájl Info</span>
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Generálás</span>
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center space-x-2">
            <Code className="w-4 h-4" />
            <span>Kód</span>
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4" />
            <span>Verziók</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>AI Optimalizálás</span>
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Minőség</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center space-x-2">
            <Image className="w-4 h-4" />
            <span>Élő Előnézet</span>
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Dokumentáció</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Visszajelzés</span>
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="flex items-center space-x-2">
            <Play className="w-4 h-4" />
            <span>Folyamat</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          {/* Fájl Alapadatok */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Figma Fájl Részletek</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Fájl neve</h4>
                  <p className="text-gray-600">{figmaData.name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Verzió</h4>
                  <p className="text-gray-600">{figmaData.version}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Utolsó módosítás</h4>
                  <p className="text-gray-600 flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(figmaData.lastModified).toLocaleDateString('hu-HU')}</span>
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Szerkesztő típus</h4>
                  <p className="text-gray-600 flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{figmaData.editorType}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{components}</div>
                  <div className="text-sm text-gray-500">Komponensek</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{styles}</div>
                  <div className="text-sm text-gray-500">Stílusok</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{totalNodes}</div>
                  <div className="text-sm text-gray-500">Elemek</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Komponensek listája */}
          {components > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Layers className="w-5 h-5" />
                  <span>Elérhető Komponensek</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(figmaData.components || {}).map(([key, component]) => (
                    <div key={key} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <h4 className="font-medium text-sm">{component.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{component.description || 'Nincs leírás'}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {key.substring(0, 8)}...
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="generate">
          <CodeGenerationPanel 
            onGenerate={handleCodeGeneration}
            isGenerating={isGenerating}
          />
        </TabsContent>

        <TabsContent value="code">
          {renderEnhancedCodePreview()}
        </TabsContent>

        <TabsContent value="versions">
          {renderVersionHistory()}
        </TabsContent>

        <TabsContent value="ai">
          {renderAIOptimizations()}
        </TabsContent>

        <TabsContent value="quality">
          <div className="space-y-6">
            {generatedComponents.length > 0 ? (
              generatedComponents.map((component) => (
                <QualityReport 
                  key={component.id}
                  component={component}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Generálj kódot a minőségi jelentés megtekintéséhez</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <LivePreview 
            generatedCode={generatedComponents.length > 0 ? generatedComponents[0].jsx : ''}
            isActive={livePreviewActive}
            onToggle={() => setLivePreviewActive(!livePreviewActive)}
          />
        </TabsContent>

        <TabsContent value="docs">
          <div className="space-y-6">
            {generatedComponents.length > 0 && (
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Dokumentáció generálása:</span>
                <div className="flex space-x-2">
                  {generatedComponents.map((component, index) => (
                    <Button
                      key={component.id}
                      variant={selectedComponentForDocs?.id === component.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedComponentForDocs(component)}
                    >
                      {component.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {selectedComponentForDocs && (
              <DocumentationGenerator component={selectedComponentForDocs} />
            )}

            {!selectedComponentForDocs && generatedComponents.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Generálj kódot a dokumentáció létrehozásához</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <div className="space-y-6">
            {generatedComponents.map((component) => (
              <FeedbackSystem 
                key={component.id}
                componentId={component.id}
                generatedCode={component.jsx}
              />
            ))}

            {generatedComponents.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Generálj kódot a visszajelzés adásához</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pipeline">
          <ProcessingPipeline isProcessing={isGenerating} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

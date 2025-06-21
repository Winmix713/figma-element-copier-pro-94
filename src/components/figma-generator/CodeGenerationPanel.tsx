
"use client";

import { useState, useCallback } from "react";
import { FigmaApiResponse, CodeGenerationOptions, CustomCodeInputs } from "@/types/figma";
import { VersionControlService } from "@/services/version-control";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Code2, 
  Palette, 
  Zap, 
  Shield, 
  Smartphone, 
  FileText, 
  TestTube, 
  BookOpen,
  Settings,
  Download,
  Eye,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info
} from "lucide-react";

interface CodeGenerationPanelProps {
  figmaData: FigmaApiResponse;
  fileKey: string;
  onGenerate: (options: CodeGenerationOptions, customCode: CustomCodeInputs) => Promise<void>;
  generatedComponents?: any[];
  isGenerating?: boolean;
}

const defaultOptions: CodeGenerationOptions = {
  framework: 'react',
  styling: 'tailwind',
  typescript: true,
  accessibility: true,
  responsive: true,
  optimizeImages: false,
  generateStorybook: false,
  generateTests: false
};

const defaultCustomCode: CustomCodeInputs = {
  jsx: '',
  css: '',
  cssAdvanced: '',
  typescript: '',
  tests: '',
  storybook: '',
  hooks: '',
  utils: ''
};

export function CodeGenerationPanel({
  figmaData,
  fileKey,
  onGenerate,
  generatedComponents = [],
  isGenerating = false,
}: CodeGenerationPanelProps) {
  const [options, setOptions] = useState<CodeGenerationOptions>(defaultOptions);
  const [customCode, setCustomCode] = useState<CustomCodeInputs>(defaultCustomCode);
  const [activeTab, setActiveTab] = useState("options");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleOptionChange = useCallback((key: keyof CodeGenerationOptions, value: boolean | string) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleCustomCodeChange = useCallback((key: keyof CustomCodeInputs, value: string) => {
    setCustomCode(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleGenerate = useCallback(async () => {
    try {
      await onGenerate(options, customCode);
    } catch (error) {
      console.error('Code generation failed:', error);
    }
  }, [options, customCode, onGenerate]);

  const resetToDefaults = useCallback(() => {
    setOptions(defaultOptions);
    setCustomCode(defaultCustomCode);
  }, []);

  const getEstimatedTime = useCallback(() => {
    let baseTime = 5; // seconds
    if (options.typescript) baseTime += 2;
    if (options.generateTests) baseTime += 3;
    if (options.generateStorybook) baseTime += 2;
    if (options.accessibility) baseTime += 1;
    return baseTime;
  }, [options]);

  const getComplexityScore = useCallback(() => {
    let score = 1;
    if (customCode.jsx) score += 1;
    if (customCode.css || customCode.cssAdvanced) score += 1;
    if (options.generateTests) score += 1;
    if (options.generateStorybook) score += 1;
    return Math.min(score, 5);
  }, [options, customCode]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              Enhanced Code Generation
            </CardTitle>
            <CardDescription>
              Generate high-quality React components from your Figma designs
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {figmaData.components ? Object.keys(figmaData.components).length : 0} Components
            </Badge>
            {generatedComponents.length > 0 && (
              <Badge variant="secondary" className="text-sm">
                {generatedComponents.length} Generated
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="custom">Custom Code</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="options" className="space-y-6">
            {/* Framework Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Framework</Label>
              <Select
                value={options.framework}
                onValueChange={(value) => handleOptionChange('framework', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="vue">Vue.js</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Styling Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Styling</Label>
              <Select
                value={options.styling}
                onValueChange={(value) => handleOptionChange('styling', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                  <SelectItem value="css-modules">CSS Modules</SelectItem>
                  <SelectItem value="styled-components">Styled Components</SelectItem>
                  <SelectItem value="plain-css">Plain CSS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Feature Options */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Features</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="typescript"
                    checked={options.typescript}
                    onCheckedChange={(checked) => handleOptionChange('typescript', checked === true)}
                  />
                  <Label htmlFor="typescript" className="flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    TypeScript
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accessibility"
                    checked={options.accessibility}
                    onCheckedChange={(checked) => handleOptionChange('accessibility', checked === true)}
                  />
                  <Label htmlFor="accessibility" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Accessibility
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="responsive"
                    checked={options.responsive}
                    onCheckedChange={(checked) => handleOptionChange('responsive', checked === true)}
                  />
                  <Label htmlFor="responsive" className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Responsive Design
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="optimizeImages"
                    checked={options.optimizeImages}
                    onCheckedChange={(checked) => handleOptionChange('optimizeImages', checked === true)}
                  />
                  <Label htmlFor="optimizeImages" className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Optimize Images
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="generateTests"
                    checked={options.generateTests}
                    onCheckedChange={(checked) => handleOptionChange('generateTests', checked === true)}
                  />
                  <Label htmlFor="generateTests" className="flex items-center gap-2">
                    <TestTube className="w-4 h-4" />
                    Generate Tests
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="generateStorybook"
                    checked={options.generateStorybook}
                    onCheckedChange={(checked) => handleOptionChange('generateStorybook', checked === true)}
                  />
                  <Label htmlFor="generateStorybook" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Generate Storybook
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="jsx">Custom JSX</Label>
                <Textarea
                  id="jsx"
                  placeholder="// Add custom JSX logic here..."
                  value={customCode.jsx}
                  onChange={(e) => handleCustomCodeChange('jsx', e.target.value)}
                  className="h-32"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="css">Custom CSS</Label>
                <Textarea
                  id="css"
                  placeholder="/* Add custom CSS styles here... */"
                  value={customCode.css}
                  onChange={(e) => handleCustomCodeChange('css', e.target.value)}
                  className="h-32"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="hooks">Custom Hooks</Label>
                <Textarea
                  id="hooks"
                  placeholder="// Add custom React hooks here..."
                  value={customCode.hooks}
                  onChange={(e) => handleCustomCodeChange('hooks', e.target.value)}
                  className="h-32"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="utils">Utility Functions</Label>
                <Textarea
                  id="utils"
                  placeholder="// Add utility functions here..."
                  value={customCode.utils}
                  onChange={(e) => handleCustomCodeChange('utils', e.target.value)}
                  className="h-32"
                />
              </div>
            </div>

            {showAdvanced && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <Label className="text-base font-medium">Advanced Custom Code</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="cssAdvanced">Advanced CSS++</Label>
                    <Textarea
                      id="cssAdvanced"
                      placeholder="/* Advanced CSS features: Grid, Animations, etc. */"
                      value={customCode.cssAdvanced}
                      onChange={(e) => handleCustomCodeChange('cssAdvanced', e.target.value)}
                      className="h-24"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="typescript">TypeScript Definitions</Label>
                    <Textarea
                      id="typescript"
                      placeholder="// Custom TypeScript interfaces and types..."
                      value={customCode.typescript}
                      onChange={(e) => handleCustomCodeChange('typescript', e.target.value)}
                      className="h-24"
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Preview shows estimated generation parameters and complexity analysis.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Estimated Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getEstimatedTime()}s</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Complexity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{getComplexityScore()}/5</div>
                    <Progress value={(getComplexityScore() / 5) * 100} className="flex-1" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {figmaData.components ? Object.keys(figmaData.components).length : 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Advanced settings for expert users. These options may affect generation quality.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={resetToDefaults}
                className="w-full"
              >
                Reset to Defaults
              </Button>

              <Separator />

              <div className="space-y-3">
                <Label className="text-base font-medium">Generation Report</Label>
                <div className="text-sm text-muted-foreground">
                  <p>Framework: {options.framework}</p>
                  <p>Styling: {options.styling}</p>
                  <p>Features: {Object.entries(options).filter(([_, value]) => value === true).length} enabled</p>
                  <p>Custom Code: {Object.values(customCode).filter(value => value.trim().length > 0).length} sections</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Generation Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4" />
            Ready to generate
          </div>
          
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !figmaData}
            size="lg"
            className="min-w-[140px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Code
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

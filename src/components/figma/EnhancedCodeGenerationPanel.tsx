import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Code, Settings, Edit, Eye, Play } from "lucide-react";
import type { FigmaApiResponse } from "@shared/types/figma";
import type { CodeGenerationOptions, CustomCodeInputs } from "@shared/types/generation";

interface EnhancedCodeGenerationPanelProps {
  figmaData: FigmaApiResponse;
  fileKey: string;
  onGenerate: (options: CodeGenerationOptions, customCode: CustomCodeInputs) => Promise<void>;
}

export function EnhancedCodeGenerationPanel({
  figmaData,
  fileKey,
  onGenerate,
}: EnhancedCodeGenerationPanelProps) {
  const [options, setOptions] = useState<CodeGenerationOptions>({
    framework: 'react',
    styling: 'tailwind',
    typescript: true,
    accessibility: true,
    responsive: true,
    optimizeImages: false,
    generateStorybook: false,
    generateTests: false,
  });

  const [customCode, setCustomCode] = useState<CustomCodeInputs>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await onGenerate(options, customCode);
      setGenerationProgress(100);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
        clearInterval(progressInterval);
      }, 1000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Code className="w-5 h-5 text-gray-500" />
          <span>Enhanced Code Generation</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="options" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="options" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Options</span>
            </TabsTrigger>
            <TabsTrigger value="custom-code" className="flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>Custom Code</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="options" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">Framework</Label>
                <Select
                  value={options.framework}
                  onValueChange={(value: 'react' | 'vue' | 'angular' | 'html') =>
                    setOptions({ ...options, framework: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="react">React + TypeScript</SelectItem>
                    <SelectItem value="vue">Vue.js</SelectItem>
                    <SelectItem value="angular">Angular</SelectItem>
                    <SelectItem value="html">HTML + CSS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">CSS Framework</Label>
                <Select
                  value={options.styling}
                  onValueChange={(value: 'tailwind' | 'css-modules' | 'styled-components' | 'plain-css') =>
                    setOptions({ ...options, styling: value })
                  }
                >
                  <SelectTrigger className="mt-2">
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
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'typescript', label: 'TypeScript' },
                { key: 'accessibility', label: 'Accessibility' },
                { key: 'responsive', label: 'Responsive' },
                { key: 'optimizeImages', label: 'Optimize Images' },
                { key: 'generateTests', label: 'Generate Tests' },
                { key: 'generateStorybook', label: 'Storybook' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={options[key as keyof CodeGenerationOptions] as boolean}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, [key]: checked })
                    }
                  />
                  <Label htmlFor={key} className="text-sm text-gray-700">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom-code" className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Custom JSX</Label>
              <Textarea
                className="mt-2 font-mono text-sm"
                rows={4}
                placeholder="// Add custom JSX code here..."
                value={customCode.jsx || ''}
                onChange={(e) => setCustomCode({ ...customCode, jsx: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Custom CSS</Label>
              <Textarea
                className="mt-2 font-mono text-sm"
                rows={4}
                placeholder="/* Add custom CSS here... */"
                value={customCode.css || ''}
                onChange={(e) => setCustomCode({ ...customCode, css: e.target.value })}
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="text-center py-12 text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Generated code preview will appear here</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg py-4 text-lg font-semibold"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Generate Enhanced Components
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="space-y-4 mt-4">
              <Progress value={generationProgress} className="w-full" />
              <p className="text-center text-gray-600">
                Processing... {generationProgress}%
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

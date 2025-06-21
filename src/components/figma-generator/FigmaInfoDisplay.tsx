
import React, { useState, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Settings,
  Code,
  GitBranch,
  Sparkles,
  CheckCircle,
  Image,
  MessageSquare,
  Play
} from 'lucide-react';
import { FigmaApiResponse, GeneratedComponent } from '@/types/figma';
import { CodeGenerationOptions, CustomCodeInputs } from '@/types/generation';
import { EnhancedCodeGenerationPanel } from '../enhanced-code-generation-panel';
import { FigmaFileDetails } from './FigmaFileDetails';

interface FigmaInfoDisplayProps {
  figmaData: FigmaApiResponse;
  fileKey: string;
}

export function FigmaInfoDisplay({ figmaData, fileKey }: FigmaInfoDisplayProps) {
  const [generatedComponents, setGeneratedComponents] = useState<GeneratedComponent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const handleCodeGeneration = useCallback(async (options: CodeGenerationOptions, customCode: CustomCodeInputs) => {
    setIsGenerating(true);
    try {
      if (!figmaData) {
        throw new Error('No Figma data loaded');
      }

      const { EnhancedCodeGenerator } = await import('@/services/enhanced-code-generator');
      const generator = new EnhancedCodeGenerator(figmaData, options);
      generator.setCustomCode(customCode);

      const components = await generator.generateComponents();
      setGeneratedComponents(components);
      setActiveTab('code');
    } catch (error) {
      console.error('Code generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [figmaData]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="info" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>File Info</span>
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Generate</span>
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center space-x-2">
            <Code className="w-4 h-4" />
            <span>Code</span>
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4" />
            <span>Versions</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>AI Optimization</span>
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Quality</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <FigmaFileDetails figmaData={figmaData} />
        </TabsContent>

        <TabsContent value="generate">
          <EnhancedCodeGenerationPanel 
            figmaData={figmaData}
            fileKey={fileKey}
            onGenerate={handleCodeGeneration}
          />
        </TabsContent>

        <TabsContent value="code">
          <div className="text-center py-12 text-gray-500">
            <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Generated code will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="versions">
          <div className="text-center py-12 text-gray-500">
            <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Version history will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <div className="text-center py-12 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>AI optimizations will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="quality">
          <div className="text-center py-12 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Quality reports will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

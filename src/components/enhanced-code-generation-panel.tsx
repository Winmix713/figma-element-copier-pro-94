
import React from 'react';
import { FigmaApiResponse, CodeGenerationOptions, CustomCodeInputs } from '@/types/figma';

interface EnhancedCodeGenerationPanelProps {
  figmaData: FigmaApiResponse;
  fileKey: string;
  onGenerate: (options: CodeGenerationOptions, customCode: CustomCodeInputs) => Promise<void>;
}

export function EnhancedCodeGenerationPanel({ 
  figmaData, 
  fileKey, 
  onGenerate 
}: EnhancedCodeGenerationPanelProps) {
  const handleGenerate = async () => {
    const options: CodeGenerationOptions = {
      framework: 'react',
      styling: 'tailwind',
      typescript: true,
      accessibility: true,
      responsive: true,
      optimizeImages: false,
      generateStorybook: false,
      generateTests: false
    };

    const customCode: CustomCodeInputs = {};

    await onGenerate(options, customCode);
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Enhanced Code Generation</h3>
      <button 
        onClick={handleGenerate}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Generate Components
      </button>
    </div>
  );
}

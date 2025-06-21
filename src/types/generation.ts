
// Component generation and processing types
export interface GeneratedComponent {
  id: string;
  name: string;
  jsx: string;
  css: string;
  tailwind?: string;
  typescript?: string;
  tests?: string;
  storybook?: string;
  accessibility: AccessibilityReport;
  responsive: ResponsiveBreakpoints;
  metadata: ComponentMetadata;
}

export interface AccessibilityReport {
  score: number;
  issues: AccessibilityIssue[];
  suggestions: string[];
  wcagCompliance: 'AA' | 'A' | 'Non-compliant';
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  element: string;
  fix: string;
}

export interface ResponsiveBreakpoints {
  mobile: string;
  tablet: string;
  desktop: string;
  hasResponsiveDesign: boolean;
}

export interface ComponentMetadata {
  figmaNodeId: string;
  componentType: 'button' | 'card' | 'text' | 'input' | 'layout' | 'complex';
  complexity: 'simple' | 'medium' | 'complex';
  estimatedAccuracy: number;
  generationTime: number;
  dependencies: string[];
  aiOptimization?: {
    performanceScore: number;
    bundleSizeReduction: number;
    improvements: Array<{
      type: 'performance' | 'accessibility' | 'security';
      description: string;
      impact: 'low' | 'medium' | 'high';
      autoFixed: boolean;
    }>;
  };
}

export interface ProcessingPhase {
  id: number;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  startTime?: number;
  endTime?: number;
  error?: string;
}

export interface GenerationConfig {
  framework: 'react' | 'vue' | 'html';
  styling: 'tailwind' | 'css-modules' | 'styled-components' | 'plain-css';
  typescript: boolean;
  accessibility: boolean;
  responsive: boolean;
  optimizeImages: boolean;
  generateStorybook: boolean;
}

export interface QualityReport {
  overallScore: number;
  visualAccuracy: number;
  codeQuality: number;
  accessibility: number;
  performance: number;
  recommendations: string[];
}

export interface ConversionOptions {
  includeHiddenElements?: boolean;
  preserveAbsolutePositioning?: boolean;
  maxDepth?: number;
  customElementHandlers?: Map<string, (element: HTMLElement) => FigmaNode | null>;
}

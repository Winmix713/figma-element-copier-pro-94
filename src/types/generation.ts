
// Component generation and AI optimization types
export interface GeneratedComponent {
  id: string;
  name: string;
  jsx: string;
  css: string;
  tailwind: string;
  typescript?: string;
  tests?: string;
  storybook?: string;
  accessibility: AccessibilityReport;
  responsive: ResponsiveBreakpoints;
  metadata: ComponentMetadata;
}

export interface ComponentMetadata {
  figmaNodeId: string;
  componentType: 'button' | 'card' | 'text' | 'input' | 'layout' | 'complex';
  complexity: 'simple' | 'medium' | 'complex';
  estimatedAccuracy: number;
  generationTime: number;
  dependencies: string[];
}

export interface AccessibilityReport {
  score: number;
  issues: AccessibilityIssue[];
  suggestions: string[];
  wcagCompliance: 'A' | 'AA' | 'AAA';
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  element?: string;
  fix?: string;
}

export interface ResponsiveBreakpoints {
  mobile: string;
  tablet: string;
  desktop: string;
  hasResponsiveDesign: boolean;
}

export interface AIOptimizationResult {
  performanceScore: number;
  bundleSizeReduction: number;
  improvements: AIImprovement[];
  appliedOptimizations: string[];
}

export interface AIImprovement {
  type: 'performance' | 'accessibility' | 'security' | 'best-practice';
  description: string;
  impact: 'low' | 'medium' | 'high';
  autoFixed: boolean;
}

export interface CodeGenerationOptions {
  framework: 'react' | 'vue' | 'html';
  styling: 'tailwind' | 'css-modules' | 'styled-components' | 'plain-css';
  typescript: boolean;
  accessibility: boolean;
  responsive: boolean;
  optimizeImages: boolean;
  generateStorybook: boolean;
  generateTests: boolean;
}

export interface CustomCodeInputs {
  jsx?: string;
  css?: string;
  cssAdvanced?: string;
  typescript?: string;
  tests?: string;
  storybook?: string;
  hooks?: string;
  utils?: string;
}

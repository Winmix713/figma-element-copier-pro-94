import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Clipboard, 
  CheckCircle, 
  Book,
  Code,
  Palette,
  Shield,
  Smartphone
} from 'lucide-react';
import type { GeneratedComponent } from '@shared/types/figma';

interface DocumentationGeneratorProps {
  component: GeneratedComponent;
}

export function DocumentationGenerator({ component }: DocumentationGeneratorProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const generateReadme = () => {
    return `# ${component.name}

A ${component.metadata.componentType} component generated from Figma design.

## Overview
This component was automatically generated with ${component.metadata.estimatedAccuracy}% accuracy and has been optimized for accessibility and responsive design.

## Props
\`\`\`typescript
interface ${component.name}Props {
  // Props will be automatically detected and added
  className?: string;
  children?: React.ReactNode;
}
\`\`\`

## Usage
\`\`\`tsx
import { ${component.name} } from './${component.name}';

export default function Example() {
  return (
    <${component.name} className="your-custom-class">
      Your content here
    </${component.name}>
  );
}
\`\`\`

## Accessibility
- WCAG ${component.accessibility.wcagCompliance} compliant
- Accessibility score: ${component.accessibility.score}%
- Screen reader compatible: ${component.accessibility.screenReaderCompatible ? 'Yes' : 'No'}
- Keyboard navigation: ${component.accessibility.keyboardNavigation ? 'Yes' : 'No'}

## Responsive Design
${component.responsive.hasResponsiveDesign ? 
  `This component is responsive and includes breakpoints for:
- Mobile: ${component.responsive.mobile}
- Tablet: ${component.responsive.tablet}  
- Desktop: ${component.responsive.desktop}` : 
  'This component does not include responsive design. Consider adding breakpoints for better mobile experience.'}

## Dependencies
${Object.entries(component.metadata.dependencies).map(([name, version]) => `- ${name}: ${version}`).join('\n')}

## Complexity
Complexity Level: ${component.metadata.complexity}
Generation Time: ${component.metadata.generationTime}ms

## Notes
${component.accessibility.suggestions.length > 0 ? `
### Accessibility Improvements
${component.accessibility.suggestions.map(suggestion => `- ${suggestion}`).join('\n')}
` : ''}

Generated on: ${new Date().toLocaleDateString()}
`;
  };

  const generateAPIDoc = () => {
    return `# ${component.name} API Documentation

## Component API

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| className | string | undefined | Additional CSS classes |
| children | ReactNode | undefined | Child components |

### Styling
The component uses the following CSS classes:
\`\`\`css
${component.css || '/* CSS classes will be automatically extracted */'}
\`\`\`

### Accessibility
- ARIA labels: ${component.accessibility.ariaLabels?.join(', ') || 'Auto-generated'}
- Role: Automatically determined
- Keyboard support: ${component.accessibility.keyboardNavigation ? 'Full' : 'Basic'}

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers
- Screen readers

### Performance
- Lightweight: ${component.code.length} bytes
- Render time: ~${component.metadata.generationTime}ms
- No external dependencies beyond React
`;
  };

  const generateStyleGuide = () => {
    return `# ${component.name} Style Guide

## Design System Integration

### Component Type
${component.metadata.componentType}

### Visual Specifications
- Complexity: ${component.metadata.complexity}
- Framework: ${component.metadata.framework || 'React'}
- Styling: ${component.metadata.styling || 'CSS'}

### Color Palette
\`\`\`css
/* Colors will be automatically extracted from design */
--primary: /* Extracted from Figma */
--secondary: /* Extracted from Figma */
--accent: /* Extracted from Figma */
\`\`\`

### Typography
\`\`\`css
/* Typography will be automatically extracted */
font-family: /* From Figma design */
font-size: /* From Figma design */
font-weight: /* From Figma design */
\`\`\`

### Spacing
\`\`\`css
/* Spacing values from design */
--spacing-sm: /* Extracted */
--spacing-md: /* Extracted */
--spacing-lg: /* Extracted */
\`\`\`

### Responsive Breakpoints
${component.responsive.breakpoints ? 
  Object.entries(component.responsive.breakpoints).map(([key, value]) => `- ${key}: ${value}`).join('\n') :
  '- sm: 640px\n- md: 768px\n- lg: 1024px\n- xl: 1280px'}

### States
- Default: Base component state
- Hover: Interactive feedback
- Focus: Keyboard navigation
- Disabled: Non-interactive state

### Variants
The component supports these variants:
- Primary
- Secondary
- Outline
- Ghost

### Usage Guidelines
1. Always include proper alt text for images
2. Ensure sufficient color contrast
3. Test with keyboard navigation
4. Verify mobile responsiveness
`;
  };

  const downloadDocumentation = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${component.name}-${filename}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Documentation Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="readme" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="readme" className="flex items-center space-x-2">
              <Book className="w-4 h-4" />
              <span>README</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center space-x-2">
              <Code className="w-4 h-4" />
              <span>API Docs</span>
            </TabsTrigger>
            <TabsTrigger value="style" className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Style Guide</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="readme" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">README Documentation</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateReadme(), 'readme')}
                >
                  {copiedSection === 'readme' ? (
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
                  onClick={() => downloadDocumentation(generateReadme(), 'README')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">{generateReadme()}</pre>
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">API Documentation</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateAPIDoc(), 'api')}
                >
                  {copiedSection === 'api' ? (
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
                  onClick={() => downloadDocumentation(generateAPIDoc(), 'API')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">{generateAPIDoc()}</pre>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Style Guide</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateStyleGuide(), 'style')}
                >
                  {copiedSection === 'style' ? (
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
                  onClick={() => downloadDocumentation(generateStyleGuide(), 'StyleGuide')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">{generateStyleGuide()}</pre>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="font-semibold">WCAG {component.accessibility.wcagCompliance}</div>
              <div className="text-sm text-gray-600">Compliant</div>
            </div>
            <div className="text-center">
              <Smartphone className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold">{component.responsive.hasResponsiveDesign ? 'Yes' : 'No'}</div>
              <div className="text-sm text-gray-600">Responsive</div>
            </div>
            <div className="text-center">
              <Code className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="font-semibold">{component.metadata.framework || 'React'}</div>
              <div className="text-sm text-gray-600">Framework</div>
            </div>
            <div className="text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="font-semibold">{component.code.split('\n').length}</div>
              <div className="text-sm text-gray-600">Lines of Code</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Code, 
  BookOpen, 
  Clipboard,
  CheckCircle
} from 'lucide-react';
import { GeneratedComponent } from '@/types/figma';

interface DocumentationGeneratorProps {
  component: GeneratedComponent;
}

export function DocumentationGenerator({ component }: DocumentationGeneratorProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const generateReadme = () => {
    return `# ${component.name}

## Leírás
Automatikusan generált React komponens Figma tervből.

## Használat

\`\`\`jsx
import { ${component.name} } from './${component.name}';

function App() {
  return (
    <div>
      <${component.name} />
    </div>
  );
}
\`\`\`

## Props

| Prop | Típus | Alapértelmezett | Leírás |
|------|-------|----------------|--------|
| className | string | - | További CSS osztályok |
| children | ReactNode | - | Gyermek elemek |

## Stílusok

A komponens ${component.metadata.componentType} típusú, ${component.metadata.complexity} komplexitással.

## Accessibility

- WCAG megfelelőség: ${component.accessibility.wcagCompliance}
- Accessibility pontszám: ${component.accessibility.score}/100

### Accessibility fejlesztések:
${component.accessibility.suggestions.map(suggestion => `- ${suggestion}`).join('\n')}

## Responsive Design

${component.responsive.hasResponsiveDesign ? 
  `A komponens responsive dizájnnal rendelkezik:
- Mobile: ${component.responsive.mobile}
- Tablet: ${component.responsive.tablet}  
- Desktop: ${component.responsive.desktop}` : 
  'A komponens nem tartalmaz responsive dizájnt.'
}

## Függőségek

\`\`\`json
${JSON.stringify(component.metadata.dependencies, null, 2)}
\`\`\`

## Metaadatok

- **Figma Node ID:** \`${component.metadata.figmaNodeId}\`
- **Generálás ideje:** ${component.metadata.generationTime}ms
- **Becsült pontosság:** ${component.metadata.estimatedAccuracy}%
- **Komplexitás:** ${component.metadata.complexity}

---

*Ez a dokumentáció automatikusan lett generálva a Figma-to-Code Generator által.*
`;
  };

  const generateStorybook = () => {
    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${component.name} } from './${component.name}';

const meta: Meta<typeof ${component.name}> = {
  title: 'Components/${component.name}',
  component: ${component.name},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Automatikusan generált komponens Figma tervből.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: { type: 'text' }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class'
  }
};

export const Responsive: Story = {
  parameters: {
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1200px', height: '800px' } }
      }
    }
  }
};
`;
  };

  const generateJSDoc = () => {
    return `/**
 * ${component.name} - Automatikusan generált React komponens
 * 
 * @description ${component.metadata.componentType} típusú komponens, 
 * ${component.metadata.complexity} komplexitással
 * 
 * @param {Object} props - Komponens props
 * @param {string} [props.className] - További CSS osztályok
 * @param {React.ReactNode} [props.children] - Gyermek elemek
 * 
 * @returns {JSX.Element} React komponens
 * 
 * @example
 * // Alapvető használat
 * <${component.name} />
 * 
 * @example  
 * // Egyéni osztállyal
 * <${component.name} className="my-custom-class" />
 * 
 * @accessibility WCAG ${component.accessibility.wcagCompliance} megfelelőség
 * @responsive ${component.responsive.hasResponsiveDesign ? 'Responsive dizájn támogatva' : 'Nincs responsive dizájn'}
 * @complexity ${component.metadata.complexity}
 * @accuracy ${component.metadata.estimatedAccuracy}%
 * 
 * @see {@link ${component.metadata.figmaNodeId}} Figma node ID
 */`;
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Dokumentáció Generátor</span>
          </CardTitle>
          <Badge variant="outline">
            <BookOpen className="w-4 h-4 mr-1" />
            Auto-generated
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="readme" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="readme">README.md</TabsTrigger>
            <TabsTrigger value="storybook">Storybook</TabsTrigger>
            <TabsTrigger value="jsdoc">JSDoc</TabsTrigger>
          </TabsList>

          <TabsContent value="readme" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">README.md</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateReadme(), 'readme')}
                >
                  {copiedSection === 'readme' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Másolva
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-4 h-4 mr-1" />
                      Másolás
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(generateReadme(), `${component.name}-README.md`)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Letöltés
                </Button>
              </div>
            </div>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm max-h-96">
              {generateReadme()}
            </pre>
          </TabsContent>

          <TabsContent value="storybook" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Storybook Story</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateStorybook(), 'storybook')}
                >
                  {copiedSection === 'storybook' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Másolva
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-4 h-4 mr-1" />
                      Másolás
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(generateStorybook(), `${component.name}.stories.ts`)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Letöltés
                </Button>
              </div>
            </div>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm max-h-96">
              {generateStorybook()}
            </pre>
          </TabsContent>

          <TabsContent value="jsdoc" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">JSDoc Kommentek</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateJSDoc(), 'jsdoc')}
                >
                  {copiedSection === 'jsdoc' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Másolva
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-4 h-4 mr-1" />
                      Másolás
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(generateJSDoc(), `${component.name}-jsdoc.js`)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Letöltés
                </Button>
              </div>
            </div>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm max-h-96">
              {generateJSDoc()}
            </pre>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Dokumentáció összefoglaló</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Komponens típus:</span> {component.metadata.componentType}
            </div>
            <div>
              <span className="text-blue-700">Komplexitás:</span> {component.metadata.complexity}
            </div>
            <div>
              <span className="text-blue-700">WCAG megfelelőség:</span> {component.accessibility.wcagCompliance}
            </div>
            <div>
              <span className="text-blue-700">Responsive:</span> {component.responsive.hasResponsiveDesign ? 'Igen' : 'Nem'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

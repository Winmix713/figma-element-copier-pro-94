
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info } from 'lucide-react';

interface HelpGuideProps {
  onLoadDemo: () => void;
  isLoading: boolean;
}

export function HelpGuide({ onLoadDemo, isLoading }: HelpGuideProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Info className="w-5 h-5" />
          <span>Quick Start Guide</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="getting-started">
          <TabsList>
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="demo">Demo Mode</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium">How to use:</h4>
              <ol className="space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                <li>Get your Figma file key from the URL</li>
                <li>Paste it in the input field above</li>
                <li>Click "Load File" to fetch your design</li>
                <li>Configure generation settings</li>
                <li>Click "Generate Enhanced Components"</li>
                <li>Download or copy your generated code</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="demo" className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium">Try the Demo:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Type "mock" in the file key input</li>
                <li>• Click "Load File" to load sample components</li>
                <li>• Experiment with different generation settings</li>
                <li>• See how custom code integration works</li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadDemo}
                disabled={isLoading}
              >
                Load Demo Data
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="troubleshooting" className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium">Common Issues:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  • <strong>Import errors:</strong> Check file paths and
                  component exports
                </li>
                <li>
                  • <strong>API errors:</strong> Verify Figma file permissions
                  and API setup
                </li>
                <li>
                  • <strong>Generation fails:</strong> Try the demo mode first
                </li>
                <li>
                  • <strong>Missing components:</strong> Check browser console
                  for detailed errors
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

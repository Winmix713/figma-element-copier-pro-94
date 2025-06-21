
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, RefreshCw, Monitor, Tablet, Smartphone } from 'lucide-react';

interface LivePreviewProps {
  generatedCode: string;
  isActive: boolean;
  onToggle: () => void;
}

export function LivePreview({ generatedCode, isActive, onToggle }: LivePreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);

  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getViewportClass = () => {
    switch (viewMode) {
      case 'mobile': return 'w-80 h-96';
      case 'tablet': return 'w-96 h-80';
      default: return 'w-full h-96';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Élő Előnézet</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Aktív" : "Inaktív"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggle}
            >
              {isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {isActive && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('desktop')}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('tablet')}
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('mobile')}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={forceRefresh}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {isActive ? (
          <div className="flex justify-center">
            <div className={`${getViewportClass()} border rounded-lg overflow-auto bg-white shadow-inner`}>
              <iframe
                key={refreshKey}
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                      <style>
                        body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
                        * { box-sizing: border-box; }
                      </style>
                    </head>
                    <body>
                      <div id="root"></div>
                      <script type="text/babel">
                        ${generatedCode}
                      </script>
                    </body>
                  </html>
                `}
                className="w-full h-full border-0"
                title="Live Preview"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <EyeOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Az élő előnézet ki van kapcsolva</p>
              <p className="text-sm">Kattints az aktiváláshoz</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

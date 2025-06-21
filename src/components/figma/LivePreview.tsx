import { useState } from 'react';
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

  const generatePreviewHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { 
              margin: 0; 
              padding: 16px; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: #f8fafc;
            }
            * { box-sizing: border-box; }
            .preview-container {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            const { useState, useEffect } = React;
            
            // Component code
            ${generatedCode}
            
            // Render the component
            function App() {
              return (
                <div className="preview-container">
                  <div className="max-w-md mx-auto">
                    {React.createElement(ButtonComponent || (() => React.createElement('div', {className: 'p-4 bg-white rounded-lg shadow'}, 'Component Preview')))}
                  </div>
                </div>
              );
            }
            
            ReactDOM.render(React.createElement(App), document.getElementById('root'));
          </script>
        </body>
      </html>
    `;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Live Preview</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
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
                srcDoc={generatePreviewHTML()}
                className="w-full h-full border-0"
                title="Live Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <EyeOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Preview is disabled</p>
              <p className="text-sm text-gray-400">Click the eye icon to enable</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
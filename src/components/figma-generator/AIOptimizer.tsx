
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Shield, 
  Accessibility, 
  CheckCircle,
  AlertTriangle,
  Code2
} from 'lucide-react';
import { AIOptimizationService, OptimizedCode, Suggestion } from '@/services/ai-optimizer';
import { GeneratedComponent } from '@/types/figma';

interface AIOptimizerProps {
  component: GeneratedComponent;
  onOptimize: (optimizedComponent: GeneratedComponent) => void;
}

export function AIOptimizer({ component, onOptimize }: AIOptimizerProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizedCode | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  const aiService = new AIOptimizationService();

  const handleOptimize = async () => {
    setIsOptimizing(true);
    
    try {
      const result = await aiService.optimizeCode(component.jsx, 'react');
      const componentSuggestions = aiService.suggestBestPractices(component);
      
      setOptimizationResult(result);
      setSuggestions(componentSuggestions);
      
      // Create optimized component
      const optimizedComponent: GeneratedComponent = {
        ...component,
        jsx: result.optimizedCode,
        metadata: {
          ...component.metadata,
          estimatedAccuracy: Math.min(100, component.metadata.estimatedAccuracy + result.performanceGains)
        }
      };
      
      onOptimize(optimizedComponent);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <span>AI Kód Optimalizáló</span>
          {optimizationResult && (
            <Badge variant="secondary" className="ml-auto">
              +{optimizationResult.performanceGains}% teljesítmény
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Optimization Button */}
          <div className="text-center">
            <Button
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
            >
              {isOptimizing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>AI Optimalizálás...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span>Kód Optimalizálása</span>
                </div>
              )}
            </Button>
          </div>

          {optimizationResult && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Áttekintés</TabsTrigger>
                <TabsTrigger value="improvements">Javítások</TabsTrigger>
                <TabsTrigger value="suggestions">Javaslatok</TabsTrigger>
                <TabsTrigger value="comparison">Összehasonlítás</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Teljesítmény</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      +{optimizationResult.performanceGains}%
                    </div>
                    <div className="text-sm text-green-700">javulás</div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Bundle méret</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      -{optimizationResult.bundleSizeReduction}%
                    </div>
                    <div className="text-sm text-blue-700">csökkentés</div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-800">Javítások</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {optimizationResult.improvements.length}
                    </div>
                    <div className="text-sm text-purple-700">optimalizálás</div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Optimalizálási jelentés</h4>
                  <p className="text-sm text-gray-600">
                    A kód sikeresen optimalizálva lett! A teljesítmény javulása <strong>{optimizationResult.performanceGains}%</strong>, 
                    a bundle mérete <strong>{optimizationResult.bundleSizeReduction}%</strong>-kal csökkent. 
                    Összesen <strong>{optimizationResult.improvements.length}</strong> javítás került alkalmazásra.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="improvements" className="space-y-4">
                <div className="space-y-3">
                  {optimizationResult.improvements.map((improvement, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        {getSeverityIcon(improvement.severity)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{improvement.description}</span>
                            <Badge variant="outline" className="text-xs">
                              {improvement.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Sor {improvement.line}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            Súlyosság: {improvement.severity} | 
                            {improvement.autoFixable ? ' Automatikusan javítva' : ' Kézi javítás szükséges'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-4">
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{suggestion.title}</h4>
                          <Badge className={`text-xs ${getImpactColor(suggestion.impact)}`}>
                            {suggestion.category}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.impact} hatás
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                      {suggestion.codeExample && (
                        <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                          {suggestion.codeExample}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center space-x-2">
                      <Code2 className="w-4 h-4" />
                      <span>Eredeti kód</span>
                    </h4>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">
                      {optimizationResult.originalCode}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Optimalizált kód</span>
                    </h4>
                    <pre className="bg-green-50 p-3 rounded text-xs overflow-auto max-h-64">
                      {optimizationResult.optimizedCode}
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

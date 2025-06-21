
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Cog, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Zap,
  FileCode,
  Palette,
  Eye
} from 'lucide-react';

interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  duration?: number;
  progress?: number;
}

interface ProcessingPipelineProps {
  isProcessing: boolean;
}

export function ProcessingPipeline({ isProcessing }: ProcessingPipelineProps) {
  const defaultSteps: ProcessingStep[] = [
    {
      id: 'parse',
      name: 'Figma adatok feldolgozása',
      status: isProcessing ? 'processing' : 'completed',
      progress: isProcessing ? 75 : 100,
      duration: 150
    },
    {
      id: 'analyze',
      name: 'Komponens elemzés',
      status: isProcessing ? 'processing' : 'completed',
      progress: isProcessing ? 60 : 100,
      duration: 200
    },
    {
      id: 'generate',
      name: 'Kód generálás',
      status: isProcessing ? 'processing' : 'completed',
      progress: isProcessing ? 40 : 100,
      duration: 300
    },
    {
      id: 'optimize',
      name: 'Optimalizálás',
      status: isProcessing ? 'pending' : 'completed',
      progress: isProcessing ? 0 : 100,
      duration: 100
    },
    {
      id: 'validate',
      name: 'Minőség ellenőrzés',
      status: isProcessing ? 'pending' : 'completed',
      progress: isProcessing ? 0 : 100,
      duration: 80
    }
  ];

  const getStepIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Cog className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepColor = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'processing':
        return 'border-blue-200 bg-blue-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const overallProgress = defaultSteps.reduce((acc, step) => {
    return acc + (step.progress || 0);
  }, 0) / defaultSteps.length;

  return (
    <div className="space-y-6">
      {/* Általános Állapot */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">Feldolgozási Pipeline</span>
            </div>
            <Badge variant={isProcessing ? "default" : "secondary"}>
              {isProcessing ? 'Feldolgozás...' : 'Kész'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Összesített előrehaladás</span>
              <span className="font-medium">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            
            {isProcessing && (
              <div className="text-sm text-gray-600">
                Becsült hátralevő idő: ~{Math.round((100 - overallProgress) * 0.05)} másodperc
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lépések Részletesen */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileCode className="w-5 h-5" />
            <span className="font-semibold">Feldolgozási Lépések</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {defaultSteps.map((step, index) => (
              <div
                key={step.id}
                className={`p-4 rounded-lg border ${getStepColor(step)} transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStepIcon(step)}
                    <div>
                      <h4 className="font-medium">{step.name}</h4>
                      {step.duration && (
                        <p className="text-sm text-gray-600">
                          Várható idő: {step.duration}ms
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {step.status === 'processing' && step.progress && (
                      <div className="w-24">
                        <Progress value={step.progress} className="h-1" />
                      </div>
                    )}
                    <Badge 
                      variant={
                        step.status === 'completed' ? 'default' :
                        step.status === 'processing' ? 'secondary' :
                        step.status === 'error' ? 'destructive' : 'outline'
                      }
                      className="text-xs"
                    >
                      {step.status === 'completed' ? 'Kész' :
                       step.status === 'processing' ? 'Folyamatban' :
                       step.status === 'error' ? 'Hiba' : 'Várakozik'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teljesítmény Statisztikák */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span className="font-semibold">Teljesítmény Metrikák</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Átlagos Feldolgozási Idő</div>
              <div className="text-lg font-bold text-blue-800">
                {isProcessing ? '~' : ''}{defaultSteps.reduce((acc, step) => acc + (step.duration || 0), 0)}ms
              </div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Sikerességi Arány</div>
              <div className="text-lg font-bold text-green-800">98.5%</div>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Feldolgozott Komponensek</div>
              <div className="text-lg font-bold text-purple-800">
                {defaultSteps.filter(step => step.status === 'completed').length}/{defaultSteps.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isProcessing && (
        <div className="text-center text-sm text-gray-600">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Folyamatos feldolgozás...</span>
          </div>
        </div>
      )}
    </div>
  );
}

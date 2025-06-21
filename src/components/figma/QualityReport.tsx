import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Info, Zap, Shield, Smartphone } from 'lucide-react';
import { GeneratedComponent } from '@shared/types/figma';
import { cn } from '@/lib/utils';

interface QualityReportProps {
  component: GeneratedComponent;
}

export function QualityReport({ component }: QualityReportProps) {
  const { accessibility, responsive, metadata } = component;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const qualityIssues = [
    ...(accessibility.score < 80 ? [{ type: 'warning' as const, message: 'Accessibility score could be improved' }] : []),
    ...(metadata.estimatedAccuracy < 85 ? [{ type: 'warning' as const, message: 'Visual accuracy may need refinement' }] : []),
    ...(!responsive.hasResponsiveDesign ? [{ type: 'info' as const, message: 'Consider adding responsive design' }] : []),
    ...(metadata.complexity === 'high' ? [{ type: 'info' as const, message: 'High complexity may affect maintainability' }] : [])
  ];

  const getIssueIcon = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
    }
  };

  const getIssueColor = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Quality Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Accuracy Score */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className={cn("p-2 rounded-lg", getScoreBg(metadata.estimatedAccuracy))}>
                  <Zap className={cn("w-5 h-5", getScoreColor(metadata.estimatedAccuracy))} />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Visual Accuracy</div>
                  <div className={cn("text-xl font-bold", getScoreColor(metadata.estimatedAccuracy))}>
                    {metadata.estimatedAccuracy}%
                  </div>
                </div>
              </div>
              <Progress value={metadata.estimatedAccuracy} className="h-2" />
            </div>

            {/* Accessibility Score */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className={cn("p-2 rounded-lg", getScoreBg(accessibility.score))}>
                  <Shield className={cn("w-5 h-5", getScoreColor(accessibility.score))} />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Accessibility</div>
                  <div className={cn("text-xl font-bold", getScoreColor(accessibility.score))}>
                    {accessibility.score}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Progress value={accessibility.score} className="h-2 flex-1 mr-2" />
                <Badge variant={accessibility.wcagCompliance === 'AA' ? 'default' : 'secondary'}>
                  WCAG {accessibility.wcagCompliance}
                </Badge>
              </div>
            </div>

            {/* Responsive Design */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  responsive.hasResponsiveDesign ? "bg-green-100" : "bg-gray-100"
                )}>
                  <Smartphone className={cn(
                    "w-5 h-5",
                    responsive.hasResponsiveDesign ? "text-green-600" : "text-gray-400"
                  )} />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Responsive Design</div>
                  <div className={cn(
                    "text-xl font-bold",
                    responsive.hasResponsiveDesign ? "text-green-600" : "text-gray-400"
                  )}>
                    {responsive.hasResponsiveDesign ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
              {responsive.hasResponsiveDesign && (
                <div className="space-y-1 text-xs text-gray-600">
                  <div>Mobile: {responsive.mobile}</div>
                  <div>Tablet: {responsive.tablet}</div>
                  <div>Desktop: {responsive.desktop}</div>
                </div>
              )}
            </div>
          </div>

          {/* Component Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{metadata.componentType}</div>
              <div className="text-sm text-gray-500">Type</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 capitalize">{metadata.complexity}</div>
              <div className="text-sm text-gray-500">Complexity</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{metadata.generationTime}ms</div>
              <div className="text-sm text-gray-500">Generation Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {Object.keys(metadata.dependencies).length}
              </div>
              <div className="text-sm text-gray-500">Dependencies</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Suggestions */}
      {accessibility.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Accessibility Improvements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accessibility.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-800">{suggestion}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quality Issues */}
      {qualityIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Quality Issues</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {qualityIssues.map((issue, index) => {
                const Icon = getIssueIcon(issue.type);
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", getIssueColor(issue.type))} />
                    <span className="text-sm text-gray-700">{issue.message}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dependencies */}
      <Card>
        <CardHeader>
          <CardTitle>Dependencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(metadata.dependencies).map(([name, version]) => (
              <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{name}</span>
                <Badge variant="outline">{version}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
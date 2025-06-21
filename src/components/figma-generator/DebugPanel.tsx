
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug } from 'lucide-react';

interface DebugInfo {
  lastAction: string;
  timestamp: Date;
  apiCalls: number;
  errors: string[];
}

interface DebugPanelProps {
  debugInfo: DebugInfo;
  generatedComponentsCount: number;
}

export function DebugPanel({ debugInfo, generatedComponentsCount }: DebugPanelProps) {
  const DEBUG = process.env.NODE_ENV === "development";
  
  if (!DEBUG) return null;

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-yellow-800">
          <Bug className="w-5 h-5" />
          <span>Debug Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-yellow-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Last Action:</strong> {debugInfo.lastAction}
          </div>
          <div>
            <strong>Timestamp:</strong>{" "}
            {debugInfo.timestamp.toLocaleTimeString()}
          </div>
          <div>
            <strong>API Calls:</strong> {debugInfo.apiCalls}
          </div>
          <div>
            <strong>Components:</strong> {generatedComponentsCount}
          </div>
        </div>
        {debugInfo.errors.length > 0 && (
          <div className="mt-2">
            <strong>Recent Errors:</strong>
            <ul className="list-disc list-inside mt-1 text-xs">
              {debugInfo.errors.slice(-3).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bug } from "lucide-react";
import type { DebugInfo } from "@shared/types/generation";

interface DebugPanelProps {
  debugInfo: DebugInfo;
  generatedComponentsCount: number;
}

export function DebugPanel({ debugInfo, generatedComponentsCount }: DebugPanelProps) {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <Bug className="w-4 h-4 text-gray-400" />
            <span>Debug Information</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Development Mode
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Last Action:</span>
            <span className="ml-2 font-medium">{debugInfo.lastAction}</span>
          </div>
          <div>
            <span className="text-gray-500">API Calls:</span>
            <span className="ml-2 font-medium">{debugInfo.apiCalls}</span>
          </div>
          <div>
            <span className="text-gray-500">Components:</span>
            <span className="ml-2 font-medium">{generatedComponentsCount}</span>
          </div>
          <div>
            <span className="text-gray-500">Timestamp:</span>
            <span className="ml-2 font-medium">
              {debugInfo.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

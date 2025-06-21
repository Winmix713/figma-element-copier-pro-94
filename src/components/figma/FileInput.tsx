import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { FileText, Download, Calendar, User } from "lucide-react";
import type { FigmaApiResponse } from "@shared/types/figma";
import type { DebugInfo } from "@shared/types/generation";

interface FileInputProps {
  fileKey: string;
  isLoading: boolean;
  figmaData: FigmaApiResponse | null;
  error: string | null;
  onFileKeyChange: (fileKey: string) => void;
  onLoadFile: () => void;
  debugInfo: DebugInfo;
}

export function FileInput({
  fileKey,
  isLoading,
  figmaData,
  error,
  onFileKeyChange,
  onLoadFile,
  debugInfo,
}: FileInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-gray-500" />
          <span>Figma File Loader</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <Label htmlFor="file-key" className="text-sm font-medium text-gray-700">
              Figma File Key
            </Label>
            <Input
              id="file-key"
              type="text"
              placeholder="Enter Figma file key or 'mock' for demo"
              value={fileKey}
              onChange={(e) => onFileKeyChange(e.target.value)}
              className="mt-2"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Tip: Use "mock" to load demo data for testing
            </p>
          </div>
          <div className="flex items-end">
            <Button
              onClick={onLoadFile}
              disabled={isLoading || !fileKey.trim()}
              className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Load File
                </>
              )}
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Loading Figma data...</span>
              <span>Fetching...</span>
            </div>
            <Progress value={33} className="w-full" />
          </div>
        )}

        {figmaData && !isLoading && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{figmaData.name}</h4>
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                  v{figmaData.version}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Components:</span>
                  <span className="ml-2 font-medium">
                    {Object.keys(figmaData.components || {}).length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Styles:</span>
                  <span className="ml-2 font-medium">
                    {Object.keys(figmaData.styles || {}).length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Last Modified:</span>
                  <span className="ml-2 font-medium">
                    {new Date(figmaData.lastModified).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, RefreshCw, Calendar, User } from 'lucide-react';
import { FigmaApiResponse } from '@/types/figma';

interface FileInputProps {
  fileKey: string;
  isLoading: boolean;
  figmaData: FigmaApiResponse | null;
  error: string | null;
  onFileKeyChange: (key: string) => void;
  onLoadFile: () => void;
  debugInfo?: {
    lastAction: string;
    apiCalls: number;
  };
}

export function FileInput({
  fileKey,
  isLoading,
  figmaData,
  error,
  onFileKeyChange,
  onLoadFile,
  debugInfo
}: FileInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Figma File Loader</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Label htmlFor="file-key">Figma File Key</Label>
            <Input
              id="file-key"
              type="text"
              placeholder="Enter Figma file key or 'mock' for demo"
              value={fileKey}
              onChange={(e) => onFileKeyChange(e.target.value)}
              disabled={isLoading}
              className={
                error && error.includes("file key")
                  ? "border-red-500"
                  : ""
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tip: Use "mock" to load demo data for testing
            </p>
          </div>
          <div className="flex items-end">
            <Button
              onClick={onLoadFile}
              disabled={isLoading || !fileKey.trim()}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
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

        {/* Loading Progress */}
        {isLoading && debugInfo && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Loading Figma data...</span>
              <span>{debugInfo.lastAction}</span>
            </div>
            <Progress value={undefined} className="h-2" />
          </div>
        )}

        {/* File Info */}
        {figmaData && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{figmaData.name}</h4>
              <Badge variant="outline">v{figmaData.version}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Components:</span>
                <span className="ml-2 font-medium">
                  {Object.keys(figmaData.components || {}).length}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Styles:</span>
                <span className="ml-2 font-medium">
                  {Object.keys(figmaData.styles || {}).length}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Last Modified:</span>
                <span className="ml-2 font-medium">
                  {new Date(figmaData.lastModified).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Layers, Calendar, User } from 'lucide-react';
import { FigmaApiResponse } from '@/types/figma';

interface FigmaFileDetailsProps {
  figmaData: FigmaApiResponse;
}

export function FigmaFileDetails({ figmaData }: FigmaFileDetailsProps) {
  const analyzeFileStructure = useMemo(() => {
    const components = Object.keys(figmaData.components || {}).length;
    const styles = Object.keys(figmaData.styles || {}).length;

    const countNodes = (node: any): number => {
      let count = 1;
      if (node.children) {
        count += node.children.reduce((sum: number, child: any) => sum + countNodes(child), 0);
      }
      return count;
    };

    const totalNodes = figmaData.document ? countNodes(figmaData.document) : 0;
    return { components, styles, totalNodes };
  }, [figmaData]);

  const { components, styles, totalNodes } = analyzeFileStructure;

  return (
    <>
      {/* File Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Figma File Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900">File Name</h4>
              <p className="text-gray-600">{figmaData.name}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Version</h4>
              <p className="text-gray-600">{figmaData.version}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Last Modified</h4>
              <p className="text-gray-600 flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(figmaData.lastModified).toLocaleDateString('hu-HU')}</span>
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Editor Type</h4>
              <p className="text-gray-600 flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{figmaData.editorType}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{components}</div>
              <div className="text-sm text-gray-500">Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{styles}</div>
              <div className="text-sm text-gray-500">Styles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalNodes}</div>
              <div className="text-sm text-gray-500">Elements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Components List */}
      {components > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Layers className="w-5 h-5" />
              <span>Available Components</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(figmaData.components || {}).map(([key, component]) => (
                <div key={key} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <h4 className="font-medium text-sm">{component.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{component.description || 'No description'}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {key.substring(0, 8)}...
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

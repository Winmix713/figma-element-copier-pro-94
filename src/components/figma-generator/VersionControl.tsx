
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GitBranch, 
  History, 
  RotateCcw, 
  GitCommit, 
  Plus, 
  Minus, 
  Edit3,
  Calendar,
  User
} from 'lucide-react';
import { VersionControlService, CodeVersion, DiffResult } from '@/services/version-control';
import { GeneratedComponent } from '@/types/figma';

interface VersionControlProps {
  component: GeneratedComponent;
  onVersionRestore: (component: GeneratedComponent) => void;
}

export function VersionControl({ component, onVersionRestore }: VersionControlProps) {
  const [versions, setVersions] = useState<CodeVersion[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [activeTab, setActiveTab] = useState('history');

  const versionService = new VersionControlService();

  const handleSaveVersion = () => {
    const description = `Component update - ${new Date().toLocaleString()}`;
    const versionId = versionService.saveVersion(
      component.id, 
      component.jsx, 
      {}, // figmaData placeholder
      description
    );
    
    // Refresh versions
    const updatedVersions = versionService.getVersionHistory(component.id);
    setVersions(updatedVersions);
  };

  const handleCompareVersions = () => {
    if (selectedVersions.length === 2) {
      const diff = versionService.compareVersions(
        component.id,
        selectedVersions[0],
        selectedVersions[1]
      );
      setDiffResult(diff);
      setActiveTab('diff');
    }
  };

  const handleRollback = (versionId: string) => {
    const restoredVersion = versionService.rollbackToVersion(component.id, versionId);
    if (restoredVersion) {
      const restoredComponent: GeneratedComponent = {
        ...component,
        jsx: restoredVersion.code
      };
      onVersionRestore(restoredComponent);
      
      // Refresh versions
      const updatedVersions = versionService.getVersionHistory(component.id);
      setVersions(updatedVersions);
    }
  };

  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else if (prev.length < 2) {
        return [...prev, versionId];
      } else {
        return [prev[1], versionId]; // Replace first selection
      }
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-blue-600" />
            <span>Verziókezelés</span>
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveVersion}
            >
              <GitCommit className="w-4 h-4 mr-2" />
              Verzió mentése
            </Button>
            {selectedVersions.length === 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompareVersions}
              >
                Összehasonlítás
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">Előzmények</TabsTrigger>
            <TabsTrigger value="diff">Diff nézet</TabsTrigger>
            <TabsTrigger value="stats">Statisztikák</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-3">
              {versions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Még nincsenek mentett verziók</p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={handleSaveVersion}
                  >
                    Első verzió mentése
                  </Button>
                </div>
              ) : (
                versions.map((version, index) => (
                  <div
                    key={version.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedVersions.includes(version.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleVersionSelection(version.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <GitCommit className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{version.id}</span>
                          {index === 0 && (
                            <Badge variant="secondary">Legújabb</Badge>
                          )}
                          {selectedVersions.includes(version.id) && (
                            <Badge variant="default">Kiválasztva</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {version.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(version.timestamp)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>Developer</span>
                          </div>
                        </div>
                        {version.changes.length > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex items-center space-x-1 text-xs">
                              <Plus className="w-3 h-3 text-green-600" />
                              <span className="text-green-600">
                                {version.changes.filter(c => c.type === 'addition').length}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs">
                              <Minus className="w-3 h-3 text-red-600" />
                              <span className="text-red-600">
                                {version.changes.filter(c => c.type === 'deletion').length}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs">
                              <Edit3 className="w-3 h-3 text-yellow-600" />
                              <span className="text-yellow-600">
                                {version.changes.filter(c => c.type === 'modification').length}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRollback(version.id);
                          }}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="diff" className="space-y-4">
            {diffResult ? (
              <div>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Plus className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        {diffResult.additions} hozzáadás
                      </span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Minus className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-600">
                        {diffResult.deletions} törlés
                      </span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Edit3 className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-600">
                        {diffResult.modifications} módosítás
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg overflow-auto">
                  <pre className="text-sm text-gray-100 font-mono">
                    {diffResult.diffView}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Válassz ki két verziót az összehasonlításhoz
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Verziók száma</h4>
                <div className="text-2xl font-bold text-blue-900">
                  {versions.length}
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Összes változás</h4>
                <div className="text-2xl font-bold text-green-900">
                  {versions.reduce((sum, v) => sum + v.changes.length, 0)}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Commit üzenet generátor</h4>
              {versions.length > 0 && versions[0].changes.length > 0 && (
                <div className="bg-white p-3 rounded border font-mono text-sm">
                  {versionService.generateCommitMessage(versions[0].changes)}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

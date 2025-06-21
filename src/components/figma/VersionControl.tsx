import { useState, useEffect } from 'react';
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
  User,
  Download,
  Upload
} from 'lucide-react';
import { VersionControlService } from '@/services/version-control';
import type { CodeVersion, DiffResult } from '@shared/types/generation';
import type { GeneratedComponent } from '@shared/types/figma';

interface VersionControlProps {
  component: GeneratedComponent;
  onVersionRestore: (component: GeneratedComponent) => void;
}

export function VersionControl({ component, onVersionRestore }: VersionControlProps) {
  const [versions, setVersions] = useState<CodeVersion[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [activeTab, setActiveTab] = useState('history');
  const [versionService] = useState(() => new VersionControlService());

  useEffect(() => {
    const loadVersions = () => {
      const componentVersions = versionService.getVersionHistory(component.id);
      setVersions(componentVersions);
    };

    loadVersions();
  }, [component.id, versionService]);

  const handleSaveVersion = () => {
    const description = `Component update - ${new Date().toLocaleString()}`;
    const versionId = versionService.saveVersion(
      component.id, 
      component.code, 
      component.metadata,
      description
    );
    
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
        code: restoredVersion.code,
        jsx: restoredVersion.code
      };
      onVersionRestore(restoredComponent);
      
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
        return [prev[1], versionId];
      }
    });
  };

  const exportVersionHistory = () => {
    const exported = versionService.exportVersionHistory(component.id);
    const blob = new Blob([exported], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${component.name}-versions.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
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
            <span>Version Control</span>
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveVersion}
            >
              <GitCommit className="w-4 h-4 mr-2" />
              Save Version
            </Button>
            {selectedVersions.length === 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompareVersions}
              >
                Compare
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={exportVersionHistory}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="diff">Diff View</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-3">
              {versions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No version history yet</p>
                  <p className="text-sm text-gray-400">Save your first version to get started</p>
                </div>
              ) : (
                versions.map((version, index) => (
                  <div
                    key={version.id}
                    className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                      selectedVersions.includes(version.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedVersions.includes(version.id)}
                          onChange={() => toggleVersionSelection(version.id)}
                          className="rounded border-gray-300"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Version {versions.length - index}</span>
                            {index === 0 && (
                              <Badge variant="default">Current</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{version.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(version.timestamp)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{version.author}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {index !== 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRollback(version.id)}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Restore
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="diff" className="space-y-4">
            {diffResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Comparison Result</h3>
                  <Badge variant="outline">{diffResult.summary}</Badge>
                </div>
                
                {diffResult.additions.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2 flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Additions ({diffResult.additions.length})
                    </h4>
                    <div className="space-y-1">
                      {diffResult.additions.map((addition, index) => (
                        <div key={index} className="text-sm text-green-700 font-mono">
                          + {addition}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {diffResult.deletions.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2 flex items-center">
                      <Minus className="w-4 h-4 mr-2" />
                      Deletions ({diffResult.deletions.length})
                    </h4>
                    <div className="space-y-1">
                      {diffResult.deletions.map((deletion, index) => (
                        <div key={index} className="text-sm text-red-700 font-mono">
                          - {deletion}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {diffResult.modifications.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Modifications ({diffResult.modifications.length})
                    </h4>
                    <div className="space-y-1">
                      {diffResult.modifications.map((modification, index) => (
                        <div key={index} className="text-sm text-yellow-700 font-mono">
                          ~ {modification}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Edit3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Select two versions to compare</p>
                <p className="text-sm text-gray-400">Check two versions in the history tab</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{versions.length}</div>
                <div className="text-sm text-blue-700">Total Versions</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {versions.filter(v => v.author).length}
                </div>
                <div className="text-sm text-green-700">Authored Versions</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {versions.length > 0 ? Math.round((Date.now() - versions[0].timestamp.getTime()) / (1000 * 60 * 60 * 24)) : 0}
                </div>
                <div className="text-sm text-purple-700">Days Active</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {component.code.split('\n').length}
                </div>
                <div className="text-sm text-orange-700">Current Lines</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
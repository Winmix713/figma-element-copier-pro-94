import type { CodeVersion, DiffResult } from "@shared/types/generation";

export class VersionControlService {
  private versions: Map<string, CodeVersion[]> = new Map();
  private currentVersions: Map<string, string> = new Map();

  saveVersion(
    componentId: string, 
    code: string, 
    metadata: any, 
    description: string,
    author?: string
  ): string {
    const versionId = `v${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const version: CodeVersion = {
      id: versionId,
      componentId,
      code,
      metadata,
      description,
      timestamp: new Date(),
      author: author || 'Anonymous'
    };

    const componentVersions = this.versions.get(componentId) || [];
    componentVersions.push(version);
    this.versions.set(componentId, componentVersions);
    this.currentVersions.set(componentId, versionId);

    return versionId;
  }

  getVersionHistory(componentId: string): CodeVersion[] {
    return this.versions.get(componentId) || [];
  }

  getVersion(componentId: string, versionId: string): CodeVersion | null {
    const versions = this.versions.get(componentId) || [];
    return versions.find(v => v.id === versionId) || null;
  }

  getCurrentVersion(componentId: string): CodeVersion | null {
    const currentVersionId = this.currentVersions.get(componentId);
    if (!currentVersionId) return null;
    return this.getVersion(componentId, currentVersionId);
  }

  rollbackToVersion(componentId: string, versionId: string): CodeVersion | null {
    const version = this.getVersion(componentId, versionId);
    if (version) {
      this.currentVersions.set(componentId, versionId);
    }
    return version;
  }

  compareVersions(
    componentId: string, 
    versionId1: string, 
    versionId2: string
  ): DiffResult | null {
    const version1 = this.getVersion(componentId, versionId1);
    const version2 = this.getVersion(componentId, versionId2);

    if (!version1 || !version2) return null;

    const lines1 = version1.code.split('\n');
    const lines2 = version2.code.split('\n');

    const additions: string[] = [];
    const deletions: string[] = [];
    const modifications: string[] = [];

    // Simple diff algorithm
    const maxLines = Math.max(lines1.length, lines2.length);
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';

      if (line1 && !line2) {
        deletions.push(`Line ${i + 1}: ${line1}`);
      } else if (!line1 && line2) {
        additions.push(`Line ${i + 1}: ${line2}`);
      } else if (line1 !== line2) {
        modifications.push(`Line ${i + 1}: "${line1}" → "${line2}"`);
      }
    }

    return {
      additions,
      deletions,
      modifications,
      summary: `${additions.length} additions, ${deletions.length} deletions, ${modifications.length} modifications`
    };
  }

  deleteVersion(componentId: string, versionId: string): boolean {
    const versions = this.versions.get(componentId) || [];
    const index = versions.findIndex(v => v.id === versionId);
    
    if (index !== -1) {
      versions.splice(index, 1);
      this.versions.set(componentId, versions);
      
      // If this was the current version, set to latest
      if (this.currentVersions.get(componentId) === versionId) {
        const latest = versions[versions.length - 1];
        if (latest) {
          this.currentVersions.set(componentId, latest.id);
        } else {
          this.currentVersions.delete(componentId);
        }
      }
      
      return true;
    }
    
    return false;
  }

  exportVersionHistory(componentId: string): string {
    const versions = this.getVersionHistory(componentId);
    return JSON.stringify({
      componentId,
      versions: versions.map(v => ({
        ...v,
        timestamp: v.timestamp.toISOString()
      })),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  importVersionHistory(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      const { componentId, versions } = parsed;
      
      const processedVersions: CodeVersion[] = versions.map((v: any) => ({
        ...v,
        timestamp: new Date(v.timestamp)
      }));
      
      this.versions.set(componentId, processedVersions);
      
      // Set current version to latest
      if (processedVersions.length > 0) {
        const latest = processedVersions[processedVersions.length - 1];
        this.currentVersions.set(componentId, latest.id);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import version history:', error);
      return false;
    }
  }
}

export interface CodeVersion {
  id: string;
  timestamp: Date;
  description: string;
  code: string;
  figmaData: any;
  changes: CodeChange[];
}

export interface CodeChange {
  type: 'addition' | 'deletion' | 'modification';
  line: number;
  content: string;
  reason: string;
}

export interface DiffResult {
  additions: number;
  deletions: number;
  modifications: number;
  changes: CodeChange[];
  diffView: string;
}

export class VersionControlService {
  private versions: Map<string, CodeVersion[]> = new Map();
  private static instance: VersionControlService;

  static getInstance(): VersionControlService {
    if (!VersionControlService.instance) {
      VersionControlService.instance = new VersionControlService();
    }
    return VersionControlService.instance;
  }

  saveVersion(componentId: string, code: string, figmaData: any, description: string): string {
    const versionId = `v${Date.now()}`;
    const version: CodeVersion = {
      id: versionId,
      timestamp: new Date(),
      description,
      code,
      figmaData,
      changes: []
    };

    const existing = this.versions.get(componentId) || [];
    
    // Calculate changes from previous version
    if (existing.length > 0) {
      const previousVersion = existing[existing.length - 1];
      version.changes = this.calculateChanges(previousVersion.code, code);
    }

    existing.push(version);
    this.versions.set(componentId, existing);
    
    return versionId;
  }

  getVersionHistory(componentId: string): CodeVersion[] {
    return this.versions.get(componentId) || [];
  }

  compareVersions(componentId: string, version1Id: string, version2Id: string): DiffResult {
    const versions = this.versions.get(componentId) || [];
    const v1 = versions.find(v => v.id === version1Id);
    const v2 = versions.find(v => v.id === version2Id);
    
    if (!v1 || !v2) {
      throw new Error('Version not found');
    }

    return this.generateDiff(v1.code, v2.code);
  }

  rollbackToVersion(componentId: string, versionId: string): CodeVersion | null {
    const versions = this.versions.get(componentId) || [];
    const targetVersion = versions.find(v => v.id === versionId);
    
    if (!targetVersion) {
      return null;
    }

    // Create new version based on rollback
    const rollbackDescription = `Rollback to ${versionId}`;
    this.saveVersion(componentId, targetVersion.code, targetVersion.figmaData, rollbackDescription);
    
    return targetVersion;
  }

  generateCommitMessage(changes: CodeChange[]): string {
    const additions = changes.filter(c => c.type === 'addition').length;
    const deletions = changes.filter(c => c.type === 'deletion').length;
    const modifications = changes.filter(c => c.type === 'modification').length;

    let message = 'feat: update component';
    
    if (additions > 0) message += ` (+${additions} lines)`;
    if (deletions > 0) message += ` (-${deletions} lines)`;
    if (modifications > 0) message += ` (~${modifications} changes)`;

    const reasons = [...new Set(changes.map(c => c.reason))];
    if (reasons.length > 0) {
      message += `\n\n${reasons.map(r => `- ${r}`).join('\n')}`;
    }

    return message;
  }

  private calculateChanges(oldCode: string, newCode: string): CodeChange[] {
    const oldLines = oldCode.split('\n');
    const newLines = newCode.split('\n');
    const changes: CodeChange[] = [];

    // Enhanced diff algorithm with better change detection
    const maxLines = Math.max(oldLines.length, newLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i] || '';
      const newLine = newLines[i] || '';
      
      if (oldLine !== newLine) {
        if (!oldLine && newLine) {
          changes.push({
            type: 'addition',
            line: i + 1,
            content: newLine,
            reason: this.detectChangeReason(newLine, 'addition')
          });
        } else if (oldLine && !newLine) {
          changes.push({
            type: 'deletion',
            line: i + 1,
            content: oldLine,
            reason: this.detectChangeReason(oldLine, 'deletion')
          });
        } else {
          changes.push({
            type: 'modification',
            line: i + 1,
            content: newLine,
            reason: this.detectChangeReason(newLine, 'modification', oldLine)
          });
        }
      }
    }

    return changes;
  }

  private detectChangeReason(content: string, type: string, oldContent?: string): string {
    // Enhanced change reason detection
    if (content.includes('className') || content.includes('style')) {
      return 'Styling update';
    }
    if (content.includes('onClick') || content.includes('onSubmit')) {
      return 'Event handler update';
    }
    if (content.includes('useState') || content.includes('useEffect')) {
      return 'Hook implementation';
    }
    if (content.includes('aria-') || content.includes('role=')) {
      return 'Accessibility improvement';
    }
    if (content.includes('import') || content.includes('export')) {
      return 'Import/export change';
    }
    if (type === 'addition') {
      return 'New functionality added';
    }
    if (type === 'deletion') {
      return 'Code cleanup';
    }
    return 'Code modification';
  }

  private generateDiff(code1: string, code2: string): DiffResult {
    const changes = this.calculateChanges(code1, code2);
    
    const additions = changes.filter(c => c.type === 'addition').length;
    const deletions = changes.filter(c => c.type === 'deletion').length;
    const modifications = changes.filter(c => c.type === 'modification').length;

    const diffView = this.createDiffView(code1, code2, changes);

    return {
      additions,
      deletions,
      modifications,
      changes,
      diffView
    };
  }

  private createDiffView(code1: string, code2: string, changes: CodeChange[]): string {
    const lines1 = code1.split('\n');
    const lines2 = code2.split('\n');
    let diffView = '';

    const maxLines = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < maxLines; i++) {
      const change = changes.find(c => c.line === i + 1);
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';
      
      if (change) {
        switch (change.type) {
          case 'addition':
            diffView += `+ ${line2}\n`;
            break;
          case 'deletion':
            diffView += `- ${line1}\n`;
            break;
          case 'modification':
            diffView += `- ${line1}\n`;
            diffView += `+ ${line2}\n`;
            break;
        }
      } else if (line1 === line2) {
        diffView += `  ${line1}\n`;
      }
    }

    return diffView;
  }
}

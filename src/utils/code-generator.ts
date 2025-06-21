import { FigmaNode } from '@/types/figma';

export class CodeGenerator {
  generateReactComponent(node: FigmaNode): string {
    const jsxContent = this.generateJSX(node);
    
    return `
import React from 'react';

export default function ${this.getComponentName(node)}() {
  return (
    ${jsxContent}
  );
}
    `.trim();
  }

  private generateJSX(node: FigmaNode): string {
    switch (node.type) {
      case 'TEXT':
        return `<span>${node.characters || ''}</span>`;
      case 'FRAME':
        const children = node.children?.map(child => this.generateJSX(child)).join('\n') || '';
        return `<div>${children}</div>`;
      default:
        return '<div></div>';
    }
  }

  private getComponentName(node: FigmaNode): string {
    return node.name.replace(/[^a-zA-Z0-9]/g, '') || 'Component';
  }
}

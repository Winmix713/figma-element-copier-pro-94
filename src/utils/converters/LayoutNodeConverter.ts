
import { FigmaFrameNode, FigmaNode, ConversionOptions } from '@/types/figma';
import { ColorParser } from '../color-parser';
import { StyleParser } from './StyleParser';

export class LayoutNodeConverter {
  private processedElements: WeakSet<HTMLElement>;
  private options: ConversionOptions;

  constructor(options: ConversionOptions = {}, processedElements: WeakSet<HTMLElement>) {
    this.options = options;
    this.processedElements = processedElements;
  }

  convert(element: HTMLElement, styles: CSSStyleDeclaration, rect: DOMRect, depth: number): FigmaFrameNode[] {
    const backgroundColor = ColorParser.parse(styles.backgroundColor);
    const cornerRadius = StyleParser.parseCornerRadius(styles.borderRadius);
    
    const frameNode: FigmaFrameNode = {
      type: 'FRAME',
      id: this.generateId(),
      name: this.generateNodeName(element, 'Frame'),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      fills: ColorParser.isTransparent(backgroundColor) ? [] : [{ type: 'SOLID', color: backgroundColor }],
      cornerRadius,
      children: [],
      layoutMode: this.getLayoutMode(styles),
      opacity: StyleParser.parseOpacity(styles.opacity),
    };

    // Add layout properties
    this.addLayoutProperties(frameNode, styles);

    // Add effects (shadows, etc.)
    const effects = StyleParser.parseEffects(styles);
    if (effects.length > 0) {
      frameNode.effects = effects;
    }

    return [frameNode];
  }

  private addLayoutProperties(frameNode: FigmaFrameNode, styles: CSSStyleDeclaration): void {
    if (frameNode.layoutMode && frameNode.layoutMode !== 'NONE') {
      // Add Auto Layout properties
      const gap = this.parseGap(styles.gap);
      if (gap > 0) {
        frameNode.itemSpacing = gap;
      }

      // Add padding
      frameNode.paddingLeft = this.parsePadding(styles.paddingLeft);
      frameNode.paddingRight = this.parsePadding(styles.paddingRight);
      frameNode.paddingTop = this.parsePadding(styles.paddingTop);
      frameNode.paddingBottom = this.parsePadding(styles.paddingBottom);

      // Add alignment
      frameNode.primaryAxisAlignItems = this.getPrimaryAxisAlignment(styles);
      frameNode.counterAxisAlignItems = this.getCounterAxisAlignment(styles);
    }
  }

  private getLayoutMode(styles: CSSStyleDeclaration): 'NONE' | 'HORIZONTAL' | 'VERTICAL' {
    const display = styles.display;
    const flexDirection = styles.flexDirection;
    
    if (display === 'flex') {
      return flexDirection === 'column' ? 'VERTICAL' : 'HORIZONTAL';
    }
    
    if (display === 'grid') {
      // Simple grid detection - could be enhanced
      const gridTemplateColumns = styles.gridTemplateColumns;
      const gridTemplateRows = styles.gridTemplateRows;
      
      if (gridTemplateRows && gridTemplateRows !== 'none') {
        return 'VERTICAL';
      }
      if (gridTemplateColumns && gridTemplateColumns !== 'none') {
        return 'HORIZONTAL';
      }
    }
    
    return 'NONE';
  }

  private parseGap(gap: string): number {
    if (!gap || gap === 'normal') return 0;
    return parseFloat(gap) || 0;
  }

  private parsePadding(padding: string): number {
    if (!padding) return 0;
    return parseFloat(padding) || 0;
  }

  private getPrimaryAxisAlignment(styles: CSSStyleDeclaration): string {
    const justifyContent = styles.justifyContent;
    switch (justifyContent) {
      case 'center': return 'CENTER';
      case 'flex-end': return 'MAX';
      case 'space-between': return 'SPACE_BETWEEN';
      case 'space-around': return 'SPACE_AROUND';
      case 'space-evenly': return 'SPACE_EVENLY';
      default: return 'MIN';
    }
  }

  private getCounterAxisAlignment(styles: CSSStyleDeclaration): string {
    const alignItems = styles.alignItems;
    switch (alignItems) {
      case 'center': return 'CENTER';
      case 'flex-end': return 'MAX';
      case 'stretch': return 'STRETCH';
      default: return 'MIN';
    }
  }

  private generateNodeName(element: HTMLElement, fallback: string): string {
    const className = element.className.toString().trim();
    const id = element.id;
    const tagName = element.tagName.toLowerCase();
    
    if (id) return `${tagName}#${id}`;
    if (className) return `${tagName}.${className.split(' ')[0]}`;
    return `${fallback} (${tagName})`;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

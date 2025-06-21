
import { FigmaFrameNode, ConversionOptions } from '@/types/figma';

export class LayoutNodeConverter {
  private options: ConversionOptions;
  private processedElements: WeakSet<HTMLElement>;

  constructor(options: ConversionOptions = {}, processedElements: WeakSet<HTMLElement> = new WeakSet()) {
    this.options = options;
    this.processedElements = processedElements;
  }

  convert(element: HTMLElement, styles: CSSStyleDeclaration, rect: DOMRect, depth: number): FigmaFrameNode[] {
    const frameNode: FigmaFrameNode = {
      id: this.generateId(),
      name: this.getElementName(element),
      type: 'FRAME',
      width: rect.width,
      height: rect.height,
      absoluteBoundingBox: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      },
      layoutMode: this.getLayoutMode(styles),
      fills: this.extractFills(styles),
      cornerRadius: this.extractCornerRadius(styles),
      opacity: this.extractOpacity(styles),
      children: []
    };

    return [frameNode];
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getElementName(element: HTMLElement): string {
    return element.tagName.toLowerCase() + (element.className ? `-${element.className.split(' ')[0]}` : '');
  }

  private getLayoutMode(styles: CSSStyleDeclaration): 'NONE' | 'HORIZONTAL' | 'VERTICAL' {
    const display = styles.display;
    const flexDirection = styles.flexDirection;

    if (display === 'flex') {
      return flexDirection === 'column' ? 'VERTICAL' : 'HORIZONTAL';
    }

    return 'NONE';
  }

  private extractFills(styles: CSSStyleDeclaration): any[] {
    const backgroundColor = styles.backgroundColor;
    if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
      return [{
        type: 'SOLID',
        color: this.parseColor(backgroundColor),
        visible: true
      }];
    }
    return [];
  }

  private extractCornerRadius(styles: CSSStyleDeclaration): number {
    const borderRadius = styles.borderRadius;
    if (borderRadius && borderRadius !== '0px') {
      return parseInt(borderRadius, 10) || 0;
    }
    return 0;
  }

  private extractOpacity(styles: CSSStyleDeclaration): number {
    const opacity = styles.opacity;
    return opacity ? parseFloat(opacity) : 1;
  }

  private parseColor(colorString: string): { r: number; g: number; b: number; a: number } {
    // Simple color parser - you might want to use a more robust solution
    const rgbaMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbaMatch) {
      return {
        r: parseInt(rgbaMatch[1], 10) / 255,
        g: parseInt(rgbaMatch[2], 10) / 255,
        b: parseInt(rgbaMatch[3], 10) / 255,
        a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1
      };
    }
    return { r: 0, g: 0, b: 0, a: 1 };
  }
}

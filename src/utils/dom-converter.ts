import { FigmaNode, FigmaFrameNode, FigmaColor, Color, Paint } from '@/types/figma';
import { ColorParser } from './color-parser';
import { TextNodeConverter } from './converters/TextNodeConverter';
import { LayoutNodeConverter } from './converters/LayoutNodeConverter';

export class DOMConverter {
  private processedElements: WeakSet<HTMLElement> = new WeakSet();
  private options: any = {};

  convertElementToFigma(element: HTMLElement): FigmaNode[] {
    if (this.processedElements.has(element)) {
      return [];
    }

    this.processedElements.add(element);

    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);
    
    // Check if element contains text
    const hasText = element.textContent && element.textContent.trim().length > 0;
    const hasChildren = element.children.length > 0;

    if (hasText && !hasChildren) {
      return TextNodeConverter.convert(element, styles, rect);
    }

    // Use layout converter for container elements
    const layoutConverter = new LayoutNodeConverter(this.options, this.processedElements);
    const frameNodes = layoutConverter.convert(element, styles, rect, 0);
    
    // Process children
    const children: FigmaNode[] = [];
    Array.from(element.children).forEach(child => {
      if (child instanceof HTMLElement) {
        const childNodes = this.convertElementToFigma(child);
        children.push(...childNodes);
      }
    });

    // Add children to the first frame node
    if (frameNodes.length > 0) {
      frameNodes[0].children = children;
    }

    return frameNodes;
  }

  private convertColorToFigmaColor(color: FigmaColor): Color {
    return {
      r: color.r,
      g: color.g, 
      b: color.b,
      a: color.a ?? 1
    };
  }

  private convertFillsToPaint(fills: any[]): Paint[] {
    return fills.map(fill => ({
      ...fill,
      color: fill.color ? this.convertColorToFigmaColor(fill.color) : undefined
    }));
  }

  setOptions(options: any): void {
    this.options = options;
  }

  clearProcessedElements(): void {
    this.processedElements = new WeakSet();
  }
}

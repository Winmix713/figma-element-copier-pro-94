
import { FigmaNode, ConversionOptions } from '@/types/figma';
import { TextNodeConverter } from './converters/TextNodeConverter';
import { LayoutNodeConverter } from './converters/LayoutNodeConverter';
import { ColorParser } from './color-parser';
import { StyleParser } from './converters/StyleParser';

export class DOMConverter {
  private options: ConversionOptions;
  private processedElements: WeakSet<HTMLElement>;
  private layoutConverter: LayoutNodeConverter;

  constructor(options: ConversionOptions = {}) {
    this.options = {
      includeHiddenElements: false,
      preserveAbsolutePositioning: false,
      maxDepth: 10,
      ...options,
    };
    this.processedElements = new WeakSet<HTMLElement>();
    this.layoutConverter = new LayoutNodeConverter(this.options, this.processedElements);
  }

  convertElement(element: HTMLElement): FigmaNode[] {
    this.processedElements = new WeakSet<HTMLElement>();
    return this.processElementRecursive(element, 0);
  }

  private processElementRecursive(element: HTMLElement, depth: number): FigmaNode[] {
    if (depth > (this.options.maxDepth || 10)) {
      console.warn('Maximum conversion depth reached');
      return [];
    }

    if (this.processedElements.has(element)) {
      console.warn('Circular reference detected, skipping element');
      return [];
    }

    this.processedElements.add(element);

    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);

    if (!this.options.includeHiddenElements && this.isElementHidden(element, styles)) {
      return [];
    }

    const customHandler = this.options.customElementHandlers?.get(element.tagName.toLowerCase());
    if (customHandler) {
      const customNode = customHandler(element);
      return customNode ? [customNode] : [];
    }

    const nodeType = this.determineNodeType(element, styles);
    
    switch (nodeType) {
      case 'TEXT':
        return TextNodeConverter.convert(element, styles, rect);
      case 'FRAME':
        return this.createFrameNode(element, styles, rect, depth);
      case 'RECTANGLE':
        return this.createRectangleNode(element, styles, rect);
      default:
        return [];
    }
  }

  private createFrameNode(element: HTMLElement, styles: CSSStyleDeclaration, rect: DOMRect, depth: number): FigmaNode[] {
    const frameNodes = this.layoutConverter.convert(element, styles, rect, depth);
    
    if (frameNodes.length > 0) {
      const frameNode = frameNodes[0];
      
      // Process children
      const children = Array.from(element.children) as HTMLElement[];
      for (const child of children) {
        const childNodes = this.processElementRecursive(child, depth + 1);
        frameNode.children!.push(...childNodes);
      }
    }

    return frameNodes;
  }

  private createRectangleNode(element: HTMLElement, styles: CSSStyleDeclaration, rect: DOMRect): FigmaNode[] {
    const backgroundColor = ColorParser.parse(styles.backgroundColor);
    const cornerRadius = StyleParser.parseCornerRadius(styles.borderRadius);

    const rectangleNode: FigmaNode = {
      type: 'RECTANGLE',
      id: this.generateId(),
      name: this.generateNodeName(element, 'Rectangle'),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      fills: ColorParser.isTransparent(backgroundColor) ? [] : [{ type: 'SOLID', color: backgroundColor }],
      cornerRadius,
      opacity: StyleParser.parseOpacity(styles.opacity),
    };

    return [rectangleNode];
  }

  private determineNodeType(element: HTMLElement, styles: CSSStyleDeclaration): string {
    const tagName = element.tagName.toLowerCase();
    const textContent = element.textContent?.trim();
    const hasChildren = element.children.length > 0;

    // Text elements
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'label'].includes(tagName) && textContent && !hasChildren) {
      return 'TEXT';
    }

    if (textContent && !hasChildren && !this.hasBlockLevelChildren(element)) {
      return 'TEXT';
    }

    // Container elements
    if (hasChildren || ['div', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside'].includes(tagName)) {
      return 'FRAME';
    }

    // Simple shaped elements
    if (['img', 'hr'].includes(tagName) || this.hasSimpleBackground(styles)) {
      return 'RECTANGLE';
    }

    return 'FRAME';
  }

  private generateNodeName(element: HTMLElement, fallback: string): string {
    const className = element.className.toString().trim();
    const id = element.id;
    const tagName = element.tagName.toLowerCase();
    
    if (id) return `${tagName}#${id}`;
    if (className) return `${tagName}.${className.split(' ')[0]}`;
    return `${fallback} (${tagName})`;
  }

  private isElementHidden(element: HTMLElement, styles: CSSStyleDeclaration): boolean {
    return (
      styles.display === 'none' ||
      styles.visibility === 'hidden' ||
      styles.opacity === '0' ||
      element.hidden
    );
  }

  private hasBlockLevelChildren(element: HTMLElement): boolean {
    const blockElements = ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside'];
    return Array.from(element.children).some(child =>
      blockElements.includes(child.tagName.toLowerCase())
    );
  }

  private hasSimpleBackground(styles: CSSStyleDeclaration): boolean {
    const backgroundColor = styles.backgroundColor;
    const backgroundImage = styles.backgroundImage;
    
    return backgroundColor !== 'rgba(0, 0, 0, 0)' || backgroundImage !== 'none';
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

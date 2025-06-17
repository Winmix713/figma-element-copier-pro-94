
import { FigmaNode, FigmaFrameNode, FigmaTextNode, FigmaFontName, ConversionOptions } from '@/types/figma';
import { ColorParser } from './color-parser';

export class DOMConverter {
  private options: ConversionOptions;
  private processedElements = new WeakSet<HTMLElement>();

  constructor(options: ConversionOptions = {}) {
    this.options = {
      includeHiddenElements: false,
      preserveAbsolutePositioning: false,
      maxDepth: 10,
      ...options,
    };
  }

  convertElement(element: HTMLElement): FigmaNode[] {
    this.processedElements.clear();
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

    // Skip hidden elements unless explicitly requested
    if (!this.options.includeHiddenElements && this.isElementHidden(element, styles)) {
      return [];
    }

    // Check for custom handlers
    const customHandler = this.options.customElementHandlers?.get(element.tagName.toLowerCase());
    if (customHandler) {
      const customNode = customHandler(element);
      return customNode ? [customNode] : [];
    }

    // Determine node type based on element
    const nodeType = this.determineNodeType(element, styles);
    
    switch (nodeType) {
      case 'TEXT':
        return this.createTextNode(element, styles, rect);
      case 'FRAME':
        return this.createFrameNode(element, styles, rect, depth);
      case 'RECTANGLE':
        return this.createRectangleNode(element, styles, rect);
      default:
        return [];
    }
  }

  private determineNodeType(element: HTMLElement, styles: CSSStyleDeclaration): string {
    const tagName = element.tagName.toLowerCase();
    const textContent = element.textContent?.trim();
    const hasChildren = element.children.length > 0;

    // Text elements
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'label'].includes(tagName) && textContent && !hasChildren) {
      return 'TEXT';
    }

    // If element has only text content and no block children
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

  private createTextNode(element: HTMLElement, styles: CSSStyleDeclaration, rect: DOMRect): FigmaNode[] {
    const textContent = element.textContent?.trim();
    if (!textContent) return [];

    const fontSize = this.parseFontSize(styles.fontSize);
    const fontName = this.parseFontName(styles);
    const textColor = ColorParser.parse(styles.color);

    const textNode: FigmaTextNode = {
      type: 'TEXT',
      name: this.generateNodeName(element, 'Text'),
      characters: textContent,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      fontSize,
      fontName,
      fills: ColorParser.isTransparent(textColor) ? [] : [{ type: 'SOLID', color: textColor }],
      textAlignHorizontal: this.getTextAlign(styles.textAlign),
      textAlignVertical: this.getVerticalAlign(styles.verticalAlign),
      letterSpacing: this.parseLetterSpacing(styles.letterSpacing),
      lineHeight: this.parseLineHeight(styles.lineHeight, fontSize),
      textCase: this.getTextTransform(styles.textTransform),
      textDecoration: this.getTextDecoration(styles.textDecoration),
    };

    return [textNode];
  }

  private createFrameNode(element: HTMLElement, styles: CSSStyleDeclaration, rect: DOMRect, depth: number): FigmaNode[] {
    const backgroundColor = ColorParser.parse(styles.backgroundColor);
    const cornerRadius = this.parseCornerRadius(styles.borderRadius);
    
    const frameNode: FigmaFrameNode = {
      type: 'FRAME',
      name: this.generateNodeName(element, 'Frame'),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      fills: ColorParser.isTransparent(backgroundColor) ? [] : [{ type: 'SOLID', color: backgroundColor }],
      cornerRadius,
      children: [],
      layoutMode: this.getLayoutMode(styles),
      opacity: this.parseOpacity(styles.opacity),
    };

    // Process children
    const children = Array.from(element.children) as HTMLElement[];
    for (const child of children) {
      const childNodes = this.processElementRecursive(child, depth + 1);
      frameNode.children!.push(...childNodes);
    }

    // Add effects (shadows, etc.)
    const effects = this.parseEffects(styles);
    if (effects.length > 0) {
      frameNode.effects = effects;
    }

    return [frameNode];
  }

  private createRectangleNode(element: HTMLElement, styles: CSSStyleDeclaration, rect: DOMRect): FigmaNode[] {
    const backgroundColor = ColorParser.parse(styles.backgroundColor);
    const cornerRadius = this.parseCornerRadius(styles.borderRadius);

    const rectangleNode: FigmaNode = {
      type: 'RECTANGLE',
      name: this.generateNodeName(element, 'Rectangle'),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      fills: ColorParser.isTransparent(backgroundColor) ? [] : [{ type: 'SOLID', color: backgroundColor }],
      cornerRadius,
      opacity: this.parseOpacity(styles.opacity),
    };

    return [rectangleNode];
  }

  private parseFontSize(fontSize: string): number {
    const size = parseFloat(fontSize);
    return isNaN(size) ? 16 : Math.round(size);
  }

  private parseFontName(styles: CSSStyleDeclaration): FigmaFontName {
    const fontFamily = styles.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
    const fontWeight = styles.fontWeight;
    const fontStyle = styles.fontStyle;

    let style: FigmaFontName['style'] = 'Regular';
    
    if (fontStyle === 'italic') {
      style = 'Italic';
    } else if (fontWeight === 'bold' || parseInt(fontWeight) >= 600) {
      style = 'Bold';
    } else if (fontWeight === '500') {
      style = 'Medium';
    } else if (parseInt(fontWeight) <= 300) {
      style = 'Light';
    }

    return {
      family: fontFamily || 'Inter',
      style,
    };
  }

  private parseCornerRadius(borderRadius: string): number | number[] {
    if (!borderRadius || borderRadius === '0px') return 0;
    
    const values = borderRadius.split(' ').map(val => parseFloat(val) || 0);
    
    if (values.length === 1) return values[0];
    if (values.every(val => val === values[0])) return values[0];
    
    return values.slice(0, 4);
  }

  private parseOpacity(opacity: string): number {
    const value = parseFloat(opacity);
    return isNaN(value) ? 1 : Math.max(0, Math.min(1, value));
  }

  private parseLetterSpacing(letterSpacing: string): number {
    if (letterSpacing === 'normal') return 0;
    return parseFloat(letterSpacing) || 0;
  }

  private parseLineHeight(lineHeight: string, fontSize: number): number | { value: number; unit: 'PIXELS' | 'PERCENT' } {
    if (lineHeight === 'normal') return { value: 120, unit: 'PERCENT' };
    
    if (lineHeight.includes('%')) {
      return { value: parseFloat(lineHeight), unit: 'PERCENT' };
    }
    
    const value = parseFloat(lineHeight);
    if (isNaN(value)) return { value: 120, unit: 'PERCENT' };
    
    // If it's a unitless number, it's a multiplier
    if (!lineHeight.includes('px') && !lineHeight.includes('em')) {
      return { value: value * 100, unit: 'PERCENT' };
    }
    
    return { value, unit: 'PIXELS' };
  }

  private getTextAlign(textAlign: string): 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED' {
    switch (textAlign) {
      case 'center': return 'CENTER';
      case 'right': return 'RIGHT';
      case 'justify': return 'JUSTIFIED';
      default: return 'LEFT';
    }
  }

  private getVerticalAlign(verticalAlign: string): 'TOP' | 'CENTER' | 'BOTTOM' {
    switch (verticalAlign) {
      case 'middle': return 'CENTER';
      case 'bottom': return 'BOTTOM';
      default: return 'TOP';
    }
  }

  private getTextTransform(textTransform: string): 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE' {
    switch (textTransform) {
      case 'uppercase': return 'UPPER';
      case 'lowercase': return 'LOWER';
      case 'capitalize': return 'TITLE';
      default: return 'ORIGINAL';
    }
  }

  private getTextDecoration(textDecoration: string): 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH' {
    if (textDecoration.includes('underline')) return 'UNDERLINE';
    if (textDecoration.includes('line-through')) return 'STRIKETHROUGH';
    return 'NONE';
  }

  private getLayoutMode(styles: CSSStyleDeclaration): 'NONE' | 'HORIZONTAL' | 'VERTICAL' {
    const display = styles.display;
    const flexDirection = styles.flexDirection;
    
    if (display === 'flex') {
      return flexDirection === 'column' ? 'VERTICAL' : 'HORIZONTAL';
    }
    
    return 'NONE';
  }

  private parseEffects(styles: CSSStyleDeclaration): any[] {
    const effects = [];
    const boxShadow = styles.boxShadow;
    
    if (boxShadow && boxShadow !== 'none') {
      // Simple box shadow parsing - could be expanded
      const shadowMatch = boxShadow.match(/(-?\d+px)\s+(-?\d+px)\s+(-?\d+px)\s*(-?\d+px)?\s*(rgba?\([^)]+\)|#[a-fA-F0-9]+|\w+)?/);
      
      if (shadowMatch) {
        effects.push({
          type: 'DROP_SHADOW',
          offset: {
            x: parseInt(shadowMatch[1]),
            y: parseInt(shadowMatch[2]),
          },
          radius: parseInt(shadowMatch[3]),
          spread: shadowMatch[4] ? parseInt(shadowMatch[4]) : 0,
          color: ColorParser.parse(shadowMatch[5] || 'rgba(0,0,0,0.25)'),
        });
      }
    }
    
    return effects;
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
}

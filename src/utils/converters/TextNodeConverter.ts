
import { FigmaTextNode, FigmaFontName, FigmaColor } from '@/types/figma';
import { ColorParser } from '../color-parser';

export class TextNodeConverter {
  static convert(element: HTMLElement, styles: CSSStyleDeclaration, rect: DOMRect): FigmaTextNode[] {
    const textContent = element.textContent?.trim();
    if (!textContent) return [];

    const fontSize = this.parseFontSize(styles.fontSize);
    const fontName = this.parseFontName(styles);
    const textColor = ColorParser.parse(styles.color);

    const textNode: FigmaTextNode = {
      type: 'TEXT',
      id: this.generateId(),
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

  private static parseFontSize(fontSize: string): number {
    const size = parseFloat(fontSize);
    return isNaN(size) ? 16 : Math.round(size);
  }

  private static parseFontName(styles: CSSStyleDeclaration): FigmaFontName {
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

  private static parseLetterSpacing(letterSpacing: string): number {
    if (letterSpacing === 'normal') return 0;
    return parseFloat(letterSpacing) || 0;
  }

  private static parseLineHeight(lineHeight: string, fontSize: number): number | { value: number; unit: 'PIXELS' | 'PERCENT' } {
    if (lineHeight === 'normal') return { value: 120, unit: 'PERCENT' };
    
    if (lineHeight.includes('%')) {
      return { value: parseFloat(lineHeight), unit: 'PERCENT' };
    }
    
    const value = parseFloat(lineHeight);
    if (isNaN(value)) return { value: 120, unit: 'PERCENT' };
    
    if (!lineHeight.includes('px') && !lineHeight.includes('em')) {
      return { value: value * 100, unit: 'PERCENT' };
    }
    
    return { value, unit: 'PIXELS' };
  }

  private static getTextAlign(textAlign: string): 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED' {
    switch (textAlign) {
      case 'center': return 'CENTER';
      case 'right': return 'RIGHT';
      case 'justify': return 'JUSTIFIED';
      default: return 'LEFT';
    }
  }

  private static getVerticalAlign(verticalAlign: string): 'TOP' | 'CENTER' | 'BOTTOM' {
    switch (verticalAlign) {
      case 'middle': return 'CENTER';
      case 'bottom': return 'BOTTOM';
      default: return 'TOP';
    }
  }

  private static getTextTransform(textTransform: string): 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE' {
    switch (textTransform) {
      case 'uppercase': return 'UPPER';
      case 'lowercase': return 'LOWER';
      case 'capitalize': return 'TITLE';
      default: return 'ORIGINAL';
    }
  }

  private static getTextDecoration(textDecoration: string): 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH' {
    if (textDecoration.includes('underline')) return 'UNDERLINE';
    if (textDecoration.includes('line-through')) return 'STRIKETHROUGH';
    return 'NONE';
  }

  private static generateNodeName(element: HTMLElement, fallback: string): string {
    const className = element.className.toString().trim();
    const id = element.id;
    const tagName = element.tagName.toLowerCase();
    
    if (id) return `${tagName}#${id}`;
    if (className) return `${tagName}.${className.split(' ')[0]}`;
    return `${fallback} (${tagName})`;
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

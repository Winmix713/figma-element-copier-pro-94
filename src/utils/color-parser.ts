
import { FigmaColor } from '@/types/figma';

export class ColorParser {
  private static cssVariableCache = new Map<string, string>();

  private static hexToRgb(hex: string): FigmaColor | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    } : null;
  }

  private static rgbToFigma(rgbString: string): FigmaColor {
    const matches = rgbString.match(/rgba?\(([^)]+)\)/);
    if (!matches) {
      return { r: 0, g: 0, b: 0 };
    }

    const values = matches[1].split(',').map(val => parseFloat(val.trim()));
    
    return {
      r: Math.max(0, Math.min(1, values[0] / 255)),
      g: Math.max(0, Math.min(1, values[1] / 255)),
      b: Math.max(0, Math.min(1, values[2] / 255)),
      a: values[3] !== undefined ? Math.max(0, Math.min(1, values[3])) : 1,
    };
  }

  private static hslToFigma(hslString: string): FigmaColor {
    const matches = hslString.match(/hsla?\(([^)]+)\)/);
    if (!matches) {
      return { r: 0, g: 0, b: 0 };
    }

    const values = matches[1].split(',').map(val => parseFloat(val.trim()));
    const h = values[0] / 360;
    const s = values[1] / 100;
    const l = values[2] / 100;
    const a = values[3] !== undefined ? values[3] : 1;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 1/6) {
      r = c; g = x; b = 0;
    } else if (1/6 <= h && h < 2/6) {
      r = x; g = c; b = 0;
    } else if (2/6 <= h && h < 3/6) {
      r = 0; g = c; b = x;
    } else if (3/6 <= h && h < 4/6) {
      r = 0; g = x; b = c;
    } else if (4/6 <= h && h < 5/6) {
      r = x; g = 0; b = c;
    } else if (5/6 <= h && h < 1) {
      r = c; g = 0; b = x;
    }

    return {
      r: Math.max(0, Math.min(1, r + m)),
      g: Math.max(0, Math.min(1, g + m)),
      b: Math.max(0, Math.min(1, b + m)),
      a: Math.max(0, Math.min(1, a)),
    };
  }

  private static parseCssVariable(varString: string): string | null {
    const varMatch = varString.match(/var\((--[^,)]+)(?:,([^)]+))?\)/);
    if (!varMatch) return null;

    const variableName = varMatch[1];
    const fallback = varMatch[2]?.trim();

    // Check cache first
    if (this.cssVariableCache.has(variableName)) {
      return this.cssVariableCache.get(variableName)!;
    }

    // Try to get from CSS custom properties
    const computedValue = getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();

    if (computedValue) {
      this.cssVariableCache.set(variableName, computedValue);
      return computedValue;
    }

    // Return fallback if available
    return fallback || null;
  }

  static parse(colorString: string): FigmaColor {
    if (!colorString || colorString === 'transparent') {
      return { r: 0, g: 0, b: 0, a: 0 };
    }

    // Normalize color string
    const normalized = colorString.trim().toLowerCase();

    // Handle CSS variables
    if (normalized.startsWith('var(')) {
      const resolvedColor = this.parseCssVariable(colorString);
      if (resolvedColor) {
        return this.parse(resolvedColor);
      }
      return { r: 0, g: 0, b: 0, a: 0 };
    }

    // Handle hex colors
    if (normalized.startsWith('#')) {
      const hexColor = this.hexToRgb(normalized);
      return hexColor || { r: 0, g: 0, b: 0 };
    }

    // Handle rgb/rgba colors
    if (normalized.startsWith('rgb')) {
      return this.rgbToFigma(normalized);
    }

    // Handle hsl/hsla colors
    if (normalized.startsWith('hsl')) {
      return this.hslToFigma(normalized);
    }

    // Handle named colors (expanded set)
    const namedColors: Record<string, FigmaColor> = {
      'black': { r: 0, g: 0, b: 0 },
      'white': { r: 1, g: 1, b: 1 },
      'red': { r: 1, g: 0, b: 0 },
      'green': { r: 0, g: 0.5, b: 0 },
      'blue': { r: 0, g: 0, b: 1 },
      'yellow': { r: 1, g: 1, b: 0 },
      'cyan': { r: 0, g: 1, b: 1 },
      'magenta': { r: 1, g: 0, b: 1 },
      'gray': { r: 0.5, g: 0.5, b: 0.5 },
      'grey': { r: 0.5, g: 0.5, b: 0.5 },
      'orange': { r: 1, g: 0.647, b: 0 },
      'purple': { r: 0.5, g: 0, b: 0.5 },
      'transparent': { r: 0, g: 0, b: 0, a: 0 },
    };

    return namedColors[normalized] || { r: 0, g: 0, b: 0 };
  }

  static isTransparent(color: FigmaColor): boolean {
    return color.a === 0 || (color.r === 0 && color.g === 0 && color.b === 0 && color.a === undefined);
  }

  static toRgbaString(color: FigmaColor): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    const a = color.a !== undefined ? color.a : 1;
    
    return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  static clearCache(): void {
    this.cssVariableCache.clear();
  }
}

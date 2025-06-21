
import { ColorParser } from '../color-parser';

export class StyleParser {
  static parseCornerRadius(borderRadius: string): number | number[] {
    if (!borderRadius || borderRadius === '0px') return 0;
    
    const values = borderRadius.split(' ').map(val => parseFloat(val) || 0);
    
    if (values.length === 1) return values[0];
    if (values.every(val => val === values[0])) return values[0];
    
    return values.slice(0, 4);
  }

  static parseOpacity(opacity: string): number {
    const value = parseFloat(opacity);
    return isNaN(value) ? 1 : Math.max(0, Math.min(1, value));
  }

  static parseEffects(styles: CSSStyleDeclaration): any[] {
    const effects = [];
    const boxShadow = styles.boxShadow;
    
    if (boxShadow && boxShadow !== 'none') {
      const shadows = this.parseBoxShadow(boxShadow);
      effects.push(...shadows);
    }
    
    return effects;
  }

  private static parseBoxShadow(boxShadow: string): any[] {
    const effects = [];
    
    // Split multiple shadows
    const shadows = boxShadow.split(/,(?![^()]*\))/);
    
    for (const shadow of shadows) {
      const effect = this.parseSingleShadow(shadow.trim());
      if (effect) {
        effects.push(effect);
      }
    }
    
    return effects;
  }

  private static parseSingleShadow(shadow: string): any | null {
    // Enhanced shadow parsing
    const shadowMatch = shadow.match(/(-?\d+(?:\.\d+)?px)\s+(-?\d+(?:\.\d+)?px)\s+(-?\d+(?:\.\d+)?px)\s*(-?\d+(?:\.\d+)?px)?\s*(rgba?\([^)]+\)|hsla?\([^)]+\)|#[a-fA-F0-9]+|\w+)?/);
    
    if (shadowMatch) {
      return {
        type: 'DROP_SHADOW',
        offset: {
          x: parseFloat(shadowMatch[1]),
          y: parseFloat(shadowMatch[2]),
        },
        radius: parseFloat(shadowMatch[3]),
        spread: shadowMatch[4] ? parseFloat(shadowMatch[4]) : 0,
        color: ColorParser.parse(shadowMatch[5] || 'rgba(0,0,0,0.25)'),
        visible: true,
      };
    }
    
    return null;
  }

  static parseTransform(transform: string): { rotation?: number; scale?: { x: number; y: number } } | null {
    if (!transform || transform === 'none') return null;

    const result: { rotation?: number; scale?: { x: number; y: number } } = {};
    
    // Parse rotation
    const rotateMatch = transform.match(/rotate\(([^)]+)\)/);
    if (rotateMatch) {
      const angle = parseFloat(rotateMatch[1]);
      result.rotation = angle * (Math.PI / 180); // Convert to radians
    }
    
    // Parse scale
    const scaleMatch = transform.match(/scale\(([^)]+)\)/);
    if (scaleMatch) {
      const scaleValues = scaleMatch[1].split(',').map(v => parseFloat(v.trim()));
      result.scale = {
        x: scaleValues[0] || 1,
        y: scaleValues[1] || scaleValues[0] || 1,
      };
    }
    
    return Object.keys(result).length > 0 ? result : null;
  }

  static parseBackgroundImage(backgroundImage: string): any | null {
    if (!backgroundImage || backgroundImage === 'none') return null;
    
    // Simple gradient parsing - could be enhanced
    if (backgroundImage.includes('linear-gradient')) {
      return this.parseLinearGradient(backgroundImage);
    }
    
    if (backgroundImage.includes('radial-gradient')) {
      return this.parseRadialGradient(backgroundImage);
    }
    
    // URL images
    const urlMatch = backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
    if (urlMatch) {
      return {
        type: 'IMAGE',
        imageRef: urlMatch[1],
        scaleMode: 'FILL', // Default scale mode
      };
    }
    
    return null;
  }

  private static parseLinearGradient(gradient: string): any {
    // Basic linear gradient parsing
    return {
      type: 'GRADIENT_LINEAR',
      gradientHandlePositions: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
      gradientStops: [
        { position: 0, color: { r: 0, g: 0, b: 0, a: 1 } },
        { position: 1, color: { r: 1, g: 1, b: 1, a: 1 } },
      ],
    };
  }

  private static parseRadialGradient(gradient: string): any {
    // Basic radial gradient parsing
    return {
      type: 'GRADIENT_RADIAL',
      gradientHandlePositions: [
        { x: 0.5, y: 0.5 },
        { x: 1, y: 0.5 },
      ],
      gradientStops: [
        { position: 0, color: { r: 0, g: 0, b: 0, a: 1 } },
        { position: 1, color: { r: 1, g: 1, b: 1, a: 1 } },
      ],
    };
  }
}

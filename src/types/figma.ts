
export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface FigmaFill {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'IMAGE';
  color: FigmaColor;
  opacity?: number;
}

export interface FigmaStroke {
  type: 'SOLID';
  color: FigmaColor;
}

export interface FigmaEffect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR';
  color?: FigmaColor;
  offset?: { x: number; y: number };
  radius: number;
  spread?: number;
}

export interface FigmaFontName {
  family: string;
  style: 'Regular' | 'Medium' | 'Bold' | 'Light' | 'Italic';
}

export interface FigmaBaseNode {
  type: string;
  name: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fills?: FigmaFill[];
  strokes?: FigmaStroke[];
  strokeWeight?: number;
  cornerRadius?: number | number[];
  effects?: FigmaEffect[];
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
}

export interface FigmaFrameNode extends FigmaBaseNode {
  type: 'FRAME' | 'GROUP' | 'COMPONENT';
  children?: FigmaNode[];
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX';
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX';
}

export interface FigmaTextNode extends FigmaBaseNode {
  type: 'TEXT';
  characters: string;
  fontSize?: number;
  fontName?: FigmaFontName;
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM';
  letterSpacing?: number;
  lineHeight?: number | { value: number; unit: 'PIXELS' | 'PERCENT' };
  textCase?: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE';
  textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
}

export interface FigmaRectangleNode extends FigmaBaseNode {
  type: 'RECTANGLE';
}

export interface FigmaEllipseNode extends FigmaBaseNode {
  type: 'ELLIPSE';
}

export type FigmaNode = FigmaFrameNode | FigmaTextNode | FigmaRectangleNode | FigmaEllipseNode;

export interface FigmaPluginMessage {
  type: 'CREATE_NODES' | 'UPDATE_SELECTION' | 'GET_SELECTION';
  nodes?: FigmaNode[];
  data?: any;
}

export interface ConversionOptions {
  includeHiddenElements?: boolean;
  preserveAbsolutePositioning?: boolean;
  maxDepth?: number;
  customElementHandlers?: Map<string, (element: HTMLElement) => FigmaNode | null>;
}

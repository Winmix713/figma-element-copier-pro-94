
import { Color, Vector, Rectangle, ColorStop, Transform, ImageFilters, Hyperlink } from './core';

export type NodeType = 
  | 'DOCUMENT' 
  | 'CANVAS' 
  | 'FRAME' 
  | 'GROUP' 
  | 'VECTOR' 
  | 'BOOLEAN_OPERATION' 
  | 'STAR' 
  | 'LINE' 
  | 'ELLIPSE' 
  | 'REGULAR_POLYGON' 
  | 'RECTANGLE' 
  | 'TEXT' 
  | 'SLICE' 
  | 'COMPONENT' 
  | 'COMPONENT_SET' 
  | 'INSTANCE';

export interface LayoutConstraint {
  vertical: string;
  horizontal: string;
}

export interface Paint {
  type: string;
  visible?: boolean;
  opacity?: number;
  color?: Color;
  gradientHandlePositions?: Vector[];
  gradientStops?: ColorStop[];
  scaleMode?: string;
  imageTransform?: Transform;
  scalingFactor?: number;
  rotation?: number;
  imageRef?: string;
  filters?: ImageFilters;
}

export interface Effect {
  type: string;
  visible?: boolean;
  radius?: number;
  color?: Color;
  blendMode?: string;
  offset?: Vector;
  spread?: number;
  showShadowBehindNode?: boolean;
}

export interface TypeStyle {
  fontFamily: string;
  fontPostScriptName?: string;
  paragraphSpacing?: number;
  paragraphIndent?: number;
  listSpacing?: number;
  hangingPunctuation?: boolean;
  hangingList?: boolean;
  fontSize: number;
  textDecoration?: string;
  textCase?: string;
  lineHeightPx: number;
  lineHeightPercent?: number;
  lineHeightPercentFontSize?: number;
  lineHeightUnit: string;
  letterSpacing: number;
  fills: Paint[];
  hyperlink?: Hyperlink;
  opentypeFlags?: Record<string, number>;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: NodeType;
  children?: FigmaNode[];
  backgroundColor?: Color;
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  strokeAlign?: string;
  cornerRadius?: number;
  absoluteBoundingBox?: Rectangle;
  constraints?: LayoutConstraint;
  layoutAlign?: string;
  layoutGrow?: number;
  layoutSizingHorizontal?: string;
  layoutSizingVertical?: string;
  clipsContent?: boolean;
  background?: Paint[];
  layoutMode?: string;
  itemSpacing?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  layoutWrap?: string;
  strokeCap?: string;
  strokeJoin?: string;
  strokeDashes?: number[];
  opacity?: number;
  blendMode?: string;
  isMask?: boolean;
  effects?: Effect[];
  characters?: string;
  style?: TypeStyle;
  characterStyleOverrides?: number[];
  styleOverrideTable?: Record<string, TypeStyle>;
}

export interface FigmaFontName {
  family: string;
  style: string;
}

export interface FigmaFrameNode extends Omit<FigmaNode, 'type' | 'cornerRadius'> {
  type: 'FRAME';
  children?: FigmaNode[];
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  itemSpacing?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  effects?: any[];
  width: number;
  height: number;
  fills?: any[];
  cornerRadius?: number | number[];
  opacity?: number;
}

export interface FigmaTextNode extends Omit<FigmaNode, 'type'> {
  type: 'TEXT';
  characters: string;
  fontSize: number;
  fontName: FigmaFontName;
  fills?: any[];
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM';
  letterSpacing?: number;
  lineHeight?: number | { value: number; unit: 'PIXELS' | 'PERCENT' };
  textCase?: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE';
  textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
  width: number;
  height: number;
}

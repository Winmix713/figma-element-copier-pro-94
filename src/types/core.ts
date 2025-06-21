
// Core Figma types that are used across the application
export interface Vector {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Transform {
  m00: number;
  m01: number;
  m02: number;
  m10: number;
  m11: number;
  m12: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface ColorStop {
  position: number;
  color: Color;
}

export interface ImageFilters {
  exposure?: number;
  contrast?: number;
  saturation?: number;
  temperature?: number;
  tint?: number;
  highlights?: number;
  shadows?: number;
}

export interface Hyperlink {
  type: string;
  url?: string;
  nodeID?: string;
}

export interface DocumentationLink {
  uri: string;
}

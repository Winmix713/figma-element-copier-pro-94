
import { useCallback, useRef } from "react";
import type { FigmaApiResponse, TypeStyle } from "@/types/figma";

const DEBUG = process.env.NODE_ENV === "development";
const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[FigmaDataService] ${message}`, data || "");
  }
};

export function useFigmaDataService() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const createMockFigmaData = useCallback((): FigmaApiResponse => {
    const mockTypeStyle: TypeStyle = {
      fontSize: 16,
      fontFamily: "Inter",
      lineHeightPx: 24,
      lineHeightUnit: "PIXELS",
      letterSpacing: 0,
      fills: [{
        type: "SOLID",
        color: { r: 0, g: 0, b: 0, a: 1 }
      }]
    };

    return {
      name: "Sample Design System",
      version: "1.0.0",
      lastModified: new Date().toISOString(),
      editorType: "figma",
      document: {
        id: "0:0",
        name: "Document",
        type: "DOCUMENT",
        children: [
          {
            id: "1:1",
            name: "Button Component",
            type: "FRAME",
            absoluteBoundingBox: { x: 0, y: 0, width: 120, height: 40 },
            children: [
              {
                id: "1:2",
                name: "Button Text",
                type: "TEXT",
                characters: "Click me",
                style: mockTypeStyle,
              },
            ],
          },
        ],
      },
      components: {
        "1:1": {
          key: "1:1",
          name: "Button Component",
          description: "Primary button component",
          documentationLinks: [],
        },
      },
      styles: {
        "S:1": {
          key: "S:1",
          name: "Primary Color",
          styleType: "FILL",
          description: "Primary brand color",
        },
      },
      schemaVersion: 1,
      thumbnailUrl: "",
      role: "owner",
      linkAccess: "view",
    };
  }, []);

  const fetchFigmaData = useCallback(
    async (fileKey: string): Promise<FigmaApiResponse> => {
      if (!fileKey.trim()) {
        throw new Error("File key is required");
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      debugLog("Fetching Figma data", { fileKey });

      if (process.env.NODE_ENV === "development" && fileKey === "mock") {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return createMockFigmaData();
      }

      const response = await fetch(`/api/figma/${fileKey}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: FigmaApiResponse = await response.json();

      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format from Figma API");
      }

      return data;
    },
    [createMockFigmaData],
  );

  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    fetchFigmaData,
    cleanup,
  };
}

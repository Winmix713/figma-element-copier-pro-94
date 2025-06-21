import { useState, useCallback, useEffect, useRef } from "react";
import type { FigmaApiResponse, GeneratedComponent } from "@shared/types/figma";
import type { CodeGenerationOptions, CustomCodeInputs, DebugInfo } from "@shared/types/generation";
import { EnhancedCodeGenerationPanel } from "./EnhancedCodeGenerationPanel";
import { FileInput } from "./FileInput";
import { DebugPanel } from "./DebugPanel";
import { AlertMessages } from "./AlertMessages";
import { HelpGuide } from "./HelpGuide";
import { GeneratedComponentsDisplay } from "./GeneratedComponentsDisplay";

const DEBUG = process.env.NODE_ENV === "development";
const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[FigmaGenerator] ${message}`, data || "");
  }
};

interface AppState {
  figmaData: FigmaApiResponse | null;
  fileKey: string;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  generatedComponents: GeneratedComponent[];
  debugInfo: DebugInfo;
}

export function FigmaGenerator() {
  const [state, setState] = useState<AppState>({
    figmaData: null,
    fileKey: "",
    isLoading: false,
    error: null,
    success: null,
    generatedComponents: [],
    debugInfo: {
      lastAction: "initialized",
      timestamp: new Date(),
      apiCalls: 0,
      errors: [],
    },
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleError = useCallback((error: string | Error, context?: string) => {
    const errorMessage = error instanceof Error ? error.message : error;
    const fullError = context ? `${context}: ${errorMessage}` : errorMessage;

    debugLog("Error occurred", {
      error: fullError,
      context,
      stack: error instanceof Error ? error.stack : null,
    });

    setState((prev) => ({
      ...prev,
      error: fullError,
      isLoading: false,
      debugInfo: {
        ...prev.debugInfo,
        lastAction: `error: ${context || "unknown"}`,
        timestamp: new Date(),
        errors: [...prev.debugInfo.errors, fullError].slice(-10),
      },
    }));
  }, []);

  const handleSuccess = useCallback((message: string) => {
    debugLog("Success", message);

    setState((prev) => ({
      ...prev,
      success: message,
      error: null,
      debugInfo: {
        ...prev.debugInfo,
        lastAction: "success",
        timestamp: new Date(),
      },
    }));

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, success: null }));
    }, 5000);
  }, []);

  const createMockFigmaData = useCallback((): FigmaApiResponse => {
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
                style: {
                  fontSize: 16,
                  fontFamily: "Inter",
                },
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
    async (fileKey: string) => {
      if (!fileKey.trim()) {
        handleError("File key is required", "fetchFigmaData");
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        debugInfo: {
          ...prev.debugInfo,
          lastAction: "fetching figma data",
          timestamp: new Date(),
          apiCalls: prev.debugInfo.apiCalls + 1,
        },
      }));

      try {
        debugLog("Fetching Figma data", { fileKey });

        if (process.env.NODE_ENV === "development" && fileKey === "mock") {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          const mockData = createMockFigmaData();

          setState((prev) => ({
            ...prev,
            figmaData: mockData,
            fileKey,
            isLoading: false,
            debugInfo: {
              ...prev.debugInfo,
              lastAction: "mock data loaded",
              timestamp: new Date(),
            },
          }));

          handleSuccess("Mock Figma data loaded successfully!");
          return;
        }

        // Extract file ID from Figma URL if needed
        let extractedFileKey = fileKey;
        if (fileKey.includes('figma.com')) {
          const match = fileKey.match(/\/design\/([a-zA-Z0-9]+)/);
          if (match) {
            extractedFileKey = match[1];
          }
        }

        const response = await fetch(`/api/figma/${extractedFileKey}`, {
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

        setState((prev) => ({
          ...prev,
          figmaData: data,
          fileKey,
          isLoading: false,
          debugInfo: {
            ...prev.debugInfo,
            lastAction: "figma data loaded",
            timestamp: new Date(),
          },
        }));

        handleSuccess("Figma data loaded successfully!");
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          debugLog("Request aborted");
          return;
        }
        handleError(error as Error, "fetchFigmaData");
      }
    },
    [handleError, handleSuccess, createMockFigmaData]
  );

  const handleCodeGeneration = useCallback(
    async (options: CodeGenerationOptions, customCode: CustomCodeInputs) => {
      if (!state.figmaData) {
        handleError(
          "No Figma data available. Please load a file first.",
          "handleCodeGeneration"
        );
        return;
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        debugInfo: {
          ...prev.debugInfo,
          lastAction: "generating code",
          timestamp: new Date(),
        },
      }));

      try {
        debugLog("Starting code generation", { options, customCode });

        const { EnhancedCodeGenerator } = await import("@/services/enhanced-code-generator");
        const generator = new EnhancedCodeGenerator(state.figmaData, options);

        if (customCode && (customCode.jsx || customCode.css || customCode.cssAdvanced)) {
          generator.setCustomCode(customCode);
          debugLog("Custom code applied", customCode);
        }

        const components = await generator.generateComponents();

        if (!components || components.length === 0) {
          throw new Error(
            "No components were generated. Please check your Figma file structure."
          );
        }

        setState((prev) => ({
          ...prev,
          generatedComponents: components,
          isLoading: false,
          debugInfo: {
            ...prev.debugInfo,
            lastAction: "code generated",
            timestamp: new Date(),
          },
        }));

        handleSuccess(
          `Successfully generated ${components.length} component${components.length > 1 ? "s" : ""}!`
        );
      } catch (error) {
        handleError(error as Error, "handleCodeGeneration");
      }
    },
    [state.figmaData, handleError, handleSuccess]
  );

  const handleFileKeyChange = useCallback((newFileKey: string) => {
    setState((prev) => ({
      ...prev,
      fileKey: newFileKey,
      error: null,
    }));
  }, []);

  const handleLoadFile = useCallback(() => {
    if (!state.fileKey.trim()) {
      handleError("Please enter a valid Figma file key", "handleLoadFile");
      return;
    }
    fetchFigmaData(state.fileKey);
  }, [state.fileKey, fetchFigmaData]);

  const handleLoadDemo = useCallback(() => {
    handleFileKeyChange("mock");
    setTimeout(() => handleLoadFile(), 100);
  }, [handleFileKeyChange, handleLoadFile]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const clearSuccess = useCallback(() => {
    setState((prev) => ({ ...prev, success: null }));
  }, []);

  const handleComponentUpdate = useCallback((updatedComponent: GeneratedComponent) => {
    setState((prev) => ({
      ...prev,
      generatedComponents: prev.generatedComponents.map(comp => 
        comp.id === updatedComponent.id ? updatedComponent : comp
      ),
    }));
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <DebugPanel 
        debugInfo={state.debugInfo} 
        generatedComponentsCount={state.generatedComponents.length} 
      />

      <AlertMessages
        error={state.error}
        success={state.success}
        onClearError={clearError}
        onClearSuccess={clearSuccess}
      />

      <FileInput
        fileKey={state.fileKey}
        isLoading={state.isLoading}
        figmaData={state.figmaData}
        error={state.error}
        onFileKeyChange={handleFileKeyChange}
        onLoadFile={handleLoadFile}
        debugInfo={state.debugInfo}
      />

      {state.figmaData && (
        <EnhancedCodeGenerationPanel
          figmaData={state.figmaData}
          fileKey={state.fileKey}
          onGenerate={handleCodeGeneration}
        />
      )}

      <HelpGuide
        onLoadDemo={handleLoadDemo}
        isLoading={state.isLoading}
      />

      {state.generatedComponents.length > 0 && (
        <GeneratedComponentsDisplay
          components={state.generatedComponents}
          onComponentUpdate={handleComponentUpdate}
        />
      )}
    </div>
  );
}

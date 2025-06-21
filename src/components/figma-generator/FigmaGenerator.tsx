
"use client";

import { useCallback, useEffect, useRef } from "react";
import type { CodeGenerationOptions, CustomCodeInputs } from "@/types/figma";
import { EnhancedCodeGenerationPanel } from "../enhanced-code-generation-panel";
import { FileInput } from "./FileInput";
import { DebugPanel } from "./DebugPanel";
import { AlertMessages } from "./AlertMessages";
import { HelpGuide } from "./HelpGuide";
import { useFigmaGeneratorState } from "./FigmaGeneratorState";
import { useFigmaDataService } from "./FigmaDataService";

interface EnhancedFigmaGeneratorProps {
  initialFileKey?: string;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export function EnhancedFigmaGenerator({
  initialFileKey = "",
  onError,
  onSuccess,
}: EnhancedFigmaGeneratorProps) {
  const {
    state,
    setLoading,
    setError,
    setSuccess,
    setFigmaData,
    setFileKey,
    incrementApiCalls,
    updateState,
  } = useFigmaGeneratorState(initialFileKey);

  const { fetchFigmaData, cleanup } = useFigmaDataService();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced error handling
  const handleError = useCallback(
    (error: string | Error, context?: string) => {
      const errorMessage = error instanceof Error ? error.message : error;
      const fullError = context ? `${context}: ${errorMessage}` : errorMessage;

      console.error(`[FigmaGenerator] Error occurred`, {
        error: fullError,
        context,
        stack: error instanceof Error ? error.stack : null,
      });

      setError(fullError);
      onError?.(fullError);
    },
    [onError, setError],
  );

  // Enhanced success handling
  const handleSuccess = useCallback(
    (message: string) => {
      console.log(`[FigmaGenerator] Success`, message);

      setSuccess(message);
      onSuccess?.(message);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setSuccess(null);
      }, 5000);
    },
    [onSuccess, setSuccess],
  );

  // Enhanced Figma data fetching
  const loadFigmaData = useCallback(
    async (fileKey: string) => {
      setLoading(true);
      incrementApiCalls();

      try {
        const data = await fetchFigmaData(fileKey);
        setFigmaData(data);
        setFileKey(fileKey);
        setLoading(false);
        handleSuccess("Figma data loaded successfully!");
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("[FigmaGenerator] Request aborted");
          return;
        }
        handleError(error as Error, "loadFigmaData");
      }
    },
    [fetchFigmaData, setLoading, setFigmaData, setFileKey, incrementApiCalls, handleError, handleSuccess],
  );

  // Enhanced code generation
  const handleCodeGeneration = useCallback(
    async (options: CodeGenerationOptions, customCode: CustomCodeInputs) => {
      if (!state.figmaData) {
        handleError(
          "No Figma data available. Please load a file first.",
          "handleCodeGeneration",
        );
        return;
      }

      setLoading(true);

      try {
        console.log("[FigmaGenerator] Starting code generation", { options, customCode });

        const { AdvancedCodeGenerator } = await import(
          "@/services/advanced-code-generator"
        );

        const generator = new AdvancedCodeGenerator(state.figmaData, options);

        if (
          customCode &&
          (customCode.jsx || customCode.css || customCode.cssAdvanced)
        ) {
          generator.setCustomCode(customCode);
          console.log("[FigmaGenerator] Custom code applied", customCode);
        }

        const components = await generator.generateComponents();

        if (!components || components.length === 0) {
          throw new Error(
            "No components were generated. Please check your Figma file structure.",
          );
        }

        updateState({
          generatedComponents: components,
          isLoading: false,
        });

        handleSuccess(
          `Successfully generated ${components.length} component${components.length > 1 ? "s" : ""}!`,
        );
      } catch (error) {
        handleError(error as Error, "handleCodeGeneration");
      }
    },
    [state.figmaData, handleError, handleSuccess, setLoading, updateState],
  );

  // File key input handler
  const handleFileKeyChange = useCallback((newFileKey: string) => {
    setFileKey(newFileKey);
  }, [setFileKey]);

  // Load file handler
  const handleLoadFile = useCallback(() => {
    if (!state.fileKey.trim()) {
      handleError("Please enter a valid Figma file key", "handleLoadFile");
      return;
    }
    loadFigmaData(state.fileKey);
  }, [state.fileKey, loadFigmaData, handleError]);

  // Demo loader
  const handleLoadDemo = useCallback(() => {
    handleFileKeyChange("mock");
    setTimeout(() => handleLoadFile(), 100);
  }, [handleFileKeyChange, handleLoadFile]);

  // Clear handlers
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const clearSuccess = useCallback(() => {
    setSuccess(null);
  }, [setSuccess]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [cleanup]);

  // Auto-load if initial file key is provided
  useEffect(() => {
    if (initialFileKey && !state.figmaData && !state.isLoading) {
      console.log("[FigmaGenerator] Auto-loading initial file", { initialFileKey });
      loadFigmaData(initialFileKey);
    }
  }, [initialFileKey, state.figmaData, state.isLoading, loadFigmaData]);

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
    </div>
  );
}

export default EnhancedFigmaGenerator;

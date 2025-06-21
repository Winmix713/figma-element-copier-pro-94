"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw,
  FileText,
  Bug,
  Info,
} from "lucide-react";
import type { FigmaApiResponse, GeneratedComponent } from "@/types/figma";
import type {
  CodeGenerationOptions,
  CustomCodeInputs,
} from "@/services/enhanced-code-generator";
import { EnhancedCodeGenerationPanel } from "../enhanced-code-generation-panel";

// Debug logging utility
const DEBUG = process.env.NODE_ENV === "development";
const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[FigmaGenerator] ${message}`, data || "");
  }
};

interface EnhancedFigmaGeneratorProps {
  initialFileKey?: string;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

interface AppState {
  figmaData: FigmaApiResponse | null;
  fileKey: string;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  generatedComponents: GeneratedComponent[];
  debugInfo: {
    lastAction: string;
    timestamp: Date;
    apiCalls: number;
    errors: string[];
  };
}

export function EnhancedFigmaGenerator({
  initialFileKey = "",
  onError,
  onSuccess,
}: EnhancedFigmaGeneratorProps) {
  // Centralized state management
  const [state, setState] = useState<AppState>({
    figmaData: null,
    fileKey: initialFileKey,
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

  // Refs for cleanup and debugging
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced error handling
  const handleError = useCallback(
    (error: string | Error, context?: string) => {
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
          errors: [...prev.debugInfo.errors, fullError].slice(-10), // Keep last 10 errors
        },
      }));

      // Call external error handler if provided
      onError?.(fullError);
    },
    [onError],
  );

  // Enhanced success handling
  const handleSuccess = useCallback(
    (message: string) => {
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

      onSuccess?.(message);

      // Auto-clear success message
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, success: null }));
      }, 5000);
    },
    [onSuccess],
  );

  // Mock Figma data for development/testing
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
                  fontWeight: 500,
                  fontFamily: "Inter",
                },
              },
            ],
          },
          {
            id: "2:1",
            name: "Card Component",
            type: "FRAME",
            absoluteBoundingBox: { x: 0, y: 60, width: 300, height: 200 },
            children: [
              {
                id: "2:2",
                name: "Card Title",
                type: "TEXT",
                characters: "Card Title",
                style: {
                  fontSize: 20,
                  fontWeight: 600,
                  fontFamily: "Inter",
                },
              },
              {
                id: "2:3",
                name: "Card Content",
                type: "TEXT",
                characters: "This is the card content area.",
                style: {
                  fontSize: 14,
                  fontWeight: 400,
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
        },
        "2:1": {
          key: "2:1",
          name: "Card Component",
          description: "Basic card component",
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
    };
  }, []);

  // Enhanced Figma data fetching with proper error handling
  const fetchFigmaData = useCallback(
    async (fileKey: string) => {
      if (!fileKey.trim()) {
        handleError("File key is required", "fetchFigmaData");
        return;
      }

      // Cancel previous request
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

        // For development, use mock data if API is not available
        if (process.env.NODE_ENV === "development" && fileKey === "mock") {
          // Simulate API delay
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

        // Real API call
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

        // Validate response data
        if (!data || typeof data !== "object") {
          throw new Error("Invalid response format from Figma API");
        }

        debugLog("Figma data fetched successfully", {
          componentsCount: Object.keys(data.components || {}).length,
          stylesCount: Object.keys(data.styles || {}).length,
        });

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
    [handleError, handleSuccess, createMockFigmaData],
  );

  // Enhanced code generation with proper error handling
  const handleCodeGeneration = useCallback(
    async (options: CodeGenerationOptions, customCode: CustomCodeInputs) => {
      if (!state.figmaData) {
        handleError(
          "No Figma data available. Please load a file first.",
          "handleCodeGeneration",
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

        // Import the code generator dynamically to handle potential import errors
        const { EnhancedCodeGenerator } = await import(
          "@/services/enhanced-code-generator"
        );

        const generator = new EnhancedCodeGenerator(state.figmaData, options);

        // Set custom code if provided
        if (
          customCode &&
          (customCode.jsx || customCode.css || customCode.cssAdvanced)
        ) {
          generator.setCustomCode(customCode);
          debugLog("Custom code applied", customCode);
        }

        const components = await generator.generateComponents();

        if (!components || components.length === 0) {
          throw new Error(
            "No components were generated. Please check your Figma file structure.",
          );
        }

        debugLog("Code generation completed", {
          componentsGenerated: components.length,
          componentNames: components.map((c) => c.name),
        });

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
          `Successfully generated ${components.length} component${components.length > 1 ? "s" : ""}!`,
        );
      } catch (error) {
        handleError(error as Error, "handleCodeGeneration");
      }
    },
    [state.figmaData, handleError, handleSuccess],
  );

  // File key input handler with validation
  const handleFileKeyChange = useCallback((newFileKey: string) => {
    setState((prev) => ({
      ...prev,
      fileKey: newFileKey,
      error: null, // Clear previous errors when user types
    }));
  }, []);

  // Load file handler
  const handleLoadFile = useCallback(() => {
    if (!state.fileKey.trim()) {
      handleError("Please enter a valid Figma file key", "handleLoadFile");
      return;
    }
    fetchFigmaData(state.fileKey);
  }, [state.fileKey, fetchFigmaData]);

  // Clear error handler
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Clear success handler
  const clearSuccess = useCallback(() => {
    setState((prev) => ({ ...prev, success: null }));
  }, []);

  // Cleanup on unmount
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

  // Auto-load if initial file key is provided
  useEffect(() => {
    if (initialFileKey && !state.figmaData && !state.isLoading) {
      debugLog("Auto-loading initial file", { initialFileKey });
      fetchFigmaData(initialFileKey);
    }
  }, [initialFileKey, state.figmaData, state.isLoading, fetchFigmaData]);

  return (
    <div className="space-y-6">
      {/* Debug Panel (Development Only) */}
      {DEBUG && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-800">
              <Bug className="w-5 h-5" />
              <span>Debug Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Last Action:</strong> {state.debugInfo.lastAction}
              </div>
              <div>
                <strong>Timestamp:</strong>{" "}
                {state.debugInfo.timestamp.toLocaleTimeString()}
              </div>
              <div>
                <strong>API Calls:</strong> {state.debugInfo.apiCalls}
              </div>
              <div>
                <strong>Components:</strong> {state.generatedComponents.length}
              </div>
            </div>
            {state.debugInfo.errors.length > 0 && (
              <div className="mt-2">
                <strong>Recent Errors:</strong>
                <ul className="list-disc list-inside mt-1 text-xs">
                  {state.debugInfo.errors.slice(-3).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {state.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{state.error}</span>
            <Button variant="ghost" size="sm" onClick={clearError}>
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Display */}
      {state.success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="flex items-center justify-between text-green-800">
            <span>{state.success}</span>
            <Button variant="ghost" size="sm" onClick={clearSuccess}>
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* File Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Figma File Loader</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="file-key">Figma File Key</Label>
              <Input
                id="file-key"
                type="text"
                placeholder="Enter Figma file key or 'mock' for demo"
                value={state.fileKey}
                onChange={(e) => handleFileKeyChange(e.target.value)}
                disabled={state.isLoading}
                className={
                  state.error && state.error.includes("file key")
                    ? "border-red-500"
                    : ""
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tip: Use "mock" to load demo data for testing
              </p>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleLoadFile}
                disabled={state.isLoading || !state.fileKey.trim()}
                className="min-w-[100px]"
              >
                {state.isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Load File
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Loading Progress */}
          {state.isLoading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Loading Figma data...</span>
                <span>{state.debugInfo.lastAction}</span>
              </div>
              <Progress value={undefined} className="h-2" />
            </div>
          )}

          {/* File Info */}
          {state.figmaData && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{state.figmaData.name}</h4>
                <Badge variant="outline">v{state.figmaData.version}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Components:</span>
                  <span className="ml-2 font-medium">
                    {Object.keys(state.figmaData.components || {}).length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Styles:</span>
                  <span className="ml-2 font-medium">
                    {Object.keys(state.figmaData.styles || {}).length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Modified:</span>
                  <span className="ml-2 font-medium">
                    {new Date(
                      state.figmaData.lastModified,
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Code Generation Panel */}
      {state.figmaData && (
        <EnhancedCodeGenerationPanel
          figmaData={state.figmaData}
          fileKey={state.fileKey}
          onGenerate={handleCodeGeneration}
        />
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>Quick Start Guide</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="getting-started">
            <TabsList>
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
              <TabsTrigger value="demo">Demo Mode</TabsTrigger>
              <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
            </TabsList>

            <TabsContent value="getting-started" className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium">How to use:</h4>
                <ol className="space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Get your Figma file key from the URL</li>
                  <li>Paste it in the input field above</li>
                  <li>Click "Load File" to fetch your design</li>
                  <li>Configure generation settings</li>
                  <li>Click "Generate Enhanced Components"</li>
                  <li>Download or copy your generated code</li>
                </ol>
              </div>
            </TabsContent>

            <TabsContent value="demo" className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium">Try the Demo:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Type "mock" in the file key input</li>
                  <li>• Click "Load File" to load sample components</li>
                  <li>• Experiment with different generation settings</li>
                  <li>• See how custom code integration works</li>
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleFileKeyChange("mock");
                    setTimeout(() => handleLoadFile(), 100);
                  }}
                  disabled={state.isLoading}
                >
                  Load Demo Data
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="troubleshooting" className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium">Common Issues:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>
                    • <strong>Import errors:</strong> Check file paths and
                    component exports
                  </li>
                  <li>
                    • <strong>API errors:</strong> Verify Figma file permissions
                    and API setup
                  </li>
                  <li>
                    • <strong>Generation fails:</strong> Try the demo mode first
                  </li>
                  <li>
                    • <strong>Missing components:</strong> Check browser console
                    for detailed errors
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default EnhancedFigmaGenerator;

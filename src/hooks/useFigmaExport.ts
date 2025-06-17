
import { useState, useCallback } from 'react';
import { DOMConverter } from '@/utils/dom-converter';
import { FigmaMessenger } from '@/utils/figma-messenger';
import { ConversionOptions } from '@/types/figma';
import { toast } from '@/hooks/use-toast';

interface UseFigmaExportOptions extends ConversionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseFigmaExportReturn {
  exportToFigma: (elementId: string) => Promise<void>;
  isExporting: boolean;
  isPluginAvailable: boolean;
}

export function useFigmaExport(options: UseFigmaExportOptions = {}): UseFigmaExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const messenger = FigmaMessenger.getInstance();

  const exportToFigma = useCallback(async (elementId: string) => {
    setIsExporting(true);

    try {
      // Find the target element
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID "${elementId}" not found`);
      }

      // Convert DOM element to Figma nodes
      const converter = new DOMConverter(options);
      const figmaNodes = converter.convertElement(element);

      if (figmaNodes.length === 0) {
        throw new Error('No convertible elements found');
      }

      // Send to Figma or clipboard
      const result = await messenger.sendNodes(figmaNodes);

      if (result.success) {
        toast({
          title: "Exported to Figma!",
          description: `Successfully exported ${figmaNodes.length} element(s) to your Figma canvas.`,
        });
        options.onSuccess?.();
      } else {
        // Fallback to clipboard
        if (result.fallbackData) {
          await navigator.clipboard.writeText(result.fallbackData);
          toast({
            title: "Copied to clipboard",
            description: "Figma plugin not detected. Structured data copied to clipboard instead.",
          });
        } else {
          throw new Error('Failed to export or copy to clipboard');
        }
      }

    } catch (error) {
      console.error('Figma export failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Export failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      options.onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsExporting(false);
    }
  }, [options, messenger]);

  return {
    exportToFigma,
    isExporting,
    isPluginAvailable: messenger.isPluginReady(),
  };
}

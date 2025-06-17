
"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { useFigmaExport } from '@/hooks/useFigmaExport';

interface FigmaExportButtonProps {
  elementId: string;
  children?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function FigmaExportButton({ 
  elementId, 
  children,
  variant = "outline",
  size = "sm",
  className = "gap-2"
}: FigmaExportButtonProps) {
  const { exportToFigma, isExporting, isPluginAvailable } = useFigmaExport();

  const handleExport = () => {
    exportToFigma(elementId);
  };

  return (
    <Button 
      onClick={handleExport} 
      disabled={isExporting} 
      variant={variant} 
      size={size} 
      className={className}
    >
      <svg width="16" height="16" viewBox="0 0 20 20">
        <path
          d="M7.084 20c.884-.001 1.731-.353 2.356-.978s.977-1.472.978-2.356v-3.334H7.084a3.34 3.34 0 0 0-2.356.978c-.625.625-.977 1.472-.978 2.356a3.34 3.34 0 0 0 .978 2.356c.625.625 1.472.977 2.356.978z"
          fill="#0acf83"
        />
        <path
          d="M3.75 9.998c.001-.884.353-1.731.978-2.356a3.34 3.34 0 0 1 2.356-.978h3.334v6.666H7.084a3.34 3.34 0 0 1-2.356-.977c-.625-.625-.977-1.472-.978-2.355z"
          fill="#a259ff"
        />
        <path
          d="M3.75 3.334c.001-.884.353-1.731.978-2.356A3.34 3.34 0 0 1 7.084 0h3.334v6.666H7.084c-.884-.001-1.731-.352-2.356-.977s-.977-1.472-.978-2.355z"
          fill="#f24e1e"
        />
        <path
          d="M10.418 0h3.334a3.34 3.34 0 0 1 3.334 3.334 3.34 3.34 0 0 1-3.334 3.334h-3.334V0z"
          fill="#ff7262"
        />
        <path
          d="M17.084 9.998c-.001.884-.352 1.731-.977 2.356a3.34 3.34 0 0 1-4.712 0 3.34 3.34 0 0 1-.977-2.356c.001-.884.352-1.731.977-2.356a3.34 3.34 0 0 1 2.356-.978c.884.001 1.731.353 2.355.978s.976 1.472.977 2.356z"
          fill="#1abcfe"
        />
      </svg>
      {children || (isExporting ? "Exporting..." : "Export to Figma")}
    </Button>
  );
}

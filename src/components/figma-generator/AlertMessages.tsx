
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface AlertMessagesProps {
  error: string | null;
  success: string | null;
  onClearError: () => void;
  onClearSuccess: () => void;
}

export function AlertMessages({ error, success, onClearError, onClearSuccess }: AlertMessagesProps) {
  return (
    <>
      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={onClearError}>
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Display */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="flex items-center justify-between text-green-800">
            <span>{success}</span>
            <Button variant="ghost" size="sm" onClick={onClearSuccess}>
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}

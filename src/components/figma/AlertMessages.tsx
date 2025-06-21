import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface AlertMessagesProps {
  error: string | null;
  success: string | null;
  onClearError: () => void;
  onClearSuccess: () => void;
}

export function AlertMessages({
  error,
  success,
  onClearError,
  onClearSuccess,
}: AlertMessagesProps) {
  if (!error && !success) {
    return null;
  }

  return (
    <div className="space-y-4">
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-green-800 font-medium">Success!</p>
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSuccess}
              className="text-green-500 hover:text-green-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Alert>
      )}

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearError}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Alert>
      )}
    </div>
  );
}

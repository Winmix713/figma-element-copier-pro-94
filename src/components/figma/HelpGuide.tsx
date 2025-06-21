import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Play } from "lucide-react";

interface HelpGuideProps {
  onLoadDemo: () => void;
  isLoading: boolean;
}

export function HelpGuide({ onLoadDemo, isLoading }: HelpGuideProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-blue-500" />
          <span>Quick Start Guide</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
              1
            </div>
            <p className="text-sm text-gray-700">
              Enter a Figma file key or use "mock" to load demo data
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
              2
            </div>
            <p className="text-sm text-gray-700">
              Configure generation options (framework, styling, etc.)
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
              3
            </div>
            <p className="text-sm text-gray-700">
              Generate your components and download the code
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={onLoadDemo}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg"
          >
            <Play className="w-4 h-4 mr-2" />
            Try Demo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

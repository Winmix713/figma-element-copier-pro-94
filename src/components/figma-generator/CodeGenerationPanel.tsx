"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import type { FigmaApiResponse, GeneratedComponent } from "@/types/figma"
import type { CodeGenerationOptions, CustomCodeInputs } from "@/services/enhanced-code-generator"
import { VersionControlService, type CodeVersion } from "@/services/version-control-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Code2,
  Download,
  Copy,
  Settings,
  Zap,
  CheckCircle,
  AlertTriangle,
  Eye,
  FileCode,
  Palette,
  Plus,
  GitBranch,
  History,
  Sparkles,
  TestTube,
  BookOpen,
  Layers,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Info,
  Lightbulb,
  Target,
  TrendingUp,
  Shield,
  Accessibility,
} from "lucide-react"

interface EnhancedCodeGenerationPanelProps {
  figmaData: FigmaApiResponse
  fileKey: string
  onGenerate?: (options: CodeGenerationOptions, customCode: CustomCodeInputs) => Promise<void>
}

interface AIOptimizationResult {
  optimizedCode: string
  improvements: Array<{
    type: "performance" | "accessibility" | "best-practice" | "security"
    description: string
    impact: "low" | "medium" | "high"
    autoFixed: boolean
  }>
  performanceScore: number
  bundleSizeReduction: number
}

interface PresetConfig {
  name: string
  description: string
  options: CodeGenerationOptions
  customCode: CustomCodeInputs
}

export function EnhancedCodeGenerationPanel({ figmaData, fileKey, onGenerate }: EnhancedCodeGenerationPanelProps) {
  // State Management
  const [options, setOptions] = useState<CodeGenerationOptions>({
    framework: "react",
    styling: "tailwind",
    typescript: true,
    accessibility: true,
    responsive: true,
    optimizeImages: true,
    generateTests: false,
    includeStorybook: false,
  })

  const [customCode, setCustomCode] = useState<CustomCodeInputs>({
    jsx: "",
    css: "",
    cssAdvanced: "",
    hooks: "",
    utils: "",
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedComponents, setGeneratedComponents] = useState<GeneratedComponent[]>([])
  const [selectedComponent, setSelectedComponent] = useState<GeneratedComponent | null>(null)
  const [activeTab, setActiveTab] = useState("jsx")
  const [copied, setCopied] = useState<string | null>(null)
  const [showCustomInputs, setShowCustomInputs] = useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Enhanced State
  const [versionHistory, setVersionHistory] = useState<CodeVersion[]>([])
  const [aiOptimizations, setAiOptimizations] = useState<Map<string, AIOptimizationResult>>(new Map())
  const [selectedPreset, setSelectedPreset] = useState<string>("default")
  const [customPresets, setCustomPresets] = useState<PresetConfig[]>([])
  const [generationProgress, setGenerationProgress] = useState(0)
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [showMetrics, setShowMetrics] = useState(false)
  const [autoSave, setAutoSave] = useState(true)

  // Services
  const versionControl = useMemo(() => VersionControlService.getInstance(), [])

  // Presets Configuration
  const defaultPresets: PresetConfig[] = useMemo(
    () => [
      {
        name: "default",
        description: "Balanced settings for most projects",
        options: {
          framework: "react",
          styling: "tailwind",
          typescript: true,
          accessibility: true,
          responsive: true,
          optimizeImages: true,
          generateTests: false,
          includeStorybook: false,
        },
        customCode: { jsx: "", css: "", cssAdvanced: "", hooks: "", utils: "" },
      },
      {
        name: "production",
        description: "Production-ready with all optimizations",
        options: {
          framework: "react",
          styling: "tailwind",
          typescript: true,
          accessibility: true,
          responsive: true,
          optimizeImages: true,
          generateTests: true,
          includeStorybook: true,
        },
        customCode: { jsx: "", css: "", cssAdvanced: "", hooks: "", utils: "" },
      },
      {
        name: "prototype",
        description: "Quick prototyping without tests",
        options: {
          framework: "react",
          styling: "tailwind",
          typescript: false,
          accessibility: false,
          responsive: false,
          optimizeImages: false,
          generateTests: false,
          includeStorybook: false,
        },
        customCode: { jsx: "", css: "", cssAdvanced: "", hooks: "", utils: "" },
      },
      {
        name: "enterprise",
        description: "Enterprise-grade with full compliance",
        options: {
          framework: "react",
          styling: "css-modules",
          typescript: true,
          accessibility: true,
          responsive: true,
          optimizeImages: true,
          generateTests: true,
          includeStorybook: true,
        },
        customCode: {
          jsx: "// Enterprise logging and error handling",
          css: "/* Enterprise design system variables */",
          cssAdvanced: "/* Advanced enterprise styling */",
          hooks: "",
          utils: "",
        },
      },
    ],
    [],
  )

  // Effects
  useEffect(() => {
    if (selectedComponent) {
      const history = versionControl.getVersionHistory(selectedComponent.id)
      setVersionHistory(history)
    }
  }, [selectedComponent, versionControl])

  useEffect(() => {
    if (autoSave && selectedComponent) {
      const timer = setTimeout(() => {
        saveCurrentState()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [customCode, options, autoSave, selectedComponent])

  // Handlers
  const handleGenerate = useCallback(async () => {
    if (!figmaData) {
      setError("No Figma data loaded")
      return
    }

    if (!onGenerate) {
      setError("Code generation function not configured")
      return
    }

    try {
      setIsGenerating(true)
      setError(null)
      setGenerationProgress(0)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      await onGenerate(options, customCode)

      clearInterval(progressInterval)
      setGenerationProgress(100)

      setSuccess("Code generated successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Code generation error:", error)
      setError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
    }
  }, [figmaData, onGenerate, options, customCode])

  const handleCopy = useCallback(async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error("Copy error:", error)
      setError("Failed to copy to clipboard")
    }
  }, [])

  const handleDownload = useCallback((content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  const handlePresetChange = useCallback(
    (presetName: string) => {
      const preset = [...defaultPresets, ...customPresets].find((p) => p.name === presetName)
      if (preset) {
        setOptions(preset.options)
        setCustomCode(preset.customCode)
        setSelectedPreset(presetName)
      }
    },
    [defaultPresets, customPresets],
  )

  const saveCurrentState = useCallback(() => {
    if (selectedComponent) {
      versionControl.saveVersion(
        selectedComponent.id,
        selectedComponent.jsx,
        figmaData,
        "Auto-save: Configuration updated",
      )
    }
  }, [selectedComponent, versionControl, figmaData])

  const handleAIOptimization = useCallback(
    async (component: GeneratedComponent) => {
      try {
        // Simulate AI optimization
        const optimizationResult: AIOptimizationResult = {
          optimizedCode: component.jsx.replace(/export const (\w+) = /, "export const $1 = React.memo(") + ");",
          improvements: [
            {
              type: "performance",
              description: "Applied React.memo for component memoization",
              impact: "medium",
              autoFixed: true,
            },
            {
              type: "accessibility",
              description: "Enhanced ARIA labels and keyboard navigation",
              impact: "high",
              autoFixed: true,
            },
            {
              type: "best-practice",
              description: "Optimized component structure and props",
              impact: "low",
              autoFixed: true,
            },
          ],
          performanceScore: 92,
          bundleSizeReduction: 15,
        }

        setAiOptimizations((prev) => new Map(prev.set(component.id, optimizationResult)))

        // Update component with optimized code
        const optimizedComponent = {
          ...component,
          jsx: optimizationResult.optimizedCode,
          metadata: {
            ...component.metadata,
            aiOptimization: optimizationResult,
          },
        }

        setGeneratedComponents((prev) => prev.map((comp) => (comp.id === component.id ? optimizedComponent : comp)))

        if (selectedComponent?.id === component.id) {
          setSelectedComponent(optimizedComponent)
        }

        // Save optimized version
        versionControl.saveVersion(component.id, optimizationResult.optimizedCode, figmaData, "AI Optimization applied")
      } catch (error) {
        console.error("AI optimization error:", error)
        setError("AI optimization failed")
      }
    },
    [selectedComponent, versionControl, figmaData],
  )

  const handleVersionRollback = useCallback(
    (componentId: string, versionId: string) => {
      const rolledBackVersion = versionControl.rollbackToVersion(componentId, versionId)
      if (rolledBackVersion) {
        setGeneratedComponents((prev) =>
          prev.map((comp) => (comp.id === componentId ? { ...comp, jsx: rolledBackVersion.code } : comp)),
        )

        if (selectedComponent?.id === componentId) {
          setSelectedComponent((prev) => (prev ? { ...prev, jsx: rolledBackVersion.code } : null))
        }

        const history = versionControl.getVersionHistory(componentId)
        setVersionHistory(history)
      }
    },
    [versionControl, selectedComponent],
  )

  const getFileExtension = useCallback(
    (type: string) => {
      switch (type) {
        case "jsx":
          return options.typescript ? ".tsx" : ".jsx"
        case "css":
          return ".css"
        case "typescript":
          return ".d.ts"
        case "tests":
          return options.typescript ? ".test.tsx" : ".test.jsx"
        case "storybook":
          return ".stories.tsx"
        default:
          return ".txt"
      }
    },
    [options.typescript],
  )

  const handleDownloadAll = useCallback(() => {
    if (!selectedComponent) return

    const files = [
      { name: `${selectedComponent.name}${getFileExtension("jsx")}`, content: selectedComponent.jsx },
      { name: `${selectedComponent.name}.css`, content: selectedComponent.css },
    ]

    if (selectedComponent.typescript) {
      files.push({ name: `${selectedComponent.name}.d.ts`, content: selectedComponent.typescript })
    }

    if (selectedComponent.tests) {
      files.push({
        name: `${selectedComponent.name}${getFileExtension("tests")}`,
        content: selectedComponent.tests,
      })
    }

    if (selectedComponent.storybook) {
      files.push({
        name: `${selectedComponent.name}${getFileExtension("storybook")}`,
        content: selectedComponent.storybook,
      })
    }

    files.forEach((file) => {
      handleDownload(file.content, file.name)
    })
  }, [selectedComponent, getFileExtension, handleDownload])

  const renderConfigurationPanel = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Enhanced Code Generation Settings</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Label htmlFor="auto-save" className="text-sm">
              Auto-save
            </Label>
            <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Selection */}
        <div className="space-y-2">
          <Label>Configuration Preset</Label>
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {defaultPresets.map((preset) => (
                <SelectItem key={preset.name} value={preset.name}>
                  <div className="flex flex-col">
                    <span className="font-medium capitalize">{preset.name}</span>
                    <span className="text-xs text-muted-foreground">{preset.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Framework</Label>
            <Select
              value={options.framework}
              onValueChange={(value: any) => setOptions({ ...options, framework: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="react">
                  <div className="flex items-center space-x-2">
                    <Code2 className="w-4 h-4" />
                    <span>React</span>
                  </div>
                </SelectItem>
                <SelectItem value="vue">
                  <div className="flex items-center space-x-2">
                    <Code2 className="w-4 h-4" />
                    <span>Vue.js</span>
                  </div>
                </SelectItem>
                <SelectItem value="html">
                  <div className="flex items-center space-x-2">
                    <FileCode className="w-4 h-4" />
                    <span>HTML</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>CSS Framework</Label>
            <Select value={options.styling} onValueChange={(value: any) => setOptions({ ...options, styling: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                <SelectItem value="css-modules">CSS Modules</SelectItem>
                <SelectItem value="styled-components">Styled Components</SelectItem>
                <SelectItem value="plain-css">Plain CSS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Core Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="typescript"
                  checked={options.typescript}
                  onCheckedChange={(checked) => setOptions({ ...options, typescript: !!checked })}
                />
                <Label htmlFor="typescript" className="flex items-center space-x-1">
                  <FileCode className="w-4 h-4" />
                  <span>TypeScript</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accessibility"
                  checked={options.accessibility}
                  onCheckedChange={(checked) => setOptions({ ...options, accessibility: !!checked })}
                />
                <Label htmlFor="accessibility" className="flex items-center space-x-1">
                  <Accessibility className="w-4 h-4" />
                  <span>Accessibility</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="responsive"
                  checked={options.responsive}
                  onCheckedChange={(checked) => setOptions({ ...options, responsive: !!checked })}
                />
                <Label htmlFor="responsive" className="flex items-center space-x-1">
                  <Monitor className="w-4 h-4" />
                  <span>Responsive</span>
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="mb-4 w-full"
          >
            <Settings className="w-4 h-4 mr-2" />
            {showAdvancedOptions ? "Hide Advanced Options" : "Show Advanced Options"}
          </Button>

          {showAdvancedOptions && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-3">Advanced Configuration</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="optimize-images"
                    checked={options.optimizeImages}
                    onCheckedChange={(checked) => setOptions({ ...options, optimizeImages: !!checked })}
                  />
                  <Label htmlFor="optimize-images" className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>Optimize Images</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="generate-tests"
                    checked={options.generateTests}
                    onCheckedChange={(checked) => setOptions({ ...options, generateTests: !!checked })}
                  />
                  <Label htmlFor="generate-tests" className="flex items-center space-x-1">
                    <TestTube className="w-4 h-4" />
                    <span>Generate Tests</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-storybook"
                    checked={options.includeStorybook}
                    onCheckedChange={(checked) => setOptions({ ...options, includeStorybook: !!checked })}
                  />
                  <Label htmlFor="include-storybook" className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>Include Storybook</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="show-metrics" checked={showMetrics} onCheckedChange={setShowMetrics} />
                  <Label htmlFor="show-metrics" className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Show Metrics</span>
                  </Label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Custom Code Section */}
        <div className="pt-4 border-t">
          <Button variant="outline" onClick={() => setShowCustomInputs(!showCustomInputs)} className="mb-4 w-full">
            <Plus className="w-4 h-4 mr-2" />
            {showCustomInputs ? "Hide Custom Code" : "Add Custom Code"}
          </Button>

          {showCustomInputs && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-3">Custom Code Integration</h4>

              <Tabs defaultValue="jsx" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="jsx">JSX</TabsTrigger>
                  <TabsTrigger value="css">CSS</TabsTrigger>
                  <TabsTrigger value="advanced">CSS++</TabsTrigger>
                  <TabsTrigger value="hooks">Hooks</TabsTrigger>
                  <TabsTrigger value="utils">Utils</TabsTrigger>
                </TabsList>

                <TabsContent value="jsx" className="space-y-2">
                  <Label htmlFor="custom-jsx" className="flex items-center space-x-2">
                    <FileCode className="w-4 h-4" />
                    <span>Custom JSX Code</span>
                  </Label>
                  <Textarea
                    id="custom-jsx"
                    placeholder="// Custom JSX code that will be integrated into the generated component
const customElement = <div className='custom-element'>Custom content</div>;"
                    value={customCode.jsx}
                    onChange={(e) => setCustomCode({ ...customCode, jsx: e.target.value })}
                    className="min-h-[120px] font-mono text-sm"
                  />
                </TabsContent>

                <TabsContent value="css" className="space-y-2">
                  <Label htmlFor="custom-css" className="flex items-center space-x-2">
                    <Palette className="w-4 h-4" />
                    <span>Custom CSS Styles</span>
                  </Label>
                  <Textarea
                    id="custom-css"
                    placeholder="/* Custom CSS styles */
.custom-class {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}"
                    value={customCode.css}
                    onChange={(e) => setCustomCode({ ...customCode, css: e.target.value })}
                    className="min-h-[120px] font-mono text-sm"
                  />
                </TabsContent>

                <TabsContent value="advanced" className="space-y-2">
                  <Label htmlFor="custom-css-advanced" className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Advanced CSS++ Features</span>
                  </Label>
                  <Textarea
                    id="custom-css-advanced"
                    placeholder="/* Advanced CSS features: animations, custom properties, modern layouts */
@keyframes slideInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.advanced-component {
  --primary-color: #3b82f6;
  --secondary-color: #10b981;

  animation: slideInUp 0.6s ease-out;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: clamp(1rem, 2.5vw, 2rem);
}

@media (prefers-reduced-motion: reduce) {
  .advanced-component {
    animation: none;
  }
}"
                    value={customCode.cssAdvanced}
                    onChange={(e) => setCustomCode({ ...customCode, cssAdvanced: e.target.value })}
                    className="min-h-[140px] font-mono text-sm"
                  />
                </TabsContent>

                <TabsContent value="hooks" className="space-y-2">
                  <Label htmlFor="custom-hooks" className="flex items-center space-x-2">
                    <Code2 className="w-4 h-4" />
                    <span>Custom React Hooks</span>
                  </Label>
                  <Textarea
                    id="custom-hooks"
                    placeholder="// Custom React hooks
const [isVisible, setIsVisible] = useState(false);
const [data, setData] = useState(null);

useEffect(() => {
  // Custom effect logic
}, []);

const customHook = useCallback(() => {
  // Custom hook logic
}, []);"
                    value={customCode.hooks || ""}
                    onChange={(e) => setCustomCode({ ...customCode, hooks: e.target.value })}
                    className="min-h-[120px] font-mono text-sm"
                  />
                </TabsContent>

                <TabsContent value="utils" className="space-y-2">
                  <Label htmlFor="custom-utils" className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Utility Functions</span>
                  </Label>
                  <Textarea
                    id="custom-utils"
                    placeholder="// Utility functions
const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US').format(date);
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};"
                    value={customCode.utils || ""}
                    onChange={(e) => setCustomCode({ ...customCode, utils: e.target.value })}
                    className="min-h-[120px] font-mono text-sm"
                  />
                </TabsContent>
              </Tabs>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Custom Code Integration:</p>
                    <ul className="space-y-1 text-xs">
                      <li>
                        • <strong>JSX:</strong> Integrated into the component render method
                      </li>
                      <li>
                        • <strong>CSS:</strong> Added to the component stylesheet
                      </li>
                      <li>
                        • <strong>CSS++:</strong> Advanced features with modern CSS
                      </li>
                      <li>
                        • <strong>Hooks:</strong> Custom React hooks and state management
                      </li>
                      <li>
                        • <strong>Utils:</strong> Utility functions and helpers
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generation Progress */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Generation Progress</Label>
              <span className="text-sm text-muted-foreground">{generationProgress}%</span>
            </div>
            <Progress value={generationProgress} className="h-2" />
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          size="lg"
        >
          {isGenerating ? (
            <div className="flex items-center space-x-2">
              <RefreshCw className="animate-spin h-4 w-4" />
              <span>Generating Enhanced Code...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Generate Enhanced Components</span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  )

  const renderGeneratedComponents = () => (
    <div className="space-y-6">
      {/* Component Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Layers className="w-5 h-5" />
              <span>Generated Components ({generatedComponents.length})</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {selectedComponent && (
                <>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode("desktop")}
                      className={previewMode === "desktop" ? "bg-muted" : ""}
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode("tablet")}
                      className={previewMode === "tablet" ? "bg-muted" : ""}
                    >
                      <Tablet className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode("mobile")}
                      className={previewMode === "mobile" ? "bg-muted" : ""}
                    >
                      <Smartphone className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button onClick={handleDownloadAll} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedComponents.map((component) => {
              const aiOptimization = aiOptimizations.get(component.id)
              return (
                <div
                  key={component.id}
                  onClick={() => setSelectedComponent(component)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedComponent?.id === component.id
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{component.name}</h4>
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline">{component.metadata.componentType}</Badge>
                      {aiOptimization && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Accuracy:</span>
                      <span className="font-medium">{component.metadata.estimatedAccuracy}%</span>
                    </div>
                    {aiOptimization && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Performance:</span>
                        <span className="font-medium text-green-600">{aiOptimization.performanceScore}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          component.accessibility.score >= 80
                            ? "bg-green-500"
                            : component.accessibility.score >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      />
                      <span className="text-xs text-muted-foreground">
                        WCAG {component.accessibility.wcagCompliance}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {(customCode.jsx || customCode.css || customCode.cssAdvanced) && (
                        <Badge variant="secondary" className="text-xs">
                          <Plus className="w-3 h-3 mr-1" />
                          Custom
                        </Badge>
                      )}
                      {component.tests && (
                        <Badge variant="outline" className="text-xs">
                          <TestTube className="w-3 h-3" />
                        </Badge>
                      )}
                      {component.storybook && (
                        <Badge variant="outline" className="text-xs">
                          <BookOpen className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Component Details */}
      {selectedComponent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>{selectedComponent.name}</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{selectedComponent.metadata.complexity}</Badge>
                <Badge variant="outline">{selectedComponent.metadata.estimatedAccuracy}% accuracy</Badge>
                {aiOptimizations.has(selectedComponent.id) && (
                  <Badge variant="default" className="bg-green-600">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Optimized
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Enhanced Metrics Dashboard */}
            {showMetrics && (
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Component Metrics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedComponent.accessibility.score}</div>
                    <div className="text-sm text-muted-foreground">Accessibility</div>
                    <Progress value={selectedComponent.accessibility.score} className="h-1 mt-1" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedComponent.metadata.estimatedAccuracy}
                    </div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                    <Progress value={selectedComponent.metadata.estimatedAccuracy} className="h-1 mt-1" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {aiOptimizations.get(selectedComponent.id)?.performanceScore || 75}
                    </div>
                    <div className="text-sm text-muted-foreground">Performance</div>
                    <Progress
                      value={aiOptimizations.get(selectedComponent.id)?.performanceScore || 75}
                      className="h-1 mt-1"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedComponent.responsive.hasResponsiveDesign ? 100 : 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Responsive</div>
                    <Progress value={selectedComponent.responsive.hasResponsiveDesign ? 100 : 0} className="h-1 mt-1" />
                  </div>
                </div>
              </div>
            )}

            {/* Code Display with Enhanced Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="jsx">{options.typescript ? "TSX" : "JSX"}</TabsTrigger>
                  <TabsTrigger value="css">CSS</TabsTrigger>
                  {options.typescript && <TabsTrigger value="typescript">Types</TabsTrigger>}
                  {selectedComponent.tests && <TabsTrigger value="tests">Tests</TabsTrigger>}
                  {selectedComponent.storybook && <TabsTrigger value="storybook">Stories</TabsTrigger>}
                </TabsList>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopy(
                        activeTab === "jsx"
                          ? selectedComponent.jsx
                          : activeTab === "css"
                            ? selectedComponent.css
                            : activeTab === "typescript"
                              ? selectedComponent.typescript || ""
                              : activeTab === "tests"
                                ? selectedComponent.tests || ""
                                : selectedComponent.storybook || "",
                        activeTab,
                      )
                    }
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {copied === activeTab ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload(
                        activeTab === "jsx"
                          ? selectedComponent.jsx
                          : activeTab === "css"
                            ? selectedComponent.css
                            : activeTab === "typescript"
                              ? selectedComponent.typescript || ""
                              : activeTab === "tests"
                                ? selectedComponent.tests || ""
                                : selectedComponent.storybook || "",
                        `${selectedComponent.name}${getFileExtension(activeTab)}`,
                      )
                    }
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>

              <TabsContent value="jsx">
                <div className="max-h-96 overflow-auto rounded-lg border">
                  <pre className="p-4 text-sm bg-muted/50">
                    <code>{selectedComponent.jsx}</code>
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="css">
                <div className="max-h-96 overflow-auto rounded-lg border">
                  <pre className="p-4 text-sm bg-muted/50">
                    <code>{selectedComponent.css}</code>
                  </pre>
                </div>
              </TabsContent>

              {options.typescript && selectedComponent.typescript && (
                <TabsContent value="typescript">
                  <div className="max-h-96 overflow-auto rounded-lg border">
                    <pre className="p-4 text-sm bg-muted/50">
                      <code>{selectedComponent.typescript}</code>
                    </pre>
                  </div>
                </TabsContent>
              )}

              {selectedComponent.tests && (
                <TabsContent value="tests">
                  <div className="max-h-96 overflow-auto rounded-lg border">
                    <pre className="p-4 text-sm bg-muted/50">
                      <code>{selectedComponent.tests}</code>
                    </pre>
                  </div>
                </TabsContent>
              )}

              {selectedComponent.storybook && (
                <TabsContent value="storybook">
                  <div className="max-h-96 overflow-auto rounded-lg border">
                    <pre className="p-4 text-sm bg-muted/50">
                      <code>{selectedComponent.storybook}</code>
                    </pre>
                  </div>
                </TabsContent>
              )}
            </Tabs>

            {/* AI Optimization Section */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Optimization
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIOptimization(selectedComponent)}
                  disabled={aiOptimizations.has(selectedComponent.id)}
                >
                  {aiOptimizations.has(selectedComponent.id) ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Optimized
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-1" />
                      Optimize
                    </>
                  )}
                </Button>
              </div>

              {aiOptimizations.has(selectedComponent.id) && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="space-y-3">
                    {aiOptimizations.get(selectedComponent.id)?.improvements.map((improvement, index) => (
                      <div key={index} className="flex items-start gap-3">
                        {improvement.type === "performance" && <Zap className="h-4 w-4 text-yellow-500 mt-0.5" />}
                        {improvement.type === "accessibility" && (
                          <Accessibility className="h-4 w-4 text-green-500 mt-0.5" />
                        )}
                        {improvement.type === "security" && <Shield className="h-4 w-4 text-red-500 mt-0.5" />}
                        {improvement.type === "best-practice" && <Target className="h-4 w-4 text-blue-500 mt-0.5" />}

                        <div className="flex-1">
                          <p className="text-sm font-medium">{improvement.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                improvement.impact === "high"
                                  ? "destructive"
                                  : improvement.impact === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {improvement.impact} impact
                            </Badge>
                            {improvement.autoFixed && (
                              <Badge variant="outline" className="text-xs">
                                Auto-fixed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Version History Section */}
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold flex items-center">
                <GitBranch className="w-4 h-4 mr-2" />
                Version History
              </h4>

              {versionHistory.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {versionHistory.slice(0, 5).map((version, index) => (
                    <div key={version.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {version.id}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {version.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{version.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleVersionRollback(selectedComponent.id, version.id)}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No version history available</p>
                </div>
              )}
            </div>

            {/* Accessibility Issues and Suggestions */}
            {selectedComponent.accessibility.issues.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Accessibility Issues
                </h4>
                <div className="space-y-2">
                  {selectedComponent.accessibility.issues.map((issue, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium text-yellow-800">{issue.message}</div>
                      <div className="text-yellow-700">Fix: {issue.fix}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedComponent.accessibility.suggestions.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Suggestions
                </h4>
                <ul className="space-y-1">
                  {selectedComponent.accessibility.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-blue-700 flex items-start">
                      <CheckCircle className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Error:</span>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
        </div>
      )}

      {/* Configuration Panel */}
      {renderConfigurationPanel()}

      {/* Generated Components */}
      {generatedComponents.length > 0 && renderGeneratedComponents()}
    </div>
  )
}

export default EnhancedCodeGenerationPanel

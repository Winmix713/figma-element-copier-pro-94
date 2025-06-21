
interface FigmaPluginMessage {
  type: string;
  data?: any;
}

interface SendResult {
  success: boolean;
  fallbackData?: string;
  error?: string;
}

export class FigmaMessenger {
  private static instance: FigmaMessenger;
  private isReady: boolean = false;

  private constructor() {
    this.setupMessageListener();
  }

  static getInstance(): FigmaMessenger {
    if (!FigmaMessenger.instance) {
      FigmaMessenger.instance = new FigmaMessenger();
    }
    return FigmaMessenger.instance;
  }

  private setupMessageListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (event) => {
        if (event.data.pluginMessage && event.data.pluginMessage.type === 'figma-ready') {
          this.isReady = true;
        }
      });
    }
  }

  async sendNodes(figmaNodes: any[]): Promise<SendResult> {
    try {
      if (this.isPluginReady()) {
        const message: FigmaPluginMessage = {
          type: 'export-nodes',
          data: { nodes: figmaNodes }
        };

        if (typeof window !== 'undefined' && window.parent) {
          window.parent.postMessage({ pluginMessage: message }, '*');
          return { success: true };
        }
      }

      // Fallback: return structured data
      const fallbackData = JSON.stringify(figmaNodes, null, 2);
      return { 
        success: false, 
        fallbackData,
        error: 'Figma plugin not available' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  isPluginReady(): boolean {
    return this.isReady;
  }

  async waitForPlugin(timeout: number = 5000): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isReady) {
        resolve(true);
        return;
      }

      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        if (this.isReady || Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          resolve(this.isReady);
        }
      }, 100);
    });
  }
}

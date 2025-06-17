
import { FigmaNode, FigmaPluginMessage } from '@/types/figma';

export interface FigmaMessengerResult {
  success: boolean;
  fallbackData?: string;
}

export class FigmaMessenger {
  private static instance: FigmaMessenger;
  private pluginReady = false;
  private messageQueue: FigmaPluginMessage[] = [];

  private constructor() {
    this.setupMessageListener();
    this.detectPlugin();
  }

  static getInstance(): FigmaMessenger {
    if (!FigmaMessenger.instance) {
      FigmaMessenger.instance = new FigmaMessenger();
    }
    return FigmaMessenger.instance;
  }

  private setupMessageListener(): void {
    window.addEventListener('message', (event) => {
      // Listen for responses from Figma plugin
      if (event.data.pluginMessage) {
        this.handlePluginResponse(event.data.pluginMessage);
      }
    });
  }

  private detectPlugin(): void {
    // Try to detect if Figma plugin is available
    // This is a simple check - in real implementation you might want more sophisticated detection
    try {
      // Send a test message to see if plugin responds
      this.postMessageToPlugin({ type: 'GET_SELECTION' });
      
      // Set a timeout to assume plugin is not available
      setTimeout(() => {
        if (!this.pluginReady) {
          console.warn('Figma plugin not detected - will use fallback methods');
        }
      }, 2000);
    } catch (error) {
      console.warn('Failed to detect Figma plugin:', error);
    }
  }

  private handlePluginResponse(message: any): void {
    console.log('Received response from Figma plugin:', message);
    
    if (message.type === 'NODES_CREATED') {
      this.pluginReady = true;
    }
    
    if (message.type === 'SELECTION_DATA') {
      this.pluginReady = true;
    }
  }

  private postMessageToPlugin(message: FigmaPluginMessage): void {
    // Post message to Figma plugin
    // In a real implementation, this would be more sophisticated
    if (typeof window !== 'undefined') {
      window.postMessage(message, '*');
    }
  }

  async sendNodes(nodes: FigmaNode[]): Promise<FigmaMessengerResult> {
    console.log('Sending nodes to Figma:', nodes);

    try {
      // Prepare the message
      const message: FigmaPluginMessage = {
        type: 'CREATE_NODES',
        nodes: nodes
      };

      // Try to send to plugin
      this.postMessageToPlugin(message);

      // Wait a bit to see if plugin responds
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (this.pluginReady) {
        return { success: true };
      } else {
        // Fallback: create structured data for clipboard
        const fallbackData = this.createFallbackData(nodes);
        return { 
          success: false, 
          fallbackData 
        };
      }

    } catch (error) {
      console.error('Failed to send nodes to Figma:', error);
      
      // Create fallback data
      const fallbackData = this.createFallbackData(nodes);
      return { 
        success: false, 
        fallbackData 
      };
    }
  }

  private createFallbackData(nodes: FigmaNode[]): string {
    // Create a structured representation that can be copied to clipboard
    const fallbackStructure = {
      type: 'FIGMA_IMPORT_DATA',
      timestamp: new Date().toISOString(),
      nodes: nodes,
      instructions: 'This data can be imported into Figma using the Web to Figma Converter plugin',
      metadata: {
        totalNodes: nodes.length,
        nodeTypes: [...new Set(nodes.map(n => n.type))],
        hasText: nodes.some(n => n.type === 'TEXT'),
        hasFrames: nodes.some(n => n.type === 'FRAME'),
        hasShapes: nodes.some(n => n.type === 'RECTANGLE' || n.type === 'ELLIPSE')
      }
    };

    return JSON.stringify(fallbackStructure, null, 2);
  }

  isPluginReady(): boolean {
    return this.pluginReady;
  }

  // Method to manually trigger plugin detection
  async refreshPluginStatus(): Promise<boolean> {
    this.pluginReady = false;
    this.detectPlugin();
    
    // Wait for detection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return this.pluginReady;
  }

  // Method to get current Figma selection (if plugin is available)
  async getCurrentSelection(): Promise<any[]> {
    if (!this.pluginReady) {
      return [];
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve([]);
      }, 5000);

      const handler = (event: MessageEvent) => {
        if (event.data.pluginMessage?.type === 'SELECTION_DATA') {
          clearTimeout(timeout);
          window.removeEventListener('message', handler);
          resolve(event.data.pluginMessage.selection || []);
        }
      };

      window.addEventListener('message', handler);
      this.postMessageToPlugin({ type: 'GET_SELECTION' });
    });
  }
}

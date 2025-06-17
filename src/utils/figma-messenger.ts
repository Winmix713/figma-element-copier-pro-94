
import { FigmaPluginMessage, FigmaNode } from '@/types/figma';

export class FigmaMessenger {
  private static instance: FigmaMessenger;
  private messageQueue: FigmaPluginMessage[] = [];
  private isPluginAvailable: boolean | null = null;

  static getInstance(): FigmaMessenger {
    if (!FigmaMessenger.instance) {
      FigmaMessenger.instance = new FigmaMessenger();
    }
    return FigmaMessenger.instance;
  }

  private constructor() {
    this.setupMessageListener();
    this.checkPluginAvailability();
  }

  private setupMessageListener(): void {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'figma-plugin-response') {
        this.isPluginAvailable = true;
        this.processMessageQueue();
      }
    });
  }

  private async checkPluginAvailability(): Promise<void> {
    // Send a ping message to check if plugin is available
    const pingMessage: FigmaPluginMessage = {
      type: 'CREATE_NODES',
      data: { ping: true }
    };

    this.sendToPlugin(pingMessage);

    // Wait a bit and assume plugin is not available if no response
    setTimeout(() => {
      if (this.isPluginAvailable === null) {
        this.isPluginAvailable = false;
      }
    }, 1000);
  }

  private sendToPlugin(message: FigmaPluginMessage): void {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        pluginMessage: message,
      }, '*');
    } else if (window.opener) {
      window.opener.postMessage({
        pluginMessage: message,
      }, '*');
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendToPlugin(message);
      }
    }
  }

  async sendNodes(nodes: FigmaNode[]): Promise<{ success: boolean; fallbackData?: string }> {
    const message: FigmaPluginMessage = {
      type: 'CREATE_NODES',
      nodes,
    };

    if (this.isPluginAvailable === false) {
      // Plugin not available, return structured data for clipboard
      const fallbackData = JSON.stringify(nodes, null, 2);
      return { success: false, fallbackData };
    }

    if (this.isPluginAvailable === true) {
      this.sendToPlugin(message);
      return { success: true };
    }

    // Plugin availability unknown, queue the message
    this.messageQueue.push(message);
    
    // Return a promise that resolves when we know the plugin status
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.isPluginAvailable !== null) {
          clearInterval(checkInterval);
          if (this.isPluginAvailable) {
            resolve({ success: true });
          } else {
            const fallbackData = JSON.stringify(nodes, null, 2);
            resolve({ success: false, fallbackData });
          }
        }
      }, 100);

      // Timeout after 3 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        const fallbackData = JSON.stringify(nodes, null, 2);
        resolve({ success: false, fallbackData });
      }, 3000);
    });
  }

  isPluginReady(): boolean {
    return this.isPluginAvailable === true;
  }
}

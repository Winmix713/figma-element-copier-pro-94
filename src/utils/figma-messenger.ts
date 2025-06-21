
import { FigmaPluginMessage } from '@/types/figma';

export class FigmaMessenger {
  static sendMessage(message: FigmaPluginMessage): void {
    if (typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage(message, '*');
    }
  }

  static onMessage(callback: (message: FigmaPluginMessage) => void): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (event) => {
        callback(event.data as FigmaPluginMessage);
      });
    }
  }
}

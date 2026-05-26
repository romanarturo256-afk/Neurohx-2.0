/// <reference types="vite/client" />
import { useEffect } from 'react';
import { useUser } from '../contexts/UserContext';

interface ChatbaseFunction {
  (...args: any[]): void;
  q?: any[];
}

declare global {
  interface Window {
    chatbase?: ChatbaseFunction;
    chatbaseConfig?: {
      chatbotId: string;
      [key: string]: any;
    };
  }
}

export function ChatbaseIntegrator() {
  const { profile } = useUser();

  useEffect(() => {
    // Chatbot is stopped and disabled by user request.
    console.log("🛑 [Chatbase] Chatbot has been stopped and disabled.");

    // Proactively clean up any chatbot elements, if they were previously injected or cached
    const chatbotId = '5JOOwWNnVKPkqPAptOs5t';
    
    // Remove Chatbase script
    const script = document.getElementById(chatbotId);
    if (script) {
      script.remove();
    }

    // Remove Chatbase bubble button and message container if injected by their library
    const bubbleButton = document.getElementById('chatbase-bubble-button');
    if (bubbleButton) {
      bubbleButton.remove();
    }

    const messageContainer = document.getElementById('chatbase-message-container');
    if (messageContainer) {
      messageContainer.remove();
    }

    // Remove any iframe or div that contains 'chatbase' in its id or src as a fallback
    document.querySelectorAll('iframe, div, script').forEach((el) => {
      if (
        el.id && el.id.toLowerCase().includes('chatbase') ||
        (el instanceof HTMLIFrameElement && el.src && el.src.toLowerCase().includes('chatbase')) ||
        (el instanceof HTMLScriptElement && el.src && el.src.toLowerCase().includes('chatbase'))
      ) {
        el.remove();
      }
    });

    // Clean up window variables
    if (window.chatbase) {
      delete window.chatbase;
    }
    if (window.chatbaseConfig) {
      delete window.chatbaseConfig;
    }
  }, [profile]);

  return null;
}

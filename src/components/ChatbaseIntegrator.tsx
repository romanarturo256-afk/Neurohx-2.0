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
    // Hardcoded production Chatbase Chatbot ID to ensure it loads reliably everywhere (local & cloud environments)
    const chatbotId = '5JOOwWNnVKPkqPAptOs5t';

    // Initialize window.chatbase if not already present
    if (!window.chatbase) {
      const cb: ChatbaseFunction = function (...args: any[]) {
        cb.q = cb.q || [];
        cb.q.push(args);
      };
      window.chatbase = cb;
    }

    // Configure window.chatbaseConfig before the library loads
    window.chatbaseConfig = {
      chatbotId: chatbotId
    };

    // Dynamically append the embed script if not already present
    let script = document.getElementById(chatbotId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement("script");
      script.src = "https://www.chatbase.co/embed.min.js";
      script.id = chatbotId;
      script.defer = true;
      document.body.appendChild(script);
      console.log("✨ [Chatbase] Embed script injected dynamically with ID:", chatbotId);
    }

    async function getUserTokenAndIdentify() {
      if (!profile || !profile.uid) {
        return;
      }

      try {
        const response = await fetch('/api/chatbase-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: profile.uid,
            email: profile.email,
            stripe_accounts: [],
          }),
        });

        if (!response.ok) {
          throw new Error(`Token generation failed with status: ${response.status}`);
        }

        const data = await response.json();
        if (data?.token) {
          if (typeof window.chatbase === 'function') {
            window.chatbase('identify', { token: data.token });
            console.log('✨ [Chatbase] User identified securely with verified token.');
          }
        }
      } catch (error) {
        console.error('❌ [Chatbase] Error fetching verification token:', error);
      }
    }

    getUserTokenAndIdentify();
  }, [profile]);

  return null;
}

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
            stripe_accounts: [], // Add custom variables or stripe integration keys if any
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
          } else {
            // Chatbase script is loaded asynchronously, so queue it or wait
            if (!window.chatbase) {
              const cb: ChatbaseFunction = function () {
                cb.q = cb.q || [];
                cb.q.push(arguments);
              };
              window.chatbase = cb;
            }
            window.chatbase('identify', { token: data.token });
            console.log('✨ [Chatbase] Queued secure user identification payload.');
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

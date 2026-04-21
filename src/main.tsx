import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

window.addEventListener('error', (event) => {
  console.error('❌ Global Runtime Error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  let message = 'Unknown rejection';
  let stack = '';
  
  try {
    if (reason instanceof Error) {
      message = reason.message;
      stack = reason.stack || '';
    } else if (typeof reason === 'object' && reason !== null) {
      message = reason.message || JSON.stringify(reason);
      stack = reason.stack || '';
    } else {
      message = String(reason);
    }
  } catch (e) {
    message = String(reason);
  }
  
  console.error('❌ Unhandled Promise Rejection:', message);
  if (stack) console.error('Stack Trace:', stack);
  console.error('Full Reason Object:', reason);
});

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f3] p-10 font-sans">
          <div className="max-w-md w-full bg-white p-12 rounded-[48px] border border-[#1a2b27]/10 shadow-2xl text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h1 className="font-['Syne'] text-3xl font-bold text-[#1a2b27]">App Interruption</h1>
            <p className="text-[#4a5a57] text-sm leading-relaxed italic">
              Neurohx has encountered a clinical anomaly in the frontend layer. We are attempting to restore stability.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-[#1a2b27] text-white py-4 rounded-2xl font-bold hover:bg-[#2d7a36] transition-all shadow-xl shadow-[#1a2b27]/20"
            >
              Restart Session
            </button>
            <div className="pt-6 border-t border-[#1a2b27]/5">
               <pre className="text-[10px] text-red-400 bg-red-50/30 p-4 rounded-xl overflow-x-auto text-left">
                 {String(this.state.error)}
               </pre>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);


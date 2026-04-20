import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#fcfaf7] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-[48px] border border-[#e0dbd0] p-10 text-center shadow-xl">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <AlertCircle size={40} />
            </div>
            <h2 className="font-['Syne'] text-3xl font-bold text-[#111110] mb-4">Something went wrong</h2>
            <p className="text-[#888880] mb-8 leading-relaxed">
              We encountered an unexpected error. Don't worry, your progress is safe. Please try refreshing or returning home.
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full py-4 bg-[#8b7cf6] text-white rounded-2xl font-bold shadow-lg shadow-[#8b7cf6]/20 hover:bg-[#7a6be5] transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Try Refreshing
              </button>
              <a
                href="/"
                className="w-full py-4 bg-white border border-[#e0dbd0] text-[#888880] rounded-2xl font-bold hover:bg-[#fcfaf7] transition-all flex items-center justify-center gap-2"
              >
                <Home size={18} />
                Return Home
              </a>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-red-50 rounded-2xl text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-red-600">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

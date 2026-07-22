import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('GridPulse ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full min-h-[400px] gap-6 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Module Crashed</h2>
            <p className="text-slate-400 text-sm max-w-md">
              An unexpected error occurred in this module. The rest of the dashboard is unaffected.
            </p>
            {this.state.error && (
              <code className="block mt-3 text-xs text-rose-400 bg-rose-900/20 border border-rose-800/30 rounded-lg px-4 py-2 max-w-md mx-auto break-all">
                {this.state.error.message}
              </code>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Module
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

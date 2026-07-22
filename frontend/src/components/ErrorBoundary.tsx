import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 bg-surface-container-low/40 backdrop-blur-2xl border border-outline-variant/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[500px] w-full relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-error/20 border border-error/50 flex items-center justify-center mb-4 text-error shadow-[0_0_20px_rgba(255,113,108,0.3)]">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">
            Widget Render Error
          </h2>
          <p className="text-sm text-on-surface-variant max-w-md mb-6">
            An unexpected error occurred while rendering this module. Grid metrics streaming is protected.
          </p>
          {this.state.error && (
            <div className="bg-black/50 p-3 rounded-lg text-left text-xs font-mono text-error max-w-lg overflow-x-auto mb-6 border border-error/30">
              {this.state.error.message}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 bg-primary text-on-primary font-headline font-bold rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 shadow-md"
          >
            <RefreshCw className="w-4 h-4" /> Reload Component
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

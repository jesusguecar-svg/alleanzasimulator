import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white rounded-lg shadow p-6 max-w-md text-center space-y-4">
            <h1 className="text-2xl font-bold text-red-600">Algo salió mal</h1>
            <p className="text-slate-600">
              Parece que hubo un error al cargar la aplicación. Por favor, recarga la página.
            </p>
            {this.state.error && (
              <details className="text-left text-sm text-slate-500 bg-slate-50 p-3 rounded">
                <summary className="cursor-pointer font-medium">Detalles del error</summary>
                <pre className="mt-2 text-xs overflow-auto">{this.state.error.message}</pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

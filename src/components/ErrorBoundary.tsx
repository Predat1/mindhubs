import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center space-y-6">
          <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive animate-pulse">
            <AlertTriangle size={40} />
          </div>
          <div className="space-y-2 max-w-md">
            <h1 className="text-3xl font-black tracking-tight">Oups ! Une erreur est survenue</h1>
            <p className="text-muted-foreground font-medium">
              L'application a rencontré un problème inattendu. Ne vous inquiétez pas, vos données sont en sécurité.
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={() => window.location.reload()} 
              className="rounded-2xl h-12 px-6 font-bold gap-2 btn-glow"
            >
              <RefreshCw size={18} /> Recharger la page
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/"}
              className="rounded-2xl h-12 px-6 font-bold"
            >
              Retour à l'accueil
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-8 p-4 bg-muted rounded-xl text-left text-[10px] overflow-auto max-w-full border border-border">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

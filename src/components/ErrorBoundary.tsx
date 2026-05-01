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
    console.error("Critical Application Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // In production, we use import.meta.env.DEV which is provided by Vite
      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center space-y-6 overflow-hidden">
          <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive animate-bounce">
            <AlertTriangle size={40} />
          </div>
          <div className="space-y-3 max-w-md">
            <h1 className="text-3xl font-black tracking-tighter">Oups ! Système Interrompu</h1>
            <p className="text-muted-foreground font-medium text-sm leading-relaxed">
              L'application MindHubs a rencontré une instabilité passagère. Pas d'inquiétude, vos données de vente et produits sont en parfaite sécurité dans notre base de données.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button 
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }} 
              className="rounded-2xl h-12 px-8 font-black gap-2 btn-glow"
            >
              <RefreshCw size={18} /> Recharger la page
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                this.setState({ hasError: false });
                window.location.assign("/");
              }}
              className="rounded-2xl h-12 px-8 font-black border-white/10"
            >
              Retour à l'accueil
            </Button>
          </div>
          
          {isDev && (
            <div className="mt-8 p-6 bg-card border border-white/5 rounded-[2rem] text-left text-[11px] overflow-auto max-w-2xl shadow-2xl">
              <p className="text-primary font-black mb-2 uppercase tracking-widest">Détails techniques (Dev Only)</p>
              <pre className="text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap">
                {this.state.error?.stack || this.state.error?.toString()}
              </pre>
            </div>
          )}
          
          <div className="fixed bottom-8 text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-50">
             MindHubs Technical Recovery Unit
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import CyberLayout from "./components/CyberLayout";
import Library from "./pages/Library";
import Control from "./pages/Control";
import SetlistPage from "./pages/Setlist";
import About from "./pages/About";
import Projection from "./pages/Projection";

function MainApp() {
  return (
    <CyberLayout>
      <Switch>
        <Route path="/" component={Library} />
        <Route path="/control" component={Control} />
        <Route path="/setlist" component={SetlistPage} />
        <Route path="/about" component={About} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </CyberLayout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Projection window - no layout */}
      <Route path="/projection" component={Projection} />
      {/* Main app with layout */}
      <Route component={MainApp} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "var(--bg-panel)",
                border: "1px solid oklch(0.65 0.35 340 / 0.4)",
                color: "var(--text-primary)",
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 600,
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "./components/shared/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { Approvals }  from "./pages/Approvals";
import { Analytics }  from "./pages/Analytics";
import { Campaigns }  from "./pages/Campaigns";
import { Activity }   from "./pages/Activity";
import { Settings }   from "./pages/Settings";
import { Onboarding } from "./pages/Onboarding";
import { useAppStore } from "./lib/store";
import { Background3D } from "./components/shared/Background3D";
import { AppStartup } from "./components/shared/AppStartup";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const qc = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function AppLayout() {
  const { onboarded } = useAppStore();
  const location = useLocation();

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  if (!onboarded) return <Navigate to="/onboarding" replace />;

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      <div 
        className="glow-cursor" 
        style={{ transform: `translate(var(--mouse-x), var(--mouse-y)) translate(-50%, -50%)` }}
      />
      <div 
        className="glow-cursor-trail" 
        style={{ transform: `translate(var(--mouse-x), var(--mouse-y)) translate(-50%, -50%)` }}
      />
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen bg-transparent">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Routes location={location}>
              <Route path="/"          element={<Dashboard />} />
              <Route path="/approvals" element={<Approvals />} />
              <Route path="/activity"  element={<Activity />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/settings"  element={<Settings />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  const [booted, setBooted] = useState(false);

  return (
    <QueryClientProvider client={qc}>
      <Background3D />
      <AnimatePresence>
        {!booted && <AppStartup key="startup" onComplete={() => setBooted(true)} />}
      </AnimatePresence>
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/*"          element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

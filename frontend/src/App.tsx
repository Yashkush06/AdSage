import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "./components/shared/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { Approvals }  from "./pages/Approvals";
import { Analytics }  from "./pages/Analytics";
import { Campaigns }  from "./pages/Campaigns";
import { Settings }   from "./pages/Settings";
import { Onboarding } from "./pages/Onboarding";
import { CsvImport } from "./pages/CsvImport";
import { Activity } from "./pages/Activity";
import { CreativeStudio } from "./pages/CreativeStudio";
import { useAppStore } from "./lib/store";
import { AppStartup } from "./components/shared/AppStartup";
import { CursorTrail } from "./components/shared/CursorTrail";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const qc = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function AnimatedRoutes() {
  const location = useLocation();
  const { onboarded } = useAppStore();
  
  if (!onboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.3 }}>
              <Dashboard />
            </motion.div>
          } 
        />
        <Route 
          path="/approvals" 
          element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <Approvals />
            </motion.div>
          } 
        />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/csv-import" element={<CsvImport />} />
        <Route path="/creative-studio" element={<CreativeStudio />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/settings"  element={<Settings />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen bg-[#050505]">
        <AnimatedRoutes />
      </main>
    </div>
  );
}

export default function App() {
  // Start as true — show startup immediately on first load
  const [showStartup, setShowStartup] = useState(() => {
    return !sessionStorage.getItem("adsage_booted");
  });

  const handleStartupComplete = () => {
    sessionStorage.setItem("adsage_booted", "true");
    setShowStartup(false);
  };

  return (
    <QueryClientProvider client={qc}>
      <CursorTrail />
      <style>{`* { cursor: none !important; }`}</style>
      <AnimatePresence>
        {showStartup && (
          <AppStartup key="startup" onComplete={handleStartupComplete} />
        )}
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

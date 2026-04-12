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
import Beams from "./components/shared/Beams";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const qc = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

const pageVariants = {
  initial: { opacity: 0, filter: "blur(8px)", y: 10 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, filter: "blur(4px)", y: -10, transition: { duration: 0.3 } }
};

function AnimatedRoutes() {
  const location = useLocation();
  const { onboarded } = useAppStore();
  
  if (!onboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full"><Dashboard /></motion.div>} />
        <Route path="/approvals" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full"><Approvals /></motion.div>} />
        <Route path="/analytics" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full"><Analytics /></motion.div>} />
        <Route path="/csv-import" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full"><CsvImport /></motion.div>} />
        <Route path="/creative-studio" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full"><CreativeStudio /></motion.div>} />
        <Route path="/campaigns" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full"><Campaigns /></motion.div>} />
        <Route path="/activity" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full"><Activity /></motion.div>} />
        <Route path="/settings" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full"><Settings /></motion.div>} />
      </Routes>
    </AnimatePresence>
  );
}

function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen bg-transparent">
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
      <div className="fixed inset-0 z-[-1]">
        <Beams 
          lightColor="#FF0032" 
          noiseIntensity={0.5} 
          speed={1.5}
        />
      </div>
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

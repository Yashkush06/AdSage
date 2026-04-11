import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "./components/shared/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { Approvals }  from "./pages/Approvals";
import { Analytics }  from "./pages/Analytics";
import { Campaigns }  from "./pages/Campaigns";
import { Settings }   from "./pages/Settings";
import { Onboarding } from "./pages/Onboarding";
import { CsvImport } from "./pages/CsvImport";
import { CreativeStudio } from "./pages/CreativeStudio";
import { useAppStore } from "./lib/store";

const qc = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function AppLayout() {
  const { onboarded } = useAppStore();
  if (!onboarded) return <Navigate to="/onboarding" replace />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen bg-surface">
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/csv-import" element={<CsvImport />} />
          <Route path="/creative-studio" element={<CreativeStudio />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/settings"  element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/*"          element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

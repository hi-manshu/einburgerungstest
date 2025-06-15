
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import { StateTest } from "./pages/StateTest";
import GeneralTest from "./pages/GeneralTest";
import { MockExam } from "./pages/MockExam";
import { Flashcards } from "./pages/Flashcards";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logFirebaseEvent } from "@/lib/firebase";
import { useAnalytics } from "@/hooks/useAnalytics"; // <-- new import
import TopicPractice from "./pages/TopicPractice";

// Custom component to track page views and analytics events
const AnalyticsListener = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page_view on every route change
    logFirebaseEvent("page_view", {
      page_path: location.pathname,
      page_title: document.title,
    });
    // Optionally: Add more data here if you wish (user info, metadata, etc)
  }, [location]);

  useEffect(() => {
    // Attach delegated event handler for all button clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Find closest button or a[href]
      const btn = target.closest("button, [role=button], a") as HTMLElement | null;
      if (btn) {
        const label = btn.getAttribute("aria-label") || btn.textContent?.trim() || btn.getAttribute("href") || "unknown";
        const eventType = btn.tagName === "A" ? "link_click" : "button_click";
        logFirebaseEvent(eventType, {
          label,
          pathname: window.location.pathname,
        });
      }
    };
    window.addEventListener("click", handleClick, true);
    return () => window.removeEventListener("click", handleClick, true);
  }, []);

  return null;
};

// Remove old AnalyticsListener and instead use the hook
const AnalyticsManager = () => {
  useAnalytics(); // handles page views and click events globally
  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnalyticsManager />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/state-test" element={<StateTest />} />
              <Route path="/general-test" element={<GeneralTest />} />
              <Route path="/mock-exam" element={<MockExam />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/topic-practice" element={<TopicPractice />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

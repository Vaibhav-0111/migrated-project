import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TrigonometryChapter from "./pages/TrigonometryChapter";
import AlgebraChapter from "./pages/AlgebraChapter";
import VolumeChapter from "./pages/VolumeChapter";
import ProbabilityChapter from "./pages/ProbabilityChapter";
import FractionsChapter from "./pages/FractionsChapter";
import GameAngleShadow from "./pages/GameAngleShadow";
import GameMountainRescue from "./pages/GameMountainRescue";
import GameWaveLab from "./pages/GameWaveLab";
import GameBalanceGarden from "./pages/GameBalanceGarden";
import GameEquationFactory from "./pages/GameEquationFactory";
import GamePatternPortal from "./pages/GamePatternPortal";
import GameShapeFill from "./pages/GameShapeFill";
import GameWrapGift from "./pages/GameWrapGift";
import GameBuildCity from "./pages/GameBuildCity";
import GameChanceGarden from "./pages/GameChanceGarden";
import GameSpinnerDiceLab from "./pages/GameSpinnerDiceLab";
import GamePredictionPark from "./pages/GamePredictionPark";
import GameShareSlice from "./pages/GameShareSlice";
import GameLiquidLab from "./pages/GameLiquidLab";
import GameMoneyGarden from "./pages/GameMoneyGarden";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import Achievements from "./pages/Achievements";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ChatBot } from "./components/ChatBot";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chapters"
              element={
                <ProtectedRoute>
                  <TrigonometryChapter />
                </ProtectedRoute>
              }
            />
            {/* Redirect old game routes to chapters */}
            <Route path="/games/:chapter" element={<Navigate to="/chapters" replace />} />
            <Route path="/games" element={<Navigate to="/chapters" replace />} />
            <Route
              path="/game/angle-shadow-garden"
              element={
                <ProtectedRoute>
                  <GameAngleShadow />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/mountain-rope-rescue"
              element={
                <ProtectedRoute>
                  <GameMountainRescue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/wave-balance-lab"
              element={
                <ProtectedRoute>
                  <GameWaveLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/algebra"
              element={
                <ProtectedRoute>
                  <AlgebraChapter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/balance-garden"
              element={
                <ProtectedRoute>
                  <GameBalanceGarden />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/equation-factory"
              element={
                <ProtectedRoute>
                  <GameEquationFactory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/pattern-portal"
              element={
                <ProtectedRoute>
                  <GamePatternPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volume"
              element={
                <ProtectedRoute>
                  <VolumeChapter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/shape-fill-playground"
              element={
                <ProtectedRoute>
                  <GameShapeFill />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/wrap-gift-studio"
              element={
                <ProtectedRoute>
                  <GameWrapGift />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/build-balance-city"
              element={
                <ProtectedRoute>
                  <GameBuildCity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/probability"
              element={
                <ProtectedRoute>
                  <ProbabilityChapter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/chance-garden"
              element={
                <ProtectedRoute>
                  <GameChanceGarden />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/spinner-dice-lab"
              element={
                <ProtectedRoute>
                  <GameSpinnerDiceLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/prediction-park"
              element={
                <ProtectedRoute>
                  <GamePredictionPark />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fractions"
              element={
                <ProtectedRoute>
                  <FractionsChapter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/share-slice-cafe"
              element={
                <ProtectedRoute>
                  <GameShareSlice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/liquid-measure-lab"
              element={
                <ProtectedRoute>
                  <GameLiquidLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/growing-money-garden"
              element={
                <ProtectedRoute>
                  <GameMoneyGarden />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <ProtectedRoute>
                  <Achievements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatBot />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

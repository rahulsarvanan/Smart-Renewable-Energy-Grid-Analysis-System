import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { AuthProvider } from './contexts/AuthContext';
import { SimulationProvider } from './contexts/SimulationContext';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { AuthGuard } from './components/layout/AuthGuard';
const Login = lazy(() => import('./components/Login').then(module => ({ default: module.Login })));
const EnergyOperationsCenter = lazy(() => import('./components/modules/EnergyOperationsCenter').then(module => ({ default: module.EnergyOperationsCenter })));
const Reports = lazy(() => import('./components/modules/Reports').then(module => ({ default: module.Reports })));
const AssetIntelligence = lazy(() => import('./components/modules/AssetIntelligence').then(module => ({ default: module.AssetIntelligence })));
const NetworkIntelligence = lazy(() => import('./components/modules/NetworkIntelligence').then(module => ({ default: module.NetworkIntelligence })));
const PredictiveHub = lazy(() => import('./components/modules/PredictiveHub').then(module => ({ default: module.PredictiveHub })));
const StorageIntelligence = lazy(() => import('./components/modules/StorageIntelligence').then(module => ({ default: module.StorageIntelligence })));
const ExplainabilityCenter = lazy(() => import('./components/modules/ExplainabilityCenter').then(module => ({ default: module.ExplainabilityCenter })));
const ExecutiveDecision = lazy(() => import('./components/modules/ExecutiveDecision').then(module => ({ default: module.ExecutiveDecision })));
const ScenarioPlanning = lazy(() => import('./components/modules/ScenarioPlanning').then(module => ({ default: module.ScenarioPlanning })));
const CarbonAnalytics = lazy(() => import('./components/modules/CarbonAnalytics').then(module => ({ default: module.CarbonAnalytics })));
const EnterpriseRisk = lazy(() => import('./components/modules/EnterpriseRisk').then(module => ({ default: module.EnterpriseRisk })));
const AlertsCenter = lazy(() => import('./components/modules/AlertsCenter').then(module => ({ default: module.AlertsCenter })));
const SettingsModule = lazy(() => import('./components/modules/Settings').then(module => ({ default: module.SettingsModule })));
const DataIntelligence = lazy(() => import('./components/modules/DataIntelligence').then(module => ({ default: module.DataIntelligence })));
const AICopilot = lazy(() => import('./components/modules/AICopilot').then(module => ({ default: module.AICopilot })));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full w-full min-h-[500px]">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SimulationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Suspense fallback={<LoadingFallback />}><Login /></Suspense>} />
            
            <Route path="/" element={
              <AuthGuard>
                <AppShell />
              </AuthGuard>
            }>
              <Route index element={<Navigate to="/ops" replace />} />
              
              <Route path="ops" element={<Suspense fallback={<LoadingFallback />}><ErrorBoundary><EnergyOperationsCenter /></ErrorBoundary></Suspense>} />
              <Route path="reports" element={<Suspense fallback={<LoadingFallback />}><ErrorBoundary><Reports /></ErrorBoundary></Suspense>} />
              <Route path="asset-intel" element={<Suspense fallback={<LoadingFallback />}><ErrorBoundary><AssetIntelligence /></ErrorBoundary></Suspense>} />
              <Route path="network-intel" element={<Suspense fallback={<LoadingFallback />}><ErrorBoundary><NetworkIntelligence /></ErrorBoundary></Suspense>} />
              <Route path="predictive" element={<Suspense fallback={<LoadingFallback />}><ErrorBoundary><PredictiveHub /></ErrorBoundary></Suspense>} />
              <Route path="storage" element={<Suspense fallback={<LoadingFallback />}><ErrorBoundary><StorageIntelligence /></ErrorBoundary></Suspense>} />
              <Route path="explainability" element={<Suspense fallback={<LoadingFallback />}><ErrorBoundary><ExplainabilityCenter /></ErrorBoundary></Suspense>} />
              <Route path="executive" element={<Suspense fallback={<LoadingFallback />}><ErrorBoundary><ExecutiveDecision /></ErrorBoundary></Suspense>} />
              <Route path="scenario" element={<Suspense fallback={<LoadingFallback />}><ErrorBoundary><ScenarioPlanning /></ErrorBoundary></Suspense>} />
              <Route path="carbon" element={<Suspense fallback={<LoadingFallback />}><ErrorBoundary><CarbonAnalytics /></ErrorBoundary></Suspense>} />
              <Route path="risk" element={<Suspense fallback={<LoadingFallback />}><ErrorBoundary><EnterpriseRisk /></ErrorBoundary></Suspense>} />
              <Route path="data" element={<Suspense fallback={<LoadingFallback />}><ErrorBoundary><DataIntelligence /></ErrorBoundary></Suspense>} />
              <Route path="copilot" element={<Suspense fallback={<LoadingFallback />}><ErrorBoundary><AICopilot /></ErrorBoundary></Suspense>} />
              <Route path="alerts" element={<Suspense fallback={<LoadingFallback />}><ErrorBoundary><AlertsCenter /></ErrorBoundary></Suspense>} />
              <Route path="settings" element={<Suspense fallback={<LoadingFallback />}><ErrorBoundary><SettingsModule /></ErrorBoundary></Suspense>} />
              <Route path="*" element={<Navigate to="/ops" replace />} />
            </Route>

            {/* Global 404 fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </SimulationProvider>
    </AuthProvider>
  );
}

export default App;


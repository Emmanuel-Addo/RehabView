import Dashboard from './components/Dashboard.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

export const metadata = {
  title: "RehabView Ghana | Mine Rehabilitation Monitoring",
    description: "Geoportal for monitoring vegetation recovery on artisanal mining sites in Ghana's high forest zone.",
};

export default function Page() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}


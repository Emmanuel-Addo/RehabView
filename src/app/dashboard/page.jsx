import Dashboard from '@/components/dashboard/Dashboard.jsx';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary.jsx';

export const metadata = {
  title: "Dashboard | RehabView Ghana",
  description: "Dashboard for monitoring vegetation recovery on artisanal mining sites in Ghana's high forest zone.",
};

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}



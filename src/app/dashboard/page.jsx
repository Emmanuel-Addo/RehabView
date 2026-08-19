"use client";

import Dashboard from '@/components/dashboard/Dashboard.jsx';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary.jsx';



export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}



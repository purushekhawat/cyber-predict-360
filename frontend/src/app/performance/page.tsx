'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ModelPerformanceView from '@/components/views/ModelPerformanceView';

export default function PerformancePage() {
  return (
    <DashboardLayout>
      <ModelPerformanceView />
    </DashboardLayout>
  );
}

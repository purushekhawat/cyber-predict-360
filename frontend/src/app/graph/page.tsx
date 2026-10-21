'use client';

import DashboardLayout from '@/components/DashboardLayout';
import MoneyTrailGraph from '@/components/MoneyTrailGraph';

export default function GraphPage() {
  return (
    <DashboardLayout>
      <MoneyTrailGraph />
    </DashboardLayout>
  );
}

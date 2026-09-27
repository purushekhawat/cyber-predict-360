'use client';

import PoliceLayout from '@/components/PoliceLayout';
import PoliceDashboardView from '@/components/views/PoliceDashboardView';

export default function PolicePage() {
  return (
    <PoliceLayout>
      <PoliceDashboardView />
    </PoliceLayout>
  );
}

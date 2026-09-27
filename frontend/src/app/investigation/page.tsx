'use client';

import DashboardLayout from '@/components/DashboardLayout';
import CaseInvestigationView from '@/components/views/CaseInvestigationView';

export default function InvestigationPage() {
  return (
    <DashboardLayout>
      <CaseInvestigationView />
    </DashboardLayout>
  );
}

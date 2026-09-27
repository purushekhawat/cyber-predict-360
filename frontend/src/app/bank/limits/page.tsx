'use client';

import BankLayout from '@/components/BankLayout';
import BankDashboardView from '@/components/views/BankDashboardView';

export default function BankLimitsPage() {
  return (
    <BankLayout>
      <BankDashboardView />
    </BankLayout>
  );
}

'use client';

import BankLayout from '@/components/BankLayout';
import BankDashboardView from '@/components/views/BankDashboardView';

export default function BankMapPage() {
  return (
    <BankLayout>
      <BankDashboardView />
    </BankLayout>
  );
}

'use client';

import BankLayout from '@/components/BankLayout';
import BankDashboardView from '@/components/views/BankDashboardView';

export default function BankFiuPage() {
  return (
    <BankLayout>
      <BankDashboardView />
    </BankLayout>
  );
}

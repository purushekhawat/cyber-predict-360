'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import PredictionDetailsView from '@/components/views/PredictionDetailsView';

function PredictionContent() {
  const searchParams = useSearchParams();
  const ackId = searchParams.get('ackId') || 'ACK20260900001';

  return <PredictionDetailsView initialAckId={ackId} />;
}

export default function PredictionPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="p-8 text-center text-slate-500 font-mono text-sm">Loading predictions...</div>}>
        <PredictionContent />
      </Suspense>
    </DashboardLayout>
  );
}

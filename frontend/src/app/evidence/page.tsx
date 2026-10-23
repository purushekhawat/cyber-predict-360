'use client';

import DashboardLayout from '@/components/DashboardLayout';
import EvidenceAuditView from '@/components/views/EvidenceAuditView';

export default function EvidencePage() {
  return (
    <DashboardLayout>
      <EvidenceAuditView />
    </DashboardLayout>
  );
}

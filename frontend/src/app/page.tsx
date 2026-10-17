'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import CommandCenterView from '@/components/views/CommandCenterView';

export default function Home() {
  const router = useRouter();

  const handleNavigateToPrediction = (ackId: string) => {
    router.push(`/prediction?ackId=${encodeURIComponent(ackId)}`);
  };

  const handleNavigateToHeatmap = () => {
    router.push('/heatmap');
  };

  return (
    <DashboardLayout>
      <CommandCenterView 
        onNavigateToPrediction={handleNavigateToPrediction} 
        onNavigateToHeatmap={handleNavigateToHeatmap} 
      />
    </DashboardLayout>
  );
}

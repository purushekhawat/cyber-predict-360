'use client';

import HotspotMap from '@/components/HotspotMap';

export default function MapPage() {
  return (
    <main className="min-h-screen bg-white p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        <HotspotMap />
      </div>
    </main>
  );
}


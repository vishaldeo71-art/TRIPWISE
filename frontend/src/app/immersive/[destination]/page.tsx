'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DestinationImmersiveRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-[#131314]">
      <p className="text-sm font-semibold">Redirecting to TRIPWISE Home...</p>
    </div>
  );
}

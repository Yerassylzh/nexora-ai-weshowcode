'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function OutlineRedirect() {
  const router = useRouter();
  
  React.useEffect(() => {
    router.replace('/studio');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-neutral-400">Redirecting...</div>
    </div>
  );
}

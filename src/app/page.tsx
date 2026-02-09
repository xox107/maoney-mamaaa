"use client";

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardPage } from '@/components/pages/dashboard-page';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    // This will show a loading screen while the redirect to /login is in progress.
    return <div>Loading...</div>;
  }

  return <DashboardPage />;
}

'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import HeroSection from "@/components/Hero/Hero";


export default function Home() {

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      if (session.user?.role === 'coach') {
        router.push('/coach-dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [session, status, router]);


  return (
  <>
   <HeroSection/>
  </>
  );
}

import { NavBar } from '@/components/navBar/NavBar';
import { TooltipProvider } from '@/components/ui/tooltip';

import { Header } from '@/components/header/Header';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full bg-muted/40">
        <NavBar />
        <div className="flex flex-col w-full">
          <Header />
          <main className="grid flex-1 items-start">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}

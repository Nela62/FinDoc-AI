import { NavBar } from '@/components/navBar/NavBar';
import { TooltipProvider } from '@/components/ui/Tooltip';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
      <div className="flex h-screen w-full flex-col bg-muted/40">
        <NavBar />
        {children}
      </div>
    </TooltipProvider>
  );
}

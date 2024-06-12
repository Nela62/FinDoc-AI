'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from './actions';

export const Settings = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname();
  const section = pathname.split('/')[2];

  return (
    <div className="pt-16 flex h-full flex-col w-full gap-6 bg-muted/40">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Settings</h1>
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <nav
          className="grid gap-4 text-sm text-muted-foreground"
          x-chunk="dashboard-04-chunk-0"
        >
          <Link
            href="/settings/personal"
            className={
              section === 'personal' ? 'font-semibold text-primary' : ''
            }
          >
            Personal Information
          </Link>
          <Link
            href="/settings/company"
            className={
              section === 'company' ? 'font-semibold text-primary' : ''
            }
          >
            Company Information
          </Link>
          {/* <Link href="#">Notifications</Link> */}
          {/* <Link href="#">Workspaces</Link> */}
          <Link
            href="#"
            className={
              section === 'billing' ? 'font-semibold text-primary' : ''
            }
          >
            Billing
          </Link>
          <Link
            href="#"
            className={
              section === 'support' ? 'font-semibold text-primary' : ''
            }
          >
            Support
          </Link>
          <Button
            className="w-fit"
            size="sm"
            onClick={async () => {
              await signOut();
            }}
          >
            Logout
          </Button>
        </nav>
        <div className="grid gap-6">{children}</div>
      </div>
    </div>
  );
};

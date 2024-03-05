'use client';

import { Sidebar } from '@/components/SideBar';
import { EditablePage } from '@/components/editablePage';
import { useRouter } from 'next/router';
import { useRef } from 'react';

export default function Document() {
  const router = useRouter();
  const { document } = router.query;

  const menuContainerRef = useRef(null);

  return (
    <div className="flex h-full" ref={menuContainerRef}>
      <Sidebar />
      <div></div>
    </div>
  );
}

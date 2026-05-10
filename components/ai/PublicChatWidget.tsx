'use client';

import { usePathname } from 'next/navigation';
import { ChatWidget } from './ChatWidget';

export function PublicChatWidget({ tenantId }: { tenantId: string }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return <ChatWidget tenantId={tenantId} />;
}

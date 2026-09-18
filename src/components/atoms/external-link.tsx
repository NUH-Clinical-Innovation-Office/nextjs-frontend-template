import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

interface ExternalLinkProps extends Omit<ComponentPropsWithoutRef<typeof Link>, 'target' | 'rel'> {
  href: string;
  children: ReactNode;
  className?: string;
}

// target and rel are fixed rather than overridable, so a caller cannot open an
// external link without noopener and leak window.opener to the target page.
export function ExternalLink({ href, children, className, ...props }: ExternalLinkProps) {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" className={className} {...props}>
      {children}
    </Link>
  );
}

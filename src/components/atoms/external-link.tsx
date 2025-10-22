import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

interface ExternalLinkProps extends Omit<ComponentPropsWithoutRef<typeof Link>, 'target' | 'rel'> {
  href: string;
  children: ReactNode;
  className?: string;
}

/**
 * A wrapper component for external links that automatically adds
 * security and accessibility best practices (target="_blank" and rel="noopener noreferrer")
 */
export function ExternalLink({ href, children, className, ...props }: ExternalLinkProps) {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" className={className} {...props}>
      {children}
    </Link>
  );
}

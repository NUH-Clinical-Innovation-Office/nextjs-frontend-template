import Image from 'next/image';
import Link from 'next/link';
import { ModeToggle } from '@/components/molecules/mode-toggle';

export function Header() {
  return (
    <header className="border-b border-border px-8 py-4 flex items-center justify-between">
      <Link href="/" className="cursor-pointer">
        <Image
          src="/nuh-logo.png"
          alt="NUH - National University Hospital"
          width={160}
          height={38}
          className="dark:hidden"
          priority
        />
        <Image
          src="/nuh-logo-dark.png"
          alt="NUH - National University Hospital"
          width={160}
          height={38}
          className="hidden dark:block"
          priority
        />
      </Link>
      <ModeToggle />
    </header>
  );
}

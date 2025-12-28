import Link from 'next/link';
import { Joystick } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-background-tertiary bg-background-primary/50 py-6 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col items-center justify-center gap-2 text-sm text-text-secondary sm:flex-row">
        
        <div className="flex items-center gap-2">
          <Joystick size={18} className="text-brand-primary" />
          <span>Desenvolvido por</span>
        </div>

        <Link
          href="https://github.com/ranieryfialho"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-text-primary transition-colors hover:text-brand-primary hover:underline"
        >
          Raniery Fialho
        </Link>
        
      </div>
    </footer>
  );
}
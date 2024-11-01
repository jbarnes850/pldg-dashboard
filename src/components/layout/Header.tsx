import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Github } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">PLDG Dashboard</span>
          </Link>
        </div>
        
        <nav className="flex items-center gap-6">
          <Link 
            href="https://airtable.com/appFEDy5FPBFHPY5r/shr773Cn3Q3owRDDR" 
            target="_blank"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-500 transition-colors group"
          >
            <Image
              src="/logos/Airtable logo.png"
              alt="Airtable Logo"
              width={20}
              height={20}
              className="grayscale group-hover:grayscale-0 group-hover:filter-[#3B82F6] transition-all"
            />
            <span className="hidden sm:inline">Airtable</span>
          </Link>
          
          <Link 
            href="https://github.com/users/kt-wawro/projects/7/views/1" 
            target="_blank"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-500 transition-colors group"
          >
            <Github className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
            <span className="hidden sm:inline">GitHub</span>
          </Link>
          
          <Link 
            href="https://discord.gg/hCw74E2mE4" 
            target="_blank"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-500 transition-colors group"
          >
            <Image
              src="/logos/Discord Icon.png"
              alt="Discord Icon"
              width={20}
              height={20}
              className="grayscale group-hover:grayscale-0 group-hover:filter-[#3B82F6] transition-all"
            />
            <span className="hidden sm:inline">Discord</span>
          </Link>
        </nav>
      </div>
    </header>
  );
} 
import * as React from 'react';
import { Github } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-3">Data Sources</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://airtable.com/appFEDy5FPBFHPY5r/shr773Cn3Q3owRDDR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-500 transition-colors group"
                >
                  <Image
                    src="/logos/Airtable logo.png"
                    alt="Airtable Logo"
                    width={16}
                    height={16}
                    className="grayscale group-hover:grayscale-0 group-hover:filter-[#3B82F6] transition-all"
                  />
                  <span>Engagement Data (Airtable)</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/users/kt-wawro/projects/7/views/1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-500 transition-colors group"
                >
                  <Github className="w-4 h-4 group-hover:text-blue-500 transition-colors" />
                  <span>Contributor Contributions (GitHub)</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://discord.gg/hCw74E2mE4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-500 transition-colors group"
                >
                  <Image
                    src="/logos/Discord Icon.png"
                    alt="Discord Icon"
                    width={16}
                    height={16}
                    className="grayscale group-hover:grayscale-0 group-hover:filter-[#3B82F6] transition-all"
                  />
                  <span>Community Discussion (Discord)</span>
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Update Frequency</h3>
            <p className="text-sm text-muted-foreground">
              • Airtable: Real-time updates<br />
              • GitHub: Every 5 minutes<br />
              • Discord: Daily digest
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">About PLDG</h3>
            <p className="text-sm text-muted-foreground">
              The Protocol Labs Developer Guild (PLDG) is a program designed to drive open source 
              contributors through structured engagement and technical collaboration.
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Protocol Labs. 
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent ml-1">
              All rights reserved.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
} 
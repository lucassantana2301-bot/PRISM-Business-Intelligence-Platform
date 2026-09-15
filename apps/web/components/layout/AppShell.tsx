'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const isLandingExperience = pathname === '/';

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLandingExperience) {
    return (
      <div className="min-h-screen bg-[#07090E] text-prism-text-primary overflow-x-hidden font-sans">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-900 font-sans">
      {/* Desktop Fixed Infinite Sidebar (always 100% viewport height from top to bottom) */}
      <div
        className={clsx(
          'hidden lg:block fixed inset-y-0 left-0 z-40 h-screen transition-all duration-300 shadow-2xl',
          sidebarCollapsed ? 'w-[4.75rem]' : 'w-68'
        )}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-68 h-full bg-[#161922] border-r border-[#272c38]"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              collapsed={false}
              onToggleCollapse={() => {}}
              onMobileClose={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Layout with Dynamic Left Offset */}
      <div
        className={clsx(
          'min-h-screen flex flex-col transition-all duration-300 bg-[#f8f9fc]',
          sidebarCollapsed ? 'lg:pl-[4.75rem]' : 'lg:pl-68'
        )}
      >
        <Topbar
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
        />

        <main className="flex-1 px-6 sm:px-8 lg:px-12 py-8 max-w-[1720px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
};

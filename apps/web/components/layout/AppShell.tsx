'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { RegionProvider } from '@/lib/context/RegionContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { CloudShellDrawer } from './CloudShellDrawer';
import { QueryInspectorDrawer, QueryInspectorData } from '@/components/ui/QueryInspectorDrawer';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const isLandingExperience = pathname === '/experience';

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [cloudShellOpen, setCloudShellOpen] = useState(false);
  const [cloudShellInitialQuery, setCloudShellInitialQuery] = useState('');
  const [queryInspectorOpen, setQueryInspectorOpen] = useState(false);
  const [queryInspectorData, setQueryInspectorData] = useState<QueryInspectorData | null>(null);

  // Global hotkeys listener (Cmd+K / Ctrl+K and backtick ~ for CloudShell)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === '`' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setCloudShellOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenCloudShellWithQuery = (sql: string) => {
    setCloudShellInitialQuery(sql);
    setCloudShellOpen(true);
  };

  if (isLandingExperience) {
    return (
      <RegionProvider>
        <div className="min-h-screen bg-[#07090E] text-prism-text-primary overflow-x-hidden font-sans">
          {children}
        </div>
      </RegionProvider>
    );
  }

  return (
    <RegionProvider>
      <div className="min-h-screen bg-[#f8f9fc] text-slate-900 font-sans">
        {/* Desktop Fixed Infinite Sidebar */}
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
            className="fixed inset-0 z-50 bg-slate-950/70 lg:hidden transition-opacity"
            role="presentation"
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
            'min-h-screen flex flex-col transition-all duration-300',
            sidebarCollapsed ? 'lg:pl-[4.75rem]' : 'lg:pl-68'
          )}
        >
          <Topbar
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
            onOpenCloudShell={() => setCloudShellOpen(true)}
          />

          <main id="main-content" className="flex-1 px-4 sm:px-8 lg:px-10 xl:px-12 py-6 sm:py-8 lg:py-10 max-w-[1720px] w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Global Command Palette */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />

        {/* Global PRISM CloudShell Terminal */}
        <CloudShellDrawer
          isOpen={cloudShellOpen}
          onClose={() => setCloudShellOpen(false)}
          initialQuery={cloudShellInitialQuery}
        />

        {/* Global Query Execution Plan & AST Inspector */}
        <QueryInspectorDrawer
          isOpen={queryInspectorOpen}
          onClose={() => setQueryInspectorOpen(false)}
          data={queryInspectorData}
          onOpenInCloudShell={handleOpenCloudShellWithQuery}
        />
      </div>
    </RegionProvider>
  );
};

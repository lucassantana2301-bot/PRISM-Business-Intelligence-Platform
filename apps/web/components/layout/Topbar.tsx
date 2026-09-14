'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  Search,
  Command,
  Bell,
  Menu,
  ChevronRight,
  User,
  Calendar,
} from 'lucide-react';

export interface TopbarProps {
  onOpenCommandPalette: () => void;
  onMobileMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenCommandPalette,
  onMobileMenuToggle,
}) => {
  const pathname = usePathname();

  const getBreadcrumbs = (path: string) => {
    switch (path) {
      case '/analytics':
        return ['Workspace', 'Acme E-Commerce', 'Dimensional Analytics'];
      case '/explorer':
        return ['Workspace', 'Acme E-Commerce', 'Data Explorer'];
      case '/insights':
        return ['Workspace', 'Acme E-Commerce', 'Insights & Anomalies'];
      case '/ask':
        return ['Workspace', 'Acme E-Commerce', 'Ask PRISM'];
      case '/sources':
        return ['Workspace', 'Acme E-Commerce', 'Data Sources & Warehouses'];
      default:
        return ['Workspace', 'Acme E-Commerce', 'Executive Overview'];
    }
  };

  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="h-14 border-b border-prism-border-subtle bg-prism-bg-canvas/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-1.5 rounded-md bg-prism-bg-card border border-prism-border-subtle text-prism-text-muted hover:text-prism-text-primary"
          title="Toggle Navigation"
          aria-label="Toggle navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Breadcrumb Path */}
        <nav className="flex items-center gap-1.5 text-xs font-mono text-prism-text-muted truncate">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-prism-border-hover shrink-0" />}
                <span
                  className={
                    isLast
                      ? 'text-prism-text-primary font-medium truncate'
                      : 'hover:text-prism-text-secondary cursor-default truncate hidden sm:inline'
                  }
                >
                  {crumb}
                </span>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Actions, Date Picker, Command Palette, Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Command Palette Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-prism-bg-card border border-prism-border-subtle hover:border-prism-border-hover text-xs text-prism-text-muted hover:text-prism-text-secondary transition-colors group"
        >
          <Search className="w-3.5 h-3.5 text-prism-text-muted group-hover:text-prism-text-secondary" />
          <span className="hidden md:inline font-sans text-xs">Search or jump to...</span>
          <div className="flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-prism-bg-elevated border border-prism-border-subtle text-[10px] font-mono text-prism-text-muted">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </button>

        {pathname !== '/ask' && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-prism-bg-card border border-prism-border-subtle text-xs font-mono text-prism-text-secondary" aria-label="Preview period: Last 30 Days">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Last 30 Days</span>
            <span className="text-prism-text-muted">Preview</span>
          </div>
        )}

        {/* Notifications Icon */}
        <button type="button" disabled aria-label="Notifications coming soon" title="Notifications coming soon" className="p-1.5 rounded-md bg-prism-bg-card border border-prism-border-subtle text-prism-text-muted opacity-50 cursor-not-allowed relative">
          <Bell className="w-4 h-4" />
        </button>

        {/* User Profile Avatar */}
        <div className="h-7 w-7 rounded-full bg-prism-bg-elevated border border-prism-border-subtle flex items-center justify-center text-prism-text-secondary text-xs font-mono font-medium">
          <User className="w-3.5 h-3.5" />
        </div>
      </div>
    </header>
  );
};

'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { UserProfileButton } from './UserProfileButton';
import { NotificationPopover } from '../NotificationPopover';

interface TopAppBarProps {
  onMenuClick?: () => void;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
}

export function TopAppBar({ 
  onMenuClick, 
  title = 'Dashboard',
  subtitle = '',
  showSearch = true,
  showNotifications = true 
}: TopAppBarProps) {


  return (
    <header
      className="flex h-16 shrink-0 items-center justify-between gap-3 px-3 sm:px-4 lg:px-6"
      style={{
        backgroundColor: 'var(--md-surface)',
        boxShadow: 'var(--md-elevation-1)',
        fontFamily: 'var(--md-font-body)',
        borderBottom: `1px solid var(--md-divider)`
      }}
    >
      {/* Left section */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        {/* Page title and subtitle */}
        <div className="min-w-0">
          <h1 
            className="truncate text-base font-semibold sm:text-xl"
            style={{ 
              color: 'var(--md-on-surface)',
              fontFamily: 'var(--md-font-display)'
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p 
              className="truncate text-xs sm:text-sm"
              style={{ 
                color: 'var(--md-on-surface-muted)',
                marginTop: '4px'
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right section */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
     

        {/* Notifications */}
        {showNotifications && (
          <NotificationPopover />
        )}

        {/* User profile */}
        <div className="pl-1 sm:pl-2 border-l" style={{ borderColor: 'var(--md-divider)' }}>
          <UserProfileButton />
        </div>
      </div>
    </header>
  );
}

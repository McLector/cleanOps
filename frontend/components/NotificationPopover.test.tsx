import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NotificationPopover } from './NotificationPopover';

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <section data-testid="notification-panel" className={className}>
      {children}
    </section>
  ),
  DropdownMenuItem: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));

vi.mock('@/stores/notificationStore', () => ({
  useNotificationStore: () => ({
    notifications: [],
    unreadCount: 0,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    dismissNotification: vi.fn(),
    loading: false,
  }),
  getNotificationTitle: () => 'Notification',
  getNotificationDescription: () => 'Notification description',
}));

describe('NotificationPopover', () => {
  it('constrains the notification panel to the mobile viewport', () => {
    render(<NotificationPopover />);

    expect(screen.getByTestId('notification-panel')).toHaveClass(
      'w-[calc(100vw-1rem)]',
      'sm:w-[380px]',
      'max-w-[380px]',
    );
  });
});

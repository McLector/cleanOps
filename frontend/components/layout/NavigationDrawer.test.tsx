import { render, screen } from '@testing-library/react';
import type React from 'react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NavigationDrawer } from './NavigationDrawer';

vi.mock('next/link', () => ({
  default: ({
    href,
    onClick,
    children,
    className,
  }: {
    href: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    >
      {children}
    </a>
  ),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('@/lib/authContext', () => ({
  useAuth: () => ({
    profile: {
      id: 'user-1',
      role: 'customer',
      full_name: 'Clean Ops',
    },
    user: {
      email: 'clean@example.com',
      user_metadata: { role: 'customer' },
    },
    logout: vi.fn(),
    loading: false,
    mounted: true,
  }),
}));

vi.mock('@/hooks/realtime/useUnreadCount', () => ({
  useUnreadCount: () => ({ unreadCount: 0 }),
}));

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(),
}));

describe('NavigationDrawer', () => {
  it('closes the mobile drawer after a navigation item is selected', async () => {
    const user = userEvent.setup();
    const setIsMobileOpen = vi.fn();

    render(<NavigationDrawer isMobileOpen setIsMobileOpen={setIsMobileOpen} />);

    await user.click(screen.getByRole('link', { name: /book service/i }));

    expect(setIsMobileOpen).toHaveBeenCalledWith(false);
  });
});

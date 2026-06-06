import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MainLayout } from './MainLayout';

vi.mock('./NavigationDrawer', () => ({
  NavigationDrawer: () => <aside>Navigation</aside>,
}));

vi.mock('./UserProfileButton', () => ({
  UserProfileButton: () => <button type="button">Profile</button>,
}));

vi.mock('../NotificationPopover', () => ({
  NotificationPopover: () => <button type="button">Notifications</button>,
}));

describe('MainLayout', () => {
  it('uses mobile-safe viewport height and responsive content padding', () => {
    render(
      <MainLayout title="Dashboard">
        <section>Page content</section>
      </MainLayout>,
    );

    expect(screen.getByTestId('main-layout-shell')).toHaveClass('h-dvh');
    expect(screen.getByTestId('main-layout-content')).toHaveClass('p-4', 'sm:p-6');
  });
});

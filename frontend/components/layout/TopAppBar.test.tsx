import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TopAppBar } from './TopAppBar';

vi.mock('./UserProfileButton', () => ({
  UserProfileButton: () => <button type="button">Profile</button>,
}));

vi.mock('../NotificationPopover', () => ({
  NotificationPopover: () => <button type="button">Notifications</button>,
}));

describe('TopAppBar', () => {
  it('renders a mobile menu button when a menu handler is provided', async () => {
    const user = userEvent.setup();
    const onMenuClick = vi.fn();

    render(<TopAppBar title="Dashboard" onMenuClick={onMenuClick} />);

    const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
    expect(menuButton).toHaveClass('lg:hidden');

    await user.click(menuButton);

    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it('does not render a mobile menu button without a menu handler', () => {
    render(<TopAppBar title="Dashboard" />);

    expect(screen.queryByRole('button', { name: /open navigation menu/i })).not.toBeInTheDocument();
  });
});

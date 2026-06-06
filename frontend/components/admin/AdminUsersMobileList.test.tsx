import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AdminUsersMobileList } from './AdminUsersMobileList';

const account = {
  id: 'user-123',
  full_name: 'Ana Reyes',
  email: 'ana@example.com',
  role: 'customer',
  money_balance: 42.5,
  rating: 4.8,
  created_at: '2026-05-30T08:00:00.000Z',
};

describe('AdminUsersMobileList', () => {
  it('renders users as phone-only cards with management actions', async () => {
    const user = userEvent.setup();
    const onToggleUser = vi.fn();
    const onSuspendUser = vi.fn();

    render(
      <AdminUsersMobileList
        users={[account]}
        loading={false}
        expandedRows={new Set()}
        userActivityCache={{}}
        roleStyles={{ customer: 'bg-blue-50 text-blue-700' }}
        avatarStyles={{ customer: 'bg-blue-500' }}
        onToggleUser={onToggleUser}
        onSuspendUser={onSuspendUser}
        onViewJobs={vi.fn()}
      />,
    );

    expect(screen.getByTestId('admin-users-mobile-list')).toHaveClass('md:hidden');
    expect(screen.getByText('Ana Reyes')).toBeInTheDocument();
    expect(screen.getByText('ana@example.com')).toBeInTheDocument();
    expect(screen.getByText('$42.50')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /suspend ana reyes/i }));
    expect(onSuspendUser).toHaveBeenCalledWith(account);
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AdminJobsMobileList } from './AdminJobsMobileList';

const job = {
  id: 'job-123456789',
  customer: { full_name: 'Maya Cruz' },
  worker: { full_name: 'Leo Santos' },
  status: 'IN_PROGRESS',
  urgency: 'HIGH',
  price_amount: 125,
  created_at: '2026-06-01T08:00:00.000Z',
  updated_at: '2026-06-01T09:00:00.000Z',
  location_address: '123 Clean Street',
  tasks: ['Kitchen', 'Windows'],
};

describe('AdminJobsMobileList', () => {
  it('renders jobs as phone-only cards with visible actions', async () => {
    const user = userEvent.setup();
    const onToggleRow = vi.fn();
    const onCopyJobId = vi.fn();
    const onSelectAction = vi.fn();

    render(
      <AdminJobsMobileList
        jobs={[job]}
        loading={false}
        expandedRows={new Set()}
        statusColors={{ IN_PROGRESS: 'bg-yellow-100 text-yellow-800' }}
        onToggleRow={onToggleRow}
        onCopyJobId={onCopyJobId}
        onSelectAction={onSelectAction}
      />,
    );

    expect(screen.getByTestId('admin-jobs-mobile-list')).toHaveClass('md:hidden');
    expect(screen.getByText('Maya Cruz')).toBeInTheDocument();
    expect(screen.getByText('Leo Santos')).toBeInTheDocument();
    expect(screen.getByText('$125.00')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /force complete/i }));
    expect(onSelectAction).toHaveBeenCalledWith(job, 'complete');

    await user.click(screen.getByRole('button', { name: /copy job id/i }));
    expect(onCopyJobId).toHaveBeenCalledWith(job.id);
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminFilterBar } from './AdminFilterBar';

describe('AdminFilterBar', () => {
  it('uses responsive filter and summary layouts', () => {
    render(
      <AdminFilterBar
        searchQuery=""
        onSearchChange={vi.fn()}
        filters={[
          {
            label: 'Status',
            value: 'All',
            options: ['All', 'OPEN'],
            onChange: vi.fn(),
            type: 'pills',
          },
        ]}
        summary={
          <>
            <span>Showing 10 jobs</span>
            <span>Displayed Value: $100.00</span>
          </>
        }
      />,
    );

    expect(screen.getByTestId('admin-filter-card')).toHaveClass(
      'flex-col',
      'lg:flex-row',
      'items-stretch',
      'lg:items-end',
    );
    expect(screen.getByTestId('admin-filter-summary')).toHaveClass(
      'flex-col',
      'sm:flex-row',
      'gap-1',
      'sm:gap-4',
    );
  });
});

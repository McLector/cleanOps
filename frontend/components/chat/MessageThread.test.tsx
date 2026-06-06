import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { MessageThread } from './MessageThread';

vi.mock('@/hooks/realtime/useJobMessages', () => ({
  useJobMessages: () => ({
    loading: false,
    messages: [
      {
        id: 'message-1',
        sender_id: 'other-user',
        content: 'Please use the side entrance when you arrive.',
        created_at: '2026-06-05T10:00:00.000Z',
      },
    ],
  }),
}));

vi.mock('@/app/actions/messages', () => ({
  sendMessage: vi.fn(),
}));

describe('MessageThread', () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('uses responsive spacing and mobile-safe message width', () => {
    render(
      <MessageThread
        jobId="job-1"
        otherPartyName="Maya"
        jobAddress="123 Clean Street"
        currentUserId="current-user"
        onMarkRead={vi.fn()}
      />,
    );

    expect(screen.getByTestId('message-thread-header')).toHaveClass('px-4', 'sm:px-6');
    expect(screen.getByTestId('message-thread-scroll')).toHaveClass('p-4', 'sm:p-6');
    expect(screen.getByTestId('message-bubble-message-1')).toHaveClass('max-w-[min(82vw,28rem)]');
    expect(screen.getByTestId('message-thread-composer')).toHaveClass('p-3', 'sm:p-4');
  });
});

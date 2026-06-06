import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Modal } from './modal';

describe('Modal', () => {
  it('constrains the dialog to the mobile viewport', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Confirm">
        <p>Modal content</p>
      </Modal>,
    );

    expect(screen.getByRole('dialog')).toHaveClass(
      'w-[calc(100vw-2rem)]',
      'max-w-md',
      'max-h-[calc(100dvh-2rem)]',
    );
  });
});

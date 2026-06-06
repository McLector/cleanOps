import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CardContent, CardFooter, CardHeader } from './card';

describe('card primitives', () => {
  it('uses smaller default padding on phones and restores desktop spacing at sm', () => {
    render(
      <>
        <CardHeader>Header</CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </>,
    );

    expect(screen.getByText('Header')).toHaveClass('p-4', 'sm:p-6');
    expect(screen.getByText('Content')).toHaveClass('p-4', 'pt-0', 'sm:p-6');
    expect(screen.getByText('Footer')).toHaveClass('p-4', 'pt-0', 'sm:p-6');
  });
});

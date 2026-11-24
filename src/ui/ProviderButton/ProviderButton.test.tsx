import { readFileSync } from 'node:fs';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ProviderButton } from './ProviderButton';

afterEach(cleanup);

const css = readFileSync('src/ui/ProviderButton/ProviderButton.css', 'utf8');

describe('ProviderButton', () => {
  it('is a native button named by its label, the mark hidden', () => {
    render(<ProviderButton provider="apple" />);
    const b = screen.getByRole('button', { name: 'Continue with Apple' });
    expect(b.getAttribute('type')).toBe('button');
    expect(b.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('is a link with href, and a disabled button with href and disabled', () => {
    const { rerender } = render(<ProviderButton provider="google" href="/auth/google" />);
    expect(screen.getByRole('link', { name: 'Continue with Google' }).getAttribute('href')).toBe('/auth/google');
    rerender(<ProviderButton provider="google" href="/auth/google" disabled />);
    expect(screen.queryByRole('link')).toBeNull();
    const b = screen.getByRole('button', { name: 'Continue with Google' }) as HTMLButtonElement;
    expect(b.disabled).toBe(true);
    expect(b.hasAttribute('href')).toBe(false);
  });

  it('keeps an edge in forced colours, and does not scale under reduced motion', () => {
    expect(css).toContain('@media (forced-colors:active){.sk-provider{border:var(--provider-button-forced-edge-width) solid ButtonText}}');
    expect(css).toContain('@media (forced-colors:active){.sk-provider:disabled{color:GrayText;border-color:GrayText}}');
    expect(css).toContain('@media (prefers-reduced-motion:reduce){.sk-provider:active:not(:disabled){transform:none}}');
  });
});

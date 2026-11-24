import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MakiTurn } from '../MakiTurn/MakiTurn';
import { MakiPanel } from './MakiPanel';

afterEach(cleanup);

describe('MakiPanel', () => {
  it('a section named "Maki": "{count} to look at" jumps to Review, then Close Maki; Maki’s face is hidden', () => {
    const onWaiting = vi.fn(), onClose = vi.fn();
    const { container } = render(<MakiPanel avatar="m.png" waiting={4} onWaiting={onWaiting} onClose={onClose}><MakiTurn><p>Hi</p></MakiTurn></MakiPanel>);
    expect(screen.getByRole('region', { name: 'Maki' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '4 to look at' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close Maki' }));
    expect(onWaiting).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
    expect(container.querySelector('.sk-mk-head__face')!.getAttribute('alt')).toBe('');
  });

  it('the conversation is a log "Conversation with Maki", held back while writing', () => {
    render(<MakiPanel avatar="m.png" writing><MakiTurn><p>Hi</p></MakiTurn></MakiPanel>);
    const log = screen.getByRole('log', { name: 'Conversation with Maki' });
    expect(log.getAttribute('aria-busy')).toBe('true');
  });

  it('nothing said yet: the greeting and what to ask, rows that send', () => {
    const onSuggestion = vi.fn();
    render(<MakiPanel avatar="m.png" greeting="Ask me about the story." suggestions={['Which issue matters most?']} onSuggestion={onSuggestion} />);
    expect(screen.getByText('Ask me about the story.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Which issue matters most?' }));
    expect(onSuggestion).toHaveBeenCalledWith('Which issue matters most?');
  });

  it('composer={false} drops the composer; its placeholder and onSend pass through otherwise', () => {
    const onSend = vi.fn();
    const { rerender } = render(<MakiPanel avatar="m.png" placeholder="Ask Maki…" onSend={onSend} />);
    const field = screen.getByRole('textbox', { name: 'Message to Maki' });
    expect(field.getAttribute('placeholder')).toBe('Ask Maki…');
    fireEvent.change(field, { target: { value: 'Hi' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSend).toHaveBeenCalledWith('Hi');
    rerender(<MakiPanel avatar="m.png" composer={false} />);
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('attach, files, onRemoveFile and onMention pass through to the composer; attach={false} draws no +', () => {
    const onRemoveFile = vi.fn();
    const { rerender } = render(<MakiPanel avatar="m.png" files={[{ id: 'a', name: 'lighthouse.png' }]} onRemoveFile={onRemoveFile} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove lighthouse.png' }));
    expect(onRemoveFile).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Attach' })).toBeTruthy();
    rerender(<MakiPanel avatar="m.png" attach={false} />);
    expect(screen.queryByRole('button', { name: 'Attach' })).toBeNull();
  });
});

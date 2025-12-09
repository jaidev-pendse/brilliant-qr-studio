import { useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { toast } from '@/hooks/use-toast';

type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'vcard' | 'sms' | 'location' | 'calendar' | 'social';

interface KeyboardShortcutsConfig {
  onDownloadPNG: () => void;
  onDownloadSVG: () => void;
  onCopyData: () => void;
  onSetQRType: (type: QRType) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

const QR_TYPES: QRType[] = ['url', 'text', 'email', 'phone', 'wifi', 'vcard', 'sms', 'location', 'calendar', 'social'];

export const useKeyboardShortcuts = ({
  onDownloadPNG,
  onDownloadSVG,
  onCopyData,
  onSetQRType,
  inputRef,
}: KeyboardShortcutsConfig) => {
  const { theme, setTheme } = useTheme();

  const isInputFocused = useCallback(() => {
    const activeElement = document.activeElement;
    if (!activeElement) return false;
    const tagName = activeElement.tagName.toLowerCase();
    return tagName === 'input' || tagName === 'textarea' || (activeElement as HTMLElement).isContentEditable;
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMod = e.metaKey || e.ctrlKey;
    
    // Escape - close modals (always active)
    if (e.key === 'Escape') {
      const dialogs = document.querySelectorAll('[role="dialog"]');
      if (dialogs.length > 0) {
        // Click the close button or backdrop
        const closeButton = document.querySelector('[role="dialog"] button[aria-label="Close"]') as HTMLButtonElement;
        closeButton?.click();
      }
      return;
    }

    // Don't trigger shortcuts when typing in inputs (except for Escape)
    if (isInputFocused()) return;

    // Ctrl/Cmd + D → Download PNG
    if (isMod && e.key === 'd' && !e.shiftKey) {
      e.preventDefault();
      onDownloadPNG();
      toast({ title: '⬇️ Downloading PNG...', description: 'Ctrl/Cmd + D' });
      return;
    }

    // Ctrl/Cmd + Shift + D → Download SVG
    if (isMod && e.key === 'D' && e.shiftKey) {
      e.preventDefault();
      onDownloadSVG();
      toast({ title: '⬇️ Downloading SVG...', description: 'Ctrl/Cmd + Shift + D' });
      return;
    }

    // Ctrl/Cmd + C → Copy QR data (when not in input)
    if (isMod && e.key === 'c') {
      e.preventDefault();
      onCopyData();
      return;
    }

    // Ctrl/Cmd + K → Focus input
    if (isMod && e.key === 'k') {
      e.preventDefault();
      inputRef?.current?.focus();
      toast({ title: '🔍 Input focused', description: 'Ctrl/Cmd + K' });
      return;
    }

    // Ctrl/Cmd + Shift + L → Toggle dark mode
    if (isMod && e.key === 'L' && e.shiftKey) {
      e.preventDefault();
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      toast({ title: `${newTheme === 'dark' ? '🌙' : '☀️'} ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode`, description: 'Ctrl/Cmd + Shift + L' });
      return;
    }

    // Ctrl/Cmd + 1-9 → Switch QR type tabs (0 for 10th)
    if (isMod && /^[1-9]$/.test(e.key)) {
      e.preventDefault();
      const index = parseInt(e.key) - 1;
      if (index < QR_TYPES.length) {
        onSetQRType(QR_TYPES[index]);
        toast({ title: `📱 Switched to ${QR_TYPES[index].toUpperCase()}`, description: `Ctrl/Cmd + ${e.key}` });
      }
      return;
    }

    // Ctrl/Cmd + 0 → Switch to 10th tab (social)
    if (isMod && e.key === '0') {
      e.preventDefault();
      if (QR_TYPES.length >= 10) {
        onSetQRType(QR_TYPES[9]);
        toast({ title: `📱 Switched to ${QR_TYPES[9].toUpperCase()}`, description: 'Ctrl/Cmd + 0' });
      }
      return;
    }
  }, [isInputFocused, onDownloadPNG, onDownloadSVG, onCopyData, onSetQRType, inputRef, theme, setTheme]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

export const KEYBOARD_SHORTCUTS = [
  { keys: ['Ctrl/⌘', 'D'], description: 'Download PNG' },
  { keys: ['Ctrl/⌘', 'Shift', 'D'], description: 'Download SVG' },
  { keys: ['Ctrl/⌘', 'C'], description: 'Copy QR data' },
  { keys: ['Ctrl/⌘', 'K'], description: 'Focus input' },
  { keys: ['Ctrl/⌘', '1-0'], description: 'Switch QR type' },
  { keys: ['Ctrl/⌘', 'Shift', 'L'], description: 'Toggle dark mode' },
  { keys: ['Esc'], description: 'Close dialogs' },
];

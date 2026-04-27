/**
 * Meet HaSammie Suah — Frontend
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import { useState, useRef, useCallback, useEffect } from 'react';

interface UseImageDropOptions {
  onImage: (dataUrl: string) => void;
  enablePaste?: boolean;
}

export const useImageDrop = ({ onImage, enablePaste = true }: UseImageDropOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError]           = useState('');
  const dragCounter                 = useRef(0);

  const readFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please drop an image file (JPG, PNG, WebP, GIF)');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = e => onImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, [onImage]);

  // ── Paste anywhere on the page ──────────────────────────────────────────
  useEffect(() => {
    if (!enablePaste) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) { readFile(file); break; }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [enablePaste, readFile]);

  // ── Drag handlers for a drop zone element ───────────────────────────────
  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    if (e.dataTransfer.items.length > 0) setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }, [readFile]);

  return { isDragging, error, onDragEnter, onDragLeave, onDragOver, onDrop };
};

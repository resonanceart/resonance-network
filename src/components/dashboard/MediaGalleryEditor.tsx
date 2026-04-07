'use client';

import React, { useRef } from 'react';

export interface MediaItem {
  url: string;
  alt: string;
  caption?: string;
  type: 'image' | 'video';
  videoEmbedUrl?: string;
  isFeatured?: boolean;
  order: number;
}

interface MediaGalleryEditorProps {
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  onUpload?: (file: File, type: string) => Promise<string | null>;
}

export default function MediaGalleryEditor({ items, onChange, onUpload }: MediaGalleryEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sorted = [...items].sort((a, b) => a.order - b.order);

  function updateItem(index: number, updates: Partial<MediaItem>) {
    const next = sorted.map((item, i) => (i === index ? { ...item, ...updates } : item));
    onChange(next);
  }

  function removeItem(index: number) {
    const next = sorted.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i }));
    onChange(next);
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const next = [...sorted];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((item, i) => ({ ...item, order: i })));
  }

  function toggleFeatured(index: number) {
    const next = sorted.map((item, i) => ({
      ...item,
      isFeatured: i === index ? !item.isFeatured : item.isFeatured,
    }));
    onChange(next);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = async () => {
      const maxWidth = 1200;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, width, height);

      const nextOrder = sorted.length > 0 ? sorted[sorted.length - 1].order + 1 : 0;

      if (onUpload) {
        // Upload resized image to Storage instead of keeping as base64
        const blob = await new Promise<Blob | null>(resolve =>
          canvas.toBlob(resolve, 'image/jpeg', 0.85)
        );
        if (!blob) return;
        const resizedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
        const url = await onUpload(resizedFile, 'gallery');
        if (url) {
          onChange([...sorted, { url, alt: '', type: 'image', order: nextOrder }]);
        }
      } else {
        // Fallback: use base64 data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onChange([...sorted, { url: dataUrl, alt: '', type: 'image', order: nextOrder }]);
      }
    };

    img.src = URL.createObjectURL(file);
    e.target.value = '';
  }

  function handleAddVideo() {
    const url = window.prompt('Enter YouTube or Vimeo URL:');
    if (!url) return;
    const nextOrder = sorted.length > 0 ? sorted[sorted.length - 1].order + 1 : 0;
    onChange([...sorted, { url, alt: '', type: 'video', order: nextOrder }]);
  }

  return (
    <div className="media-gallery-editor">
      <div className="media-gallery-editor__grid">
        {sorted.map((item, index) => (
          <div className="media-gallery-editor__item" key={`${item.order}-${item.url}`}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--space-1, 4px)', overflow: 'hidden' }}>
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.alt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              )}

              {/* Featured toggle */}
              <button
                type="button"
                onClick={() => toggleFeatured(index)}
                title={item.isFeatured ? 'Unmark as featured' : 'Mark as featured'}
                style={{
                  position: 'absolute',
                  top: 'var(--space-1, 4px)',
                  left: 'var(--space-1, 4px)',
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  lineHeight: 1,
                  fontSize: '18px',
                  color: item.isFeatured ? '#f5c518' : 'rgba(255,255,255,0.6)',
                }}
              >
                {item.isFeatured ? '\u2605' : '\u2606'}
              </button>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeItem(index)}
                title="Remove"
                style={{
                  position: 'absolute',
                  top: 'var(--space-1, 4px)',
                  right: 'var(--space-1, 4px)',
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  lineHeight: 1,
                  fontSize: '14px',
                  color: '#fff',
                  fontWeight: 700,
                }}
              >
                &times;
              </button>
            </div>

            {/* Caption input */}
            <input
              type="text"
              placeholder="Caption"
              value={item.caption ?? ''}
              onChange={(e) => updateItem(index, { caption: e.target.value })}
              style={{
                width: '100%',
                marginTop: 'var(--space-1, 4px)',
                padding: 'var(--space-1, 4px) var(--space-2, 8px)',
                fontSize: 'var(--text-sm, 14px)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                background: 'var(--color-surface)',
                color: 'inherit',
                boxSizing: 'border-box',
              }}
            />

            {/* Alt text input */}
            <input
              type="text"
              placeholder="Alt text"
              value={item.alt}
              onChange={(e) => updateItem(index, { alt: e.target.value })}
              style={{
                width: '100%',
                marginTop: 'var(--space-1, 4px)',
                padding: 'var(--space-1, 4px) var(--space-2, 8px)',
                fontSize: 'var(--text-xs, 12px)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                background: 'var(--color-surface)',
                color: 'var(--color-text-muted)',
                boxSizing: 'border-box',
              }}
            />

            {/* Reorder buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-1, 4px)', marginTop: 'var(--space-1, 4px)' }}>
              <button
                type="button"
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '16px',
                  minHeight: '40px',
                  cursor: index === 0 ? 'default' : 'pointer',
                  opacity: index === 0 ? 0.3 : 1,
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  background: 'var(--color-surface)',
                  color: 'inherit',
                }}
              >
                &uarr;
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, 1)}
                disabled={index === sorted.length - 1}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '16px',
                  minHeight: '40px',
                  cursor: index === sorted.length - 1 ? 'default' : 'pointer',
                  opacity: index === sorted.length - 1 ? 0.3 : 1,
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  background: 'var(--color-surface)',
                  color: 'inherit',
                }}
              >
                &darr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-2, 8px)', marginTop: 'var(--space-2, 8px)', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="media-gallery-editor__add-btn"
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: 'var(--space-3, 12px) var(--space-4, 16px)',
            fontSize: 'var(--text-sm, 14px)',
            cursor: 'pointer',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            background: 'var(--color-surface)',
            color: 'var(--color-primary)',
            minHeight: '44px',
          }}
        >
          + Add Image
        </button>
        <button
          type="button"
          onClick={handleAddVideo}
          style={{
            padding: 'var(--space-3, 12px) var(--space-4, 16px)',
            fontSize: 'var(--text-sm, 14px)',
            cursor: 'pointer',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            background: 'var(--color-surface)',
            color: 'var(--color-primary)',
            minHeight: '44px',
          }}
        >
          + Add Video
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
}

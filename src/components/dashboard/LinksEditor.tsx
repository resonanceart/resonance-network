'use client';

import { useState } from 'react';

export type LinkItem = {
  label: string;
  url: string;
  type?: 'website' | 'instagram' | 'linkedin' | 'portfolio' | 'press' | 'other';
};

interface LinksEditorProps {
  links: LinkItem[];
  onChange: (links: LinkItem[]) => void;
}

const LINK_TYPES: LinkItem['type'][] = [
  'website',
  'instagram',
  'linkedin',
  'portfolio',
  'press',
  'other',
];

const emptyForm: LinkItem = { label: '', url: '', type: 'website' };

export default function LinksEditor({ links, onChange }: LinksEditorProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<LinkItem>({ ...emptyForm });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const openAddForm = () => {
    setFormData({ ...emptyForm });
    setEditingIndex(null);
    setShowForm(true);
  };

  const openEditForm = (index: number) => {
    setFormData({ ...links[index] });
    setEditingIndex(index);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setFormData({ ...emptyForm });
    setEditingIndex(null);
  };

  const saveForm = () => {
    if (!formData.label.trim() || !formData.url.trim()) return;

    const updated = [...links];
    if (editingIndex !== null) {
      updated[editingIndex] = { ...formData };
    } else {
      updated.push({ ...formData });
    }
    onChange(updated);
    cancelForm();
  };

  const deleteLink = (index: number) => {
    const updated = links.filter((_, i) => i !== index);
    onChange(updated);
    if (editingIndex === index) {
      cancelForm();
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...links];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
  };

  const moveDown = (index: number) => {
    if (index === links.length - 1) return;
    const updated = [...links];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  };

  const truncateUrl = (url: string, maxLength = 40) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <div className="links-editor">
      <div className="links-editor__list">
        {links.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            No links added yet.
          </p>
        )}
        {links.map((link, index) => (
          <div className="links-editor__item" key={index}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500 }}>{link.label}</div>
              <div
                style={{
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--text-sm)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {truncateUrl(link.url)}
              </div>
            </div>
            {link.type && (
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  padding: '2px var(--space-2)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                {link.type}
              </span>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
              <button
                className="btn btn--outline"
                onClick={() => moveUp(index)}
                disabled={index === 0}
                aria-label="Move up"
                style={{ padding: 'var(--space-2)' }}
              >
                ↑
              </button>
              <button
                className="btn btn--outline"
                onClick={() => moveDown(index)}
                disabled={index === links.length - 1}
                aria-label="Move down"
                style={{ padding: 'var(--space-2)' }}
              >
                ↓
              </button>
              <button
                className="btn btn--outline"
                onClick={() => openEditForm(index)}
                style={{ padding: 'var(--space-2)' }}
              >
                Edit
              </button>
              <button
                className="btn btn--outline"
                onClick={() => deleteLink(index)}
                style={{ padding: 'var(--space-2)' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="links-editor__form">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Label</span>
              <input
                type="text"
                required
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="My Website"
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  fontSize: 'var(--text-sm)',
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>URL</span>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  fontSize: 'var(--text-sm)',
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Type</span>
              <select
                value={formData.type || 'website'}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as LinkItem['type'] })
                }
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  fontSize: 'var(--text-sm)',
                  background: 'var(--color-surface)',
                }}
              >
                {LINK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <button className="btn btn--primary" onClick={saveForm}>
                {editingIndex !== null ? 'Update' : 'Save'}
              </button>
              <button className="btn btn--outline" onClick={cancelForm}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          className="btn btn--primary"
          onClick={openAddForm}
          style={{ marginTop: 'var(--space-4)' }}
        >
          Add Link
        </button>
      )}
    </div>
  );
}

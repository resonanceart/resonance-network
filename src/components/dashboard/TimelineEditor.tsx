'use client';

import React, { useState } from 'react';

type TimelineEntry = {
  year: string;
  title: string;
  organization?: string;
  description?: string;
  category:
    | 'exhibition'
    | 'education'
    | 'award'
    | 'residency'
    | 'career'
    | 'publication'
    | 'other';
};

type TimelineEditorProps = {
  entries: TimelineEntry[];
  onChange: (entries: TimelineEntry[]) => void;
};

const CATEGORIES: TimelineEntry['category'][] = [
  'exhibition',
  'education',
  'award',
  'residency',
  'career',
  'publication',
  'other',
];

const emptyEntry: TimelineEntry = {
  year: '',
  title: '',
  organization: '',
  description: '',
  category: 'exhibition',
};

export default function TimelineEditor({ entries, onChange }: TimelineEditorProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<TimelineEntry>({ ...emptyEntry });

  const sortedEntries = [...entries].sort((a, b) => b.year.localeCompare(a.year));

  const handleAdd = () => {
    setFormData({ ...emptyEntry });
    setEditingIndex(null);
    setShowForm(true);
  };

  const handleEdit = (originalIndex: number) => {
    setFormData({ ...entries[originalIndex] });
    setEditingIndex(originalIndex);
    setShowForm(true);
  };

  const handleDelete = (originalIndex: number) => {
    const updated = entries.filter((_, i) => i !== originalIndex);
    onChange(updated);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingIndex(null);
    setFormData({ ...emptyEntry });
  };

  const handleSave = () => {
    if (!formData.year.trim() || !formData.title.trim()) return;

    const cleaned: TimelineEntry = {
      year: formData.year.trim(),
      title: formData.title.trim(),
      category: formData.category,
      ...(formData.organization?.trim() ? { organization: formData.organization.trim() } : {}),
      ...(formData.description?.trim() ? { description: formData.description.trim() } : {}),
    };

    let updated: TimelineEntry[];
    if (editingIndex !== null) {
      updated = entries.map((entry, i) => (i === editingIndex ? cleaned : entry));
    } else {
      updated = [...entries, cleaned];
    }

    onChange(updated);
    handleCancel();
  };

  const handleFieldChange = (
    field: keyof TimelineEntry,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Map sorted entries back to their original index in the entries array
  const getOriginalIndex = (entry: TimelineEntry): number => {
    return entries.indexOf(entry);
  };

  return (
    <div className="timeline-editor">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-3)',
        }}
      >
        <h3 style={{ margin: 0 }}>Timeline</h3>
        {!showForm && (
          <button className="btn btn--primary" onClick={handleAdd}>
            Add Entry
          </button>
        )}
      </div>

      {showForm && (
        <div
          className="timeline-editor__form"
          style={{
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-3)',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Year *
              </label>
              <input
                type="text"
                required
                placeholder="2024"
                value={formData.year}
                onChange={(e) => handleFieldChange('year', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-2)',
                  fontSize: 'var(--text-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  handleFieldChange('category', e.target.value)
                }
                style={{
                  width: '100%',
                  padding: 'var(--space-2)',
                  fontSize: 'var(--text-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-3)' }}>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-2)',
              }}
            >
              Title *
            </label>
            <input
              type="text"
              required
              placeholder="Solo Exhibition: Woven Structures"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 'var(--space-3)' }}>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-2)',
              }}
            >
              Organization
            </label>
            <input
              type="text"
              placeholder="MoMA PS1"
              value={formData.organization ?? ''}
              onChange={(e) => handleFieldChange('organization', e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 'var(--space-3)' }}>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-2)',
              }}
            >
              Description
            </label>
            <textarea
              placeholder=""
              value={formData.description ?? ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn btn--primary" onClick={handleSave}>
              {editingIndex !== null ? 'Update' : 'Save'}
            </button>
            <button className="btn btn--outline" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="timeline-editor__list">
        {sortedEntries.length === 0 && (
          <p
            style={{
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-sm)',
              textAlign: 'center',
              padding: 'var(--space-4)',
            }}
          >
            No timeline entries yet.
          </p>
        )}
        {sortedEntries.map((entry) => {
          const originalIndex = getOriginalIndex(entry);
          return (
            <div
              key={`${entry.year}-${entry.title}-${originalIndex}`}
              className="timeline-editor__entry"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {entry.year}
                  </span>
                  <span className={`badge badge--${entry.category}`}>
                    {entry.category}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                  }}
                >
                  {entry.title}
                </div>
                {entry.organization && (
                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {entry.organization}
                  </div>
                )}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--space-2)',
                  flexShrink: 0,
                }}
              >
                <button
                  className="btn btn--outline"
                  onClick={() => handleEdit(originalIndex)}
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  Edit
                </button>
                <button
                  className="btn btn--outline"
                  onClick={() => handleDelete(originalIndex)}
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { useThemeColors } from '@/lib/theme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const colors = useThemeColors();

  const baseStyle: React.CSSProperties = {
    backgroundColor: colors.input,
    border: `1px solid ${error ? '#EF4444' : colors.border}`,
    borderRadius: '8px',
    padding: '8px 12px',
    color: colors.text,
    fontSize: '16px',
    width: '100%',
    transition: 'border-color 150ms ease',
    outline: 'none',
    ...style,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: colors.text,
  };

  const errorStyle: React.CSSProperties = {
    marginTop: '4px',
    fontSize: '12px',
    color: '#EF4444',
  };

  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <input
        style={baseStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.accent;
          e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accent}33`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? '#EF4444' : colors.border;
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, style, ...props }: TextareaProps) {
  const colors = useThemeColors();

  const baseStyle: React.CSSProperties = {
    backgroundColor: colors.input,
    border: `1px solid ${error ? '#EF4444' : colors.border}`,
    borderRadius: '8px',
    padding: '8px 12px',
    color: colors.text,
    fontSize: '16px',
    width: '100%',
    minHeight: '100px',
    resize: 'vertical',
    transition: 'border-color 150ms ease',
    outline: 'none',
    fontFamily: 'inherit',
    ...style,
  };

  return (
    <div>
      {label && (
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: colors.text }}>
          {label}
        </label>
      )}
      <textarea
        style={baseStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.accent;
          e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accent}33`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? '#EF4444' : colors.border;
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && <p style={{ marginTop: '4px', fontSize: '12px', color: '#EF4444' }}>{error}</p>}
    </div>
  );
}

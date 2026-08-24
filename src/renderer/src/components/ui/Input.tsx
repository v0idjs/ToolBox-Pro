import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode
} from 'react'

interface FieldWrapperProps {
  label?: string
  error?: string
  hint?: string
  children: (id: string) => ReactNode
}

function FieldWrapper({ label, error, hint, children }: FieldWrapperProps) {
  const autoId = useId()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label
          htmlFor={autoId}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--tb-text)',
            letterSpacing: '0.01em'
          }}
        >
          {label}
        </label>
      )}
      {children(autoId)}
      {(error || hint) && (
        <span
          role={error ? 'alert' : undefined}
          style={{
            fontSize: 12,
            fontFamily: 'var(--tb-font-mono)',
            letterSpacing: '0.02em',
            color: error ? 'var(--tb-error)' : 'var(--tb-text-faint)'
          }}
        >
          {error || hint}
        </span>
      )}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, style, ...rest },
  ref
) {
  return (
    <FieldWrapper label={label} error={error} hint={hint}>
      {(id) => (
        <input
          ref={ref}
          id={rest.id ?? id}
          className="tb-field"
          aria-invalid={error ? true : undefined}
          style={{ ...style }}
          {...rest}
        />
      )}
    </FieldWrapper>
  )
})

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  mono?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, mono = false, style, ...rest },
  ref
) {
  return (
    <FieldWrapper label={label} error={error} hint={hint}>
      {(id) => (
        <textarea
          ref={ref}
          id={rest.id ?? id}
          className={`tb-field${mono ? ' tb-mono' : ''}`}
          aria-invalid={error ? true : undefined}
          spellCheck={false}
          style={{ fontSize: mono ? 13 : undefined, lineHeight: 1.6, resize: 'vertical', ...style }}
          {...rest}
        />
      )}
    </FieldWrapper>
  )
})

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  children: ReactNode
}

export function Select({ label, style, children, ...rest }: SelectProps) {
  return (
    <FieldWrapper label={label}>
      {(id) => (
        <select
          id={rest.id ?? id}
          className="tb-field"
          style={{ cursor: 'pointer', ...style }}
          {...rest}
        >
          {children}
        </select>
      )}
    </FieldWrapper>
  )
}

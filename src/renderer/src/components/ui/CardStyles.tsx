import React from 'react';
import { useThemeColors } from '@/lib/theme';

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ children, style, className, padding = 'md' }: CardProps) {
  const colors = useThemeColors();

  const paddingStyles: Record<string, string> = {
    sm: '12px',
    md: '16px',
    lg: '24px',
  };

  const baseStyle: React.CSSProperties = {
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    padding: paddingStyles[padding],
    ...style,
  };

  return (
    <div className={className} style={baseStyle}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function CardHeader({ children, style }: CardHeaderProps) {
  const colors = useThemeColors();

  const headerStyle: React.CSSProperties = {
    marginBottom: '16px',
    ...style,
  };

  return <div style={headerStyle}>{children}</div>;
}

interface CardTitleProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function CardTitle({ children, style }: CardTitleProps) {
  const colors = useThemeColors();

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 600,
    color: colors.text,
    margin: 0,
    ...style,
  };

  return <h3 style={titleStyle}>{children}</h3>;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function CardDescription({ children, style }: CardDescriptionProps) {
  const colors = useThemeColors();

  const descStyle: React.CSSProperties = {
    fontSize: '14px',
    color: colors.textSecondary,
    margin: 0,
    ...style,
  };

  return <p style={descStyle}>{children}</p>;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function CardContent({ children, style }: CardContentProps) {
  return <div style={style}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function CardFooter({ children, style }: CardFooterProps) {
  const footerStyle: React.CSSProperties = {
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    ...style,
  };

  return <div style={footerStyle}>{children}</div>;
}

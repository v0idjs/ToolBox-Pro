import { type JSX } from 'react'

export interface ToolModule {
  id: string
  name: string
  description: string
  icon: string
  category: string
  keywords: string[]
  render: () => JSX.Element
}

export type ToolCategory =
  | 'security'
  | 'developer'
  | 'text'
  | 'file'
  | 'image'
  | 'qr'
  | 'productivity'

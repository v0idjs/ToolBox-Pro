import { Shield, Code, FileText, Image, QrCode, Clock, type LucideIcon } from 'lucide-react'

export interface CategoryMeta {
  id: string
  name: string
  tag: string
  icon: LucideIcon
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'security', name: 'Security', tag: 'SEC', icon: Shield },
  { id: 'developer', name: 'Developer', tag: 'DEV', icon: Code },
  { id: 'file', name: 'Files', tag: 'FILE', icon: FileText },
  { id: 'image', name: 'Image', tag: 'IMG', icon: Image },
  { id: 'qr', name: 'QR & Barcode', tag: 'QR', icon: QrCode },
  { id: 'productivity', name: 'Productivity', tag: 'TIME', icon: Clock }
]

export function getCategory(categoryId: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.id === categoryId)
}

import {
  Shield,
  Code,
  FileText,
  Image,
  QrCode,
  Clock,
  Zap,
  HardDrive,
  type LucideIcon
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { useThemeColors } from '@/lib/theme'
import { getAllTools, getToolsByCategory } from '@/lib/tool-registry'

const categoryIcons: Record<string, LucideIcon> = {
  security: Shield,
  developer: Code,
  text: FileText,
  file: FileText,
  image: Image,
  qr: QrCode,
  productivity: Clock
}

const categoryLabels: Record<string, string> = {
  security: 'Security',
  developer: 'Developer Tools',
  text: 'Text Tools',
  file: 'File Tools',
  image: 'Image Tools',
  qr: 'QR & Barcode',
  productivity: 'Productivity'
}

interface ToolCardProps {
  icon: LucideIcon
  title: string
  description: string
  onClick?: () => void
}

function ToolCard({ icon: Icon, title, description, onClick }: ToolCardProps) {
  const colors = useThemeColors()
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 12,
        padding: 20,
        borderRadius: 12,
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.card,
        color: colors.text,
        textAlign: 'left',
        width: '100%',
        cursor: 'pointer'
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.accent,
          color: '#FFFFFF'
        }}
      >
        <Icon size={20} />
      </div>
      <div>
        <h3 style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>
          {title}
        </h3>
        <p style={{ fontSize: 12, marginTop: 4, color: colors.textSecondary }}>
          {description}
        </p>
      </div>
    </button>
  )
}

export function DashboardHome() {
  const { setActiveTool } = useAppStore()
  const colors = useThemeColors()

  const allTools = getAllTools()
  const totalTools = allTools.length
  const categoryIds = ['security', 'developer', 'text', 'file', 'image', 'qr', 'productivity']
  const categoryToolCounts = Object.fromEntries(
    categoryIds.map((catId) => [catId, getToolsByCategory(catId).length])
  )
  const categoryCount = Object.keys(categoryToolCounts).filter((k) => categoryToolCounts[k] > 0).length

  const stats = [
    { icon: Zap, label: 'Total Tools', value: String(totalTools) },
    { icon: HardDrive, label: 'Categories', value: String(categoryCount) },
    { icon: Shield, label: 'Local Processing', value: '100%' }
  ]

  const quickTools = [
    { icon: Shield, title: 'Password Generator', description: 'Generate secure passwords', id: 'password-generator' },
    { icon: QrCode, title: 'QR Generator', description: 'Create QR codes instantly', id: 'qr-generator' },
    { icon: Code, title: 'JSON Formatter', description: 'Beautify & validate JSON', id: 'json-formatter' },
    { icon: Code, title: 'UUID Generator', description: 'Generate unique identifiers', id: 'uuid-generator' },
    { icon: Clock, title: 'Timestamp Converter', description: 'Convert Unix timestamps', id: 'timestamp-converter' },
    { icon: Image, title: 'Image Converter', description: 'Convert between formats', id: 'image-converter' }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
          Welcome to ToolBox Pro
        </h1>
        <p style={{ marginTop: 4, fontSize: 14, color: colors.textSecondary }}>
          Your universal local productivity toolkit. All tools run 100% offline.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: 16,
              borderRadius: 12,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.card
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.accent,
                color: '#FFFFFF'
              }}
            >
              <stat.icon size={20} />
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
                {stat.value}
              </p>
              <p style={{ fontSize: 12, color: colors.textSecondary }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: colors.text }}>
          Quick Access
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {quickTools.map((tool) => (
            <ToolCard
              key={tool.id}
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
              onClick={() => setActiveTool(tool.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: colors.text }}>
          Categories
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {categoryIds.map((catId) => {
            const Icon = categoryIcons[catId]
            return (
              <ToolCard
                key={catId}
                icon={Icon}
                title={categoryLabels[catId]}
                description={`${categoryToolCounts[catId]} tools`}
                onClick={() => setActiveTool(catId)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

import type { ToolModule } from '@/types/tool'

const toolRegistry: Map<string, ToolModule> = new Map()

export function registerTool(tool: ToolModule): void {
  toolRegistry.set(tool.id, tool)
}

export function registerTools(tools: ToolModule[]): void {
  tools.forEach((tool) => toolRegistry.set(tool.id, tool))
}

export function getTool(id: string): ToolModule | undefined {
  return toolRegistry.get(id)
}

export function getAllTools(): ToolModule[] {
  return Array.from(toolRegistry.values())
}

export function getToolsByCategory(category: string): ToolModule[] {
  return getAllTools().filter((tool) => tool.category === category)
}

export function searchTools(query: string): ToolModule[] {
  const lower = query.toLowerCase()
  return getAllTools().filter(
    (tool) =>
      tool.name.toLowerCase().includes(lower) ||
      tool.description.toLowerCase().includes(lower) ||
      tool.category.toLowerCase().includes(lower) ||
      tool.keywords.some((kw) => kw.toLowerCase().includes(lower))
  )
}

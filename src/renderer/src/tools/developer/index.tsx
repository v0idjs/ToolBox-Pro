import { registerTools } from '@/lib/tool-registry'
import { JSONFormatter } from '@/tools/developer/JSONFormatter'
import { XMLFormatter } from '@/tools/developer/XMLFormatter'
import { YAMLFormatter } from '@/tools/developer/YAMLFormatter'
import { RegexTester } from '@/tools/developer/RegexTester'
import { URLEncoder } from '@/tools/developer/URLEncoder'
import { UUIDGenerator } from '@/tools/developer/UUIDGenerator'
import { TimestampConverter } from '@/tools/developer/TimestampConverter'
import { ColorConverter } from '@/tools/developer/ColorConverter'

export function registerDeveloperTools() {
  registerTools([
    {
      id: 'json-formatter',
      name: 'JSON Formatter',
      description: 'Beautify, minify, and validate JSON data',
      icon: 'Braces',
      category: 'developer',
      keywords: ['json', 'format', 'beautify', 'minify', 'validate'],
      render: () => <JSONFormatter />
    },
    {
      id: 'xml-formatter',
      name: 'XML Formatter',
      description: 'Beautify, minify, and validate XML documents',
      icon: 'Code',
      category: 'developer',
      keywords: ['xml', 'format', 'beautify', 'validate'],
      render: () => <XMLFormatter />
    },
    {
      id: 'yaml-formatter',
      name: 'YAML Formatter',
      description: 'Beautify, minify, and validate YAML files',
      icon: 'FileCode',
      category: 'developer',
      keywords: ['yaml', 'yml', 'format', 'beautify', 'validate'],
      render: () => <YAMLFormatter />
    },
    {
      id: 'regex-tester',
      name: 'Regex Tester',
      description: 'Test regular expressions with match highlighting',
      icon: 'Search',
      category: 'developer',
      keywords: ['regex', 'regular', 'expression', 'pattern', 'match'],
      render: () => <RegexTester />
    },
    {
      id: 'url-encoder',
      name: 'URL Encoder/Decoder',
      description: 'Encode and decode URLs and query parameters',
      icon: 'Link',
      category: 'developer',
      keywords: ['url', 'encode', 'decode', 'percent', 'query'],
      render: () => <URLEncoder />
    },
    {
      id: 'uuid-generator',
      name: 'UUID Generator',
      description: 'Generate UUID v4 identifiers in bulk',
      icon: 'Hash',
      category: 'developer',
      keywords: ['uuid', 'guid', 'generate', 'unique', 'identifier'],
      render: () => <UUIDGenerator />
    },
    {
      id: 'timestamp-converter',
      name: 'Timestamp Converter',
      description: 'Convert between Unix timestamps and human-readable dates',
      icon: 'Clock',
      category: 'developer',
      keywords: ['timestamp', 'unix', 'epoch', 'date', 'time', 'convert'],
      render: () => <TimestampConverter />
    },
    {
      id: 'color-converter',
      name: 'Color Converter',
      description: 'Convert between HEX, RGB, and HSL color formats',
      icon: 'Palette',
      category: 'developer',
      keywords: ['color', 'hex', 'rgb', 'hsl', 'convert', 'palette'],
      render: () => <ColorConverter />
    }
  ])
}

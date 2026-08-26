import { registerTools } from '@/lib/tool-registry'
import { JSONFormatter } from '@/tools/developer/JSONFormatter'
import { XMLFormatter } from '@/tools/developer/XMLFormatter'
import { YAMLFormatter } from '@/tools/developer/YAMLFormatter'
import { RegexTester } from '@/tools/developer/RegexTester'
import { URLEncoder } from '@/tools/developer/URLEncoder'
import { UUIDGenerator } from '@/tools/developer/UUIDGenerator'
import { TimestampConverter } from '@/tools/developer/TimestampConverter'
import { ColorConverter } from '@/tools/developer/ColorConverter'
import { JSONToCSVConverter } from '@/tools/developer/JSONToCSVConverter'
import { NumberBaseConverter } from '@/tools/developer/NumberBaseConverter'
import { CSSUnitConverter } from '@/tools/developer/CSSUnitConverter'
import { TextEncodingConverter } from '@/tools/developer/TextEncodingConverter'
import { SqlFormatter } from '@/tools/developer/SqlFormatter'

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
    },
    {
      id: 'json-csv-converter',
      name: 'JSON ↔ CSV Converter',
      description: 'Flatten nested JSON to CSV and parse CSV back to JSON',
      icon: 'ArrowLeftRight',
      category: 'developer',
      keywords: ['json', 'csv', 'convert', 'flatten', 'parse', 'table', 'data'],
      render: () => <JSONToCSVConverter />
    },
    {
      id: 'number-base-converter',
      name: 'Number Base Converter',
      description: 'Convert between binary, octal, decimal, hex, and custom bases',
      icon: 'ArrowUpDown',
      category: 'developer',
      keywords: ['number', 'base', 'binary', 'hex', 'decimal', 'octal', 'convert'],
      render: () => <NumberBaseConverter />
    },
    {
      id: 'css-unit-converter',
      name: 'CSS Unit Converter',
      description: 'Convert px, rem, em, vw with configurable base font size',
      icon: 'Ruler',
      category: 'developer',
      keywords: ['css', 'px', 'rem', 'em', 'vw', 'unit', 'convert', 'responsive'],
      render: () => <CSSUnitConverter />
    },
    {
      id: 'text-encoding-converter',
      name: 'Text Encoding Converter',
      description: 'Convert text and files between UTF-8, UTF-16, Windows-1252, and ASCII',
      icon: 'Languages',
      category: 'developer',
      keywords: ['encoding', 'utf', 'ascii', 'ansi', 'latin1', 'bom', 'charset', 'convert'],
      render: () => <TextEncodingConverter />
    },
    {
      id: 'sql-formatter',
      name: 'SQL Formatter',
      description: 'Beautify and minify SQL queries with dialect-aware keyword casing',
      icon: 'Database',
      category: 'developer',
      keywords: ['sql', 'format', 'beautify', 'minify', 'query', 'database'],
      render: () => <SqlFormatter />
    }
  ])
}

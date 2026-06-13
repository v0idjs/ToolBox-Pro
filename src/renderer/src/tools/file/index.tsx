import { registerTools } from '@/lib/tool-registry'
import { RemoveDuplicates } from '@/tools/file/RemoveDuplicates'
import { FileSplitter } from '@/tools/file/FileSplitter'
import { FileMerger } from '@/tools/file/FileMerger'
import { FolderSizeAnalyzer } from '@/tools/file/FolderSizeAnalyzer'
import { DuplicateFileFinder } from '@/tools/file/DuplicateFileFinder'

export function registerFileTools() {
  registerTools([
    {
      id: 'remove-duplicates',
      name: 'Remove Duplicate Lines',
      description: 'Remove duplicate lines from text, preserving first occurrence',
      icon: 'FileText',
      category: 'file',
      keywords: ['duplicate', 'lines', 'remove', 'deduplicate', 'text'],
      render: () => <RemoveDuplicates />
    },
    {
      id: 'file-splitter',
      name: 'File Splitter',
      description: 'Split large files into smaller chunks by line count or size',
      icon: 'Scissors',
      category: 'file',
      keywords: ['split', 'file', 'chunk', 'divide', 'large'],
      render: () => <FileSplitter />
    },
    {
      id: 'file-merger',
      name: 'File Merger',
      description: 'Merge multiple text files into one combined file',
      icon: 'GitMerge',
      category: 'file',
      keywords: ['merge', 'combine', 'join', 'concatenate', 'files'],
      render: () => <FileMerger />
    },
    {
      id: 'folder-size',
      name: 'Folder Size Analyzer',
      description: 'Analyze folder contents and show file sizes',
      icon: 'HardDrive',
      category: 'file',
      keywords: ['folder', 'size', 'analyze', 'disk', 'storage'],
      render: () => <FolderSizeAnalyzer />
    },
    {
      id: 'duplicate-finder',
      name: 'Duplicate File Finder',
      description: 'Find duplicate files by content hash in a directory',
      icon: 'Copy',
      category: 'file',
      keywords: ['duplicate', 'file', 'find', 'hash', 'md5'],
      render: () => <DuplicateFileFinder />
    }
  ])
}

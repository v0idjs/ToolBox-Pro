import { registerTools } from '@/lib/tool-registry'
import { RemoveDuplicates } from '@/tools/file/RemoveDuplicates'
import { FileSplitter } from '@/tools/file/FileSplitter'
import { FileMerger } from '@/tools/file/FileMerger'
import { FolderSizeAnalyzer } from '@/tools/file/FolderSizeAnalyzer'
import { DuplicateFileFinder } from '@/tools/file/DuplicateFileFinder'
import { BatchFileRename } from '@/tools/file/BatchFileRename'
import { FileChecksumVerifier } from '@/tools/file/FileChecksumVerifier'
import { PdfMergeSplit } from '@/tools/file/PdfMergeSplit'

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
      id: 'batch-rename',
      name: 'Batch File Rename',
      description: 'Rename multiple files with pattern matching, regex, numbering, and case changes',
      icon: 'FilePen',
      category: 'file',
      keywords: ['rename', 'batch', 'regex', 'pattern', 'files', 'multiple'],
      render: () => <BatchFileRename />
    },
    {
      id: 'file-checksum',
      name: 'File Checksum Verifier',
      description: 'Verify file integrity by comparing computed hash with expected checksum',
      icon: 'Shield',
      category: 'file',
      keywords: ['checksum', 'hash', 'md5', 'sha1', 'sha256', 'verify', 'integrity'],
      render: () => <FileChecksumVerifier />
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
    },
    {
      id: 'pdf-merge-split',
      name: 'PDF Merger & Splitter',
      description: 'Combine PDF files or extract and split pages into new documents',
      icon: 'FileStack',
      category: 'file',
      keywords: ['pdf', 'merge', 'split', 'extract', 'pages', 'combine'],
      render: () => <PdfMergeSplit />
    }
  ])
}

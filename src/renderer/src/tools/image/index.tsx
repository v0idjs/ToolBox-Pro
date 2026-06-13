import { registerTools } from '@/lib/tool-registry'
import { ImageConverter } from '@/tools/image/ImageConverter'
import { ImageCompressor } from '@/tools/image/ImageCompressor'
import { ImageResizer } from '@/tools/image/ImageResizer'
import { ImageMetadata } from '@/tools/image/ImageMetadata'
import { ColorPicker } from '@/tools/image/ColorPicker'

export function registerImageTools() {
  registerTools([
    {
      id: 'image-converter',
      name: 'Image Converter',
      description: 'Convert images between PNG, JPEG, WEBP, and BMP formats',
      icon: 'RefreshCw',
      category: 'image',
      keywords: ['image', 'convert', 'png', 'jpeg', 'webp', 'bmp', 'format'],
      render: () => <ImageConverter />
    },
    {
      id: 'image-compressor',
      name: 'Image Compressor',
      description: 'Reduce image file size with adjustable quality',
      icon: 'Minimize2',
      category: 'image',
      keywords: ['image', 'compress', 'reduce', 'size', 'quality'],
      render: () => <ImageCompressor />
    },
    {
      id: 'image-resizer',
      name: 'Image Resizer',
      description: 'Resize images to specific dimensions or percentages',
      icon: 'Maximize2',
      category: 'image',
      keywords: ['image', 'resize', 'scale', 'dimension', 'width', 'height'],
      render: () => <ImageResizer />
    },
    {
      id: 'image-metadata',
      name: 'Image Metadata Viewer',
      description: 'View EXIF data and image properties',
      icon: 'Info',
      category: 'image',
      keywords: ['image', 'metadata', 'exif', 'info', 'properties', 'camera'],
      render: () => <ImageMetadata />
    },
    {
      id: 'color-picker',
      name: 'Color Picker',
      description: 'Pick colors from images with HEX, RGB, and HSL values',
      icon: 'Palette',
      category: 'image',
      keywords: ['color', 'picker', 'eyedropper', 'sample', 'image', 'palette'],
      render: () => <ColorPicker />
    }
  ])
}

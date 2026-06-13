import { registerTools } from '@/lib/tool-registry'
import { QRGenerator } from '@/tools/qr/QRGenerator'
import { BarcodeGenerator } from '@/tools/qr/BarcodeGenerator'

export function registerQRTools() {
  registerTools([
    {
      id: 'qr-generator',
      name: 'QR Generator',
      description: 'Generate QR codes for text, URLs, and WiFi credentials',
      icon: 'QrCode',
      category: 'qr',
      keywords: ['qr', 'code', 'generate', 'scan', 'wifi', 'url'],
      render: () => <QRGenerator />
    },
    {
      id: 'barcode-generator',
      name: 'Barcode Generator',
      description: 'Generate CODE128, CODE39, and EAN-13 barcodes',
      icon: 'BarChart3',
      category: 'qr',
      keywords: ['barcode', 'code128', 'code39', 'ean13', 'generate'],
      render: () => <BarcodeGenerator />
    }
  ])
}

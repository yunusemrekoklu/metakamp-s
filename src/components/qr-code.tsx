'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QrCode, Download, Share2, Copy, Check, ArrowLeft } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

interface QRCodeComponentProps {
  onBack?: () => void
}

export function QRCodeComponent({ onBack }: QRCodeComponentProps) {
  const [qrUrl, setQrUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    // Mevcut URL'i al (localhost veya production)
    const currentUrl = typeof window !== 'undefined' ? window.location.origin : ''
    setQrUrl(currentUrl)
  }, [])

  // QR kodu oluştur (basit placeholder olarak)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meta Dijital Kampüs Macerası',
          text: 'En büyük projeyi yaratmak için Meta\'nın dijital macerasına katıl!',
          url: qrUrl
        })
      } catch (err) {
        console.log('Share cancelled or failed:', err)
      }
    } else {
      copyToClipboard()
    }
  }

  const downloadQR = () => {
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = 'meta-dijital-kampus-qr.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className={`${isMobile ? 'w-full max-w-sm' : 'w-full max-w-md'} mx-auto`}>
      <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
        {onBack && (
          <div className="flex justify-start mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </Button>
          </div>
        )}
        <div className="mb-4">
          <QrCode className={`mx-auto ${isMobile ? 'h-8 w-8' : 'h-12 w-12'} text-blue-600 mb-2`} />
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>
            Mobilde Oyna!
          </h3>
          <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600 mt-2`}>
            QR kodu okutarak oyununa mobil cihazından hızlıca eriş
          </p>
        </div>

        <div className="flex justify-center mb-4">
          <div className={`p-4 bg-white rounded-lg border-2 border-gray-300`}>
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className={`${isMobile ? 'w-32 h-32' : 'w-40 h-40'}`}
            />
          </div>
        </div>

        <div className={`space-y-2 ${isMobile ? 'text-sm' : ''}`}>
          <div className="text-left bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Oyun Linki:</p>
            <p className="text-xs text-gray-600 break-all font-mono">{qrUrl}</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={copyToClipboard}
              className="flex items-center gap-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Kopyalandı!' : 'Kopyala'}
            </Button>

            {isMobile ? (
              <Button
                variant="outline"
                size="sm"
                onClick={shareUrl}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Paylaş
              </Button>
            ) : (
              <Button
                variant="outline"
                size="default"
                onClick={downloadQR}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                İndir
              </Button>
            )}
          </div>
        </div>

        {isMobile && (
          <div className="mt-4 text-xs text-gray-500">
            <p>💡 İpucu: Bu sayfayı yer imlerine ekle!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
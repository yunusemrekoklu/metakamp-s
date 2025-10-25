'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QrCode, Shield } from 'lucide-react'

interface RegistrationFormProps {
  onSubmit: (userData: { email: string; username: string; wantsNewsletter: boolean }) => void
  onShowQRCode?: () => void
  onShowAdmin?: () => void
}

export function RegistrationForm({ onSubmit, onShowQRCode, onShowAdmin }: RegistrationFormProps) {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [wantsNewsletter, setWantsNewsletter] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !username) return

    setIsLoading(true)
    try {
      onSubmit({ email, username, wantsNewsletter })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">M</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Meta Dijital Kampüs Macerası</CardTitle>
          <CardDescription>
            Meta'nın Kampüs Macerası'na hoş geldin! En büyük projeyi yaratmak için medya araçlarını birleştir ve Meta'nın kodunu çöz!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta Adresi</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@universite.edu.tr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                type="text"
                placeholder="Liderlik sıralaması için"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="newsletter"
                checked={wantsNewsletter}
                onCheckedChange={(checked) => setWantsNewsletter(checked as boolean)}
              />
              <Label htmlFor="newsletter" className="text-sm">
                Meta Topluluğu'nun etkinlikleri ve duyuruları hakkında mail almak istiyorum.
              </Label>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Kayıt Yapılıyor...' : 'Oyuna Başla'}
            </Button>

            {onShowQRCode && (
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={onShowQRCode}
              >
                <QrCode className="h-4 w-4" />
                Mobil Erişim (QR Kod)
              </Button>
            )}

            {onShowAdmin && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onShowAdmin}
                className="w-full flex items-center gap-2 text-gray-500 hover:text-gray-300"
              >
                <Shield className="h-4 w-4" />
                Admin Panel
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
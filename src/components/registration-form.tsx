'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QrCode, Shield, User, LogIn, Eye, EyeOff } from 'lucide-react'

interface RegistrationFormProps {
  onSubmit: (userData: { email: string; username: string; password: string; wantsNewsletter: boolean }) => void
  onLogin?: (userData: { email: string; password: string }) => void
  onShowQRCode?: () => void
  onShowAdmin?: () => void
}

export function RegistrationForm({ onSubmit, onLogin, onShowQRCode, onShowAdmin }: RegistrationFormProps) {
  // Kayıt form state
  const [regEmail, setRegEmail] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [wantsNewsletter, setWantsNewsletter] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false)

  // Giriş form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register')
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regEmail || !regUsername || !regPassword || !regConfirmPassword) return

    // Şifre kontrolü
    if (regPassword.length < 6) {
      alert('Şifre en az 6 karakter olmalıdır')
      return
    }

    if (regPassword !== regConfirmPassword) {
      alert('Şifreler eşleşmiyor')
      return
    }

    setIsLoading(true)
    try {
      await onSubmit({ email: regEmail, username: regUsername, password: regPassword, wantsNewsletter })
      // Kayıt başarılı, form alanlarını temizle ve login tab'ına geç
      setRegEmail('')
      setRegUsername('')
      setRegPassword('')
      setRegConfirmPassword('')
      setWantsNewsletter(false)
      setRegistrationSuccess(true)
      setActiveTab('login')
      // Login email'ini kayıtlı email ile doldur
      setLoginEmail(regEmail)
      alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.')
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) return

    setIsLoading(true)
    try {
      if (onLogin) {
        onLogin({ email: loginEmail, password: loginPassword })
      }
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
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'register' | 'login')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="register" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Kayıt Ol
              </TabsTrigger>
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Giriş Yap
              </TabsTrigger>
            </TabsList>

            <TabsContent value="register">
              <form onSubmit={handleRegistration} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-email">E-posta Adresi</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="ornek@universite.edu.tr"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-username">Kullanıcı Adı</Label>
                  <Input
                    id="reg-username"
                    type="text"
                    placeholder="Liderlik sıralaması için"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Şifre</Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showRegPassword ? "text" : "password"}
                      placeholder="Güçlü bir şifre seçin (en az 6 karakter)"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                    >
                      {showRegPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm-password">Şifre Tekrar</Label>
                  <div className="relative">
                    <Input
                      id="reg-confirm-password"
                      type={showRegConfirmPassword ? "text" : "password"}
                      placeholder="Şifrenizi tekrar girin"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    >
                      {showRegConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
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
                  {isLoading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol ve Oyuna Başla'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="login">
              {registrationSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-green-800 text-sm text-center">
                    ✅ Kayıt başarılı! Şimdi giriş yapabilirsiniz.
                  </p>
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-posta Adresi</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="ornek@universite.edu.tr"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Şifre</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Şifrenizi girin"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap ve Devam Et'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {onShowQRCode && (
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2 mt-4"
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
              className="w-full flex items-center gap-2 text-gray-500 hover:text-gray-300 mt-2"
            >
              <Shield className="h-4 w-4" />
              Admin Panel
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
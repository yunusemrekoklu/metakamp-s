'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Mail, Trophy, Users, Trash2, RefreshCw, ArrowLeft } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

interface User {
  id: string
  email: string
  username: string
  wantsNewsletter: boolean
  createdAt: string
  scores: Array<{
    id: string
    score: number
    createdAt: string
  }>
}

interface AdminPanelProps {
  onBack: () => void
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [resetLoading, setResetLoading] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')
  const isMobile = useIsMobile()

  const ADMIN_PASSWORD = 'meta123456' // Basit bir admin şifresi

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers()
    }
  }, [isAuthenticated])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        console.error('Failed to fetch admin data')
      }
    } catch (error) {
      console.error('Admin fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setAuthError('')
    } else {
      setAuthError('Yanlış şifre!')
    }
  }

  const handleResetData = async () => {
    if (!confirm('Tüm kullanıcı ve skor verileri silinecek. Emin misiniz?')) {
      return
    }

    setResetLoading(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Tüm veriler başarıyla sıfırlandı!')
        setUsers([])
      } else {
        alert('Sıfırlama işlemi başarısız!')
      }
    } catch (error) {
      console.error('Reset error:', error)
      alert('Sıfırlama işlemi başarısız!')
    } finally {
      setResetLoading(false)
    }
  }

  const getTotalScore = (user: User) => {
    return user.scores.reduce((total, score) => total + score.score, 0)
  }

  const getHighestScore = (user: User) => {
    return user.scores.length > 0 ? Math.max(...user.scores.map(s => s.score)) : 0
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 flex items-center justify-center">
        <Card className={`${isMobile ? 'w-full max-w-sm' : 'w-full max-w-md'}`}>
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="text-center mb-6">
              <Shield className={`mx-auto ${isMobile ? 'h-12 w-12' : 'h-16 w-16'} text-purple-600 mb-4`} />
              <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-2`}>Admin Panel</h2>
              <p className="text-gray-300 text-sm">Yönetici paneline erişmek için şifre girin</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Admin Şifresi</Label>
                <Input
                  id="password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Şifrenizi girin"
                  required
                />
              </div>

              {authError && (
                <div className="text-red-500 text-sm text-center">{authError}</div>
              )}

              <Button type="submit" className="w-full">
                Giriş Yap
              </Button>
            </form>

            <Button
              variant="outline"
              onClick={onBack}
              className="w-full mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className={`${isMobile ? 'w-full' : 'max-w-7xl mx-auto'}`}>
        {/* Header */}
        <Card className="mb-6">
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} text-purple-600`} />
                <div>
                  <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white`}>Admin Panel</h1>
                  <p className="text-gray-300 text-sm">Meta Dijital Kampüs Yönetimi</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={fetchUsers}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Yenile
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleResetData}
                  disabled={resetLoading}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {resetLoading ? 'Sıfırlanıyor...' : 'Verileri Sıfırla'}
                </Button>
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Geri
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
              <Users className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} text-blue-600 mx-auto mb-2`} />
              <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-white`}>{users.length}</p>
              <p className="text-gray-300">Toplam Kullanıcı</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
              <Trophy className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} text-yellow-600 mx-auto mb-2`} />
              <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-white`}>
                {users.reduce((total, user) => total + user.scores.length, 0)}
              </p>
              <p className="text-gray-300">Toplam Oyun</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
              <Mail className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} text-green-600 mx-auto mb-2`} />
              <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-white`}>
                {users.filter(user => user.wantsNewsletter).length}
              </p>
              <p className="text-gray-300">Bülten Abonesi</p>
            </CardContent>
          </Card>
        </div>

        {/* Kullanıcı Listesi */}
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Kullanıcı Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left p-3 text-gray-300">Kullanıcı Adı</th>
                    <th className="text-left p-3 text-gray-300">E-posta</th>
                    <th className="text-center p-3 text-gray-300">En Yüksek Skor</th>
                    <th className="text-center p-3 text-gray-300">Toplam Skor</th>
                    <th className="text-center p-3 text-gray-300">Oyun Sayısı</th>
                    <th className="text-center p-3 text-gray-300">Bülten</th>
                    <th className="text-left p-3 text-gray-300">Kayıt Tarihi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                      <td className="p-3 text-white font-medium">{user.username}</td>
                      <td className="p-3 text-gray-300">{user.email}</td>
                      <td className="p-3 text-center">
                        <Badge variant="default" className="bg-yellow-600">
                          {getHighestScore(user)}
                        </Badge>
                      </td>
                      <td className="p-3 text-center text-white font-bold">
                        {getTotalScore(user)}
                      </td>
                      <td className="p-3 text-center text-white">
                        {user.scores.length}
                      </td>
                      <td className="p-3 text-center">
                        {user.wantsNewsletter ? (
                          <Badge variant="default" className="bg-green-600">Evet</Badge>
                        ) : (
                          <Badge variant="outline">Hayır</Badge>
                        )}
                      </td>
                      <td className="p-3 text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">Henüz kullanıcı kaydı bulunmuyor.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
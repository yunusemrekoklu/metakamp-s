'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Medal, Award, QrCode } from 'lucide-react'

interface LeaderboardEntry {
  id: string
  username: string
  score: number
  createdAt: string
}

interface LeaderboardProps {
  currentUserScore?: number
  onPlayAgain?: () => void
  onShowQRCode?: () => void
}

export function Leaderboard({ currentUserScore, onPlayAgain, onShowQRCode }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/scores/leaderboard')
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold">{rank}</span>
    }
  }

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default"
      case 2:
        return "secondary"
      case 3:
        return "outline"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Liderlik tablosu yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white">
              🏆 Meta Dijital Kampüs Liderlik Tablosu
            </CardTitle>
            <p className="text-gray-300">
              En büyük projeyi yaratan kampüs şampiyonları
            </p>
          </CardHeader>
        </Card>

        {currentUserScore !== undefined && (
          <Card className="mb-6 border-2 border-yellow-400">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Senin Skorun</h3>
                <p className="text-3xl font-bold text-yellow-400">{currentUserScore}</p>
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                {onPlayAgain && (
                  <Button
                    onClick={onPlayAgain}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Tekrar Oyna
                  </Button>
                )}
                {onShowQRCode && (
                  <Button
                    variant="outline"
                    onClick={onShowQRCode}
                    className="flex items-center gap-2"
                  >
                    <QrCode className="h-4 w-4" />
                    Mobil Erişim
                  </Button>
                )}
              </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">En İyi 10 Oyuncu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index < 3 
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankIcon(index + 1)}
                    </div>
                    <div>
                      <p className="font-semibold">{entry.username}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(entry.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getRankBadgeVariant(index + 1)} className="text-lg px-3 py-1">
                      {entry.score} puan
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Henüz skor bulunmuyor.</p>
                <p className="text-sm text-gray-400">İlk oynayan sen ol!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={fetchLeaderboard}
            className="text-white border-white hover:bg-white hover:text-gray-900"
          >
            Tabloyu Yenile
          </Button>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { RegistrationForm } from '@/components/registration-form'
import { GameEngine } from '@/components/game-engine'
import { Leaderboard } from '@/components/leaderboard'
import { QRCodeComponent } from '@/components/qr-code'
import { AdminPanel } from '@/components/admin-panel'

interface User {
  id: string
  email: string
  username: string
  wantsNewsletter: boolean
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [gameState, setGameState] = useState<'registration' | 'game' | 'leaderboard' | 'qrcode' | 'admin'>('registration')
  const [finalScore, setFinalScore] = useState<number | null>(null)

  // URL hash'i dinle
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setGameState('admin')
        window.location.hash = ''
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleRegistration = async (userData: { email: string; username: string; password: string; wantsNewsletter: boolean }) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
        setGameState('game')
      } else {
        const error = await response.json()
        alert(error.error || 'Kayıt başarısız')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('Kayıt sırasında bir hata oluştu')
    }
  }

  const handleLogin = async (userData: { email: string; password: string }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
        setGameState('game')
      } else {
        const error = await response.json()
        alert(error.error || 'Giriş başarısız')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Giriş sırasında bir hata oluştu')
    }
  }

  const handleGameOver = async (score: number) => {
    if (currentUser) {
      try {
        const response = await fetch('/api/scores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser.id,
            score
          }),
        })

        if (response.ok) {
          console.log('Score saved successfully')
        } else {
          console.error('Failed to save score')
        }
      } catch (error) {
        console.error('Score save error:', error)
      }
    }

    setFinalScore(score)
    setGameState('leaderboard')
  }

  const handlePlayAgain = () => {
    setFinalScore(null)
    setGameState('game')
  }

  const handleShowQRCode = () => {
    setGameState('qrcode')
  }

  const handleBackToGame = () => {
    setGameState('game')
  }

  const renderContent = () => {
    switch (gameState) {
      case 'registration':
        return <RegistrationForm onSubmit={handleRegistration} onLogin={handleLogin} onShowQRCode={handleShowQRCode} onShowAdmin={() => setGameState('admin')} />

      case 'game':
        return currentUser ? (
          <GameEngine
            username={currentUser.username}
            onGameOver={handleGameOver}
            onShowQRCode={handleShowQRCode}
          />
        ) : null

      case 'leaderboard':
        return (
          <Leaderboard
            currentUserScore={finalScore || undefined}
            onPlayAgain={handlePlayAgain}
            onShowQRCode={handleShowQRCode}
          />
        )

      case 'qrcode':
        return <QRCodeComponent onBack={() => setGameState(currentUser ? 'game' : 'registration')} />

      case 'admin':
        return <AdminPanel onBack={() => setGameState('registration')} />

      default:
        return <RegistrationForm onSubmit={handleRegistration} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {renderContent()}
    </div>
  )
}
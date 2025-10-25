'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Volume2, VolumeX, QrCode, X } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

// Meta ikonları ve seviyeleri - PNG yollarıyla
const META_ICONS = [
  { level: 1, name: 'Mikrofon', png: '/icons/microphone.png', score: 1, color: '#10b981' },
  { level: 2, name: 'Fotoğraf Makinesi', png: '/icons/camera.png', score: 3, color: '#3b82f6' },
  { level: 3, name: 'Kalem', png: '/icons/pen.png', score: 6, color: '#f59e0b' },
  { level: 4, name: 'Sosyal Medya', png: '/icons/social.png', score: 10, color: '#8b5cf6' },
  { level: 5, name: 'Logo', png: '/icons/logo.png', score: 15, color: '#ef4444' },
  { level: 6, name: 'Proje Klasörü', png: '/icons/folder.png', score: 21, color: '#06b6d4' },
  { level: 7, name: 'Meta Sembolü', png: '/icons/meta.png', score: 28, color: '#f97316' },
  { level: 8, name: 'Bilgisayar', png: '/icons/computer.png', score: 36, color: '#0891b2' },
  { level: 9, name: 'Beğeni', png: '/icons/like.png', score: 45, color: '#ec4899' },
  { level: 10, name: 'Kahve', png: '/icons/coffee.png', score: 55, color: '#9333ea' }
]

interface GameObject {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  level: number
  radius: number
  icon: typeof META_ICONS[0]
  image?: HTMLImageElement
}

interface QuizQuestion {
  question: string
  options: string[]
  correct: number
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Meta Topluluğu'nun ana amacı nedir?",
    options: ["Sadece sosyal medya yönetimi", "Medya ve tanıtım çalışmaları", "Yazılım geliştirme", "Spor etkinlikleri"],
    correct: 1
  },
  {
    question: "Hangisi Meta'nın temsil ettiği alanlardan biri değildir?",
    options: ["Podcast", "Görsel medya", "İçerik yazarlığı", "Finansal danışmanlık"],
    correct: 3
  },
  {
    question: "En yüksek puanlı ikon hangisidir?",
    options: ["Mikrofon", "Sosyal Medya", "Meta Sembolü", "Proje Klasörü"],
    correct: 2
  },
  {
    question: "Kaç puanlık ikon birleştiğinde quiz çıkar?",
    options: ["5 puan", "10 puan", "15 puan", "20 puan"],
    correct: 1
  },
  {
    question: "Meta Dijital Kampüs Macerası'nda ne amaçlanır?",
    options: ["En yüksek skoru yapmak", "En büyük projeyi yaratmak", "Tüm ikonları toplamak", "Süreyi bitirmek"],
    correct: 1
  }
]

interface GameEngineProps {
  username: string
  onGameOver: (score: number) => void
  onShowQRCode?: () => void
}

export function GameEngine({ username, onGameOver, onShowQRCode }: GameEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [gameObjects, setGameObjects] = useState<GameObject[]>([])
  const [nextIcon, setNextIcon] = useState(META_ICONS[0])
  const [isGameOver, setIsGameOver] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null)
  const [pendingScore, setPendingScore] = useState(0)
  const [canDrop, setCanDrop] = useState(true)
  const [isDropping, setIsDropping] = useState(false)
  const [mergeCount, setMergeCount] = useState(0) // Birleşme sayısını takip et
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map())
  const [soundEnabled, setSoundEnabled] = useState(true)

  const isMobile = useIsMobile()
  const animationRef = useRef<number>()
  const dropLineRef = useRef(150)

  // Ses efektleri için ref'ler
  const dropSoundRef = useRef<HTMLAudioElement>()
  const mergeSoundRef = useRef<HTMLAudioElement>()
  const gameOverSoundRef = useRef<HTMLAudioElement>()

  // Canvas boyutlarını dinamik ayarla
  const getCanvasDimensions = useCallback(() => {
    if (isMobile) {
      const width = Math.min(window.innerWidth - 32, 360)
      const height = Math.min(window.innerHeight - 300, 500)
      return { width, height }
    }
    return { width: 400, height: 600 }
  }, [isMobile])

  const [canvasDimensions, setCanvasDimensions] = useState(getCanvasDimensions())

  useEffect(() => {
    const handleResize = () => {
      setCanvasDimensions(getCanvasDimensions())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [getCanvasDimensions])

  const GRAVITY = 0.5
  const DAMPING = 0.8
  const MERGE_THRESHOLD = 5

  // Ses ve resimleri önceden yükle
  useEffect(() => {
    const loadAssets = async () => {
      // Resimleri yükle
      const imageMap = new Map<string, HTMLImageElement>()

      for (const icon of META_ICONS) {
        const img = new Image()

        // CORS sorunları için crossOrigin ayarı
        img.crossOrigin = 'anonymous'
        img.src = icon.png

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            console.warn(`Timeout loading image: ${icon.png}`)
            resolve()
          }, 5000) // 5 saniye timeout

          img.onload = () => {
            clearTimeout(timeout)
            console.log(`Successfully loaded: ${icon.png}`)
            resolve()
          }

          img.onerror = (error) => {
            clearTimeout(timeout)
            console.warn(`Failed to load image: ${icon.png}`, error)
            // Hata olsa da devam et, emoji ile fallback yapılacak
            resolve()
          }
        })

        // Resim başarılı şekilde yüklendiyse ekle
        if (img.complete && img.naturalWidth > 0) {
          imageMap.set(icon.png, img)
        }
      }

      // Ses dosyalarını yükle
      const dropSound = new Audio('/sounds/drop.mp3')
      const mergeSound = new Audio('/sounds/merge.mp3')
      const gameOverSound = new Audio('/sounds/game-over.mp3')

      dropSound.volume = 0.5
      mergeSound.volume = 0.6
      gameOverSound.volume = 0.7

      dropSoundRef.current = dropSound
      mergeSoundRef.current = mergeSound
      gameOverSoundRef.current = gameOverSound

      setLoadedImages(imageMap)
      setImagesLoaded(true)
      console.log(`Loaded ${imageMap.size}/${META_ICONS.length} images`)
    }

    loadAssets()
  }, [])

  // Ses çalma fonksiyonu
  const playSound = (soundType: 'drop' | 'merge' | 'gameOver') => {
    if (!soundEnabled) return

    try {
      const sound = soundType === 'drop' ? dropSoundRef.current :
                   soundType === 'merge' ? mergeSoundRef.current :
                   gameOverSoundRef.current

      if (sound) {
        sound.currentTime = 0
        sound.play().catch(e => console.log('Ses çalınamadı:', e))
      }
    } catch (error) {
      console.log('Ses hatası:', error)
    }
  }

  const getRadiusByLevel = (level: number) => {
    return 20 + level * 8
  }

  const checkCollision = (obj1: GameObject, obj2: GameObject) => {
    const dx = obj1.x - obj2.x
    const dy = obj1.y - obj2.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance < obj1.radius + obj2.radius
  }

  const mergeObjects = (obj1: GameObject, obj2: GameObject) => {
    if (obj1.level === obj2.level && obj1.level < META_ICONS.length) {
      const newLevel = obj1.level + 1
      const newIcon = META_ICONS[newLevel - 1]
      const mergedObject: GameObject = {
        id: Math.random().toString(36).substr(2, 9),
        x: (obj1.x + obj2.x) / 2,
        y: (obj1.y + obj2.y) / 2,
        vx: (obj1.vx + obj2.vx) / 2,
        vy: (obj1.vy + obj2.vy) / 2,
        level: newLevel,
        radius: getRadiusByLevel(newLevel),
        icon: newIcon,
        image: loadedImages.get(newIcon.png)
      }

      // Her birleşme için sayacı artır
      setMergeCount(prev => prev + 1)
      setScore(prev => prev + newIcon.score)
      playSound('merge')

      // 10-20 birleşme arası rastgele quiz çıkar
      if (mergeCount > 0 && mergeCount % Math.floor(Math.random() * 11 + 10) === 0) {
        // Quiz çıkar ama oyunu durdurma
        setPendingScore(newIcon.score * 2) // Quiz bonusu
        setCurrentQuiz(QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)])
        setShowQuiz(true)
        // setCanDrop(false) // Bu satırı kaldır - oyun devam etsin
      }

      return mergedObject
    }
    return null
  }

  const handleQuizAnswer = (answerIndex: number) => {
    if (currentQuiz) {
      if (answerIndex === currentQuiz.correct) {
        setScore(prev => prev + pendingScore * 2)
        playSound('merge') // Doğru cevap sesi
      } else {
        playSound('drop') // Yanlış cevap sesi
      }
    }

    // Quiz'i kapat - oyunu durdurma
    setShowQuiz(false)
    setCurrentQuiz(null)
    setPendingScore(0)
    // setCanDrop(true) gerek yok - oyun zaten devam ediyor
  }

  const dropObject = useCallback((clientX: number, clientY?: number) => {
    if (isGameOver || !imagesLoaded || isDropping) return // canDrop kaldırıldı

    setIsDropping(true) // Düşme işlemi başladı

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const { width, height } = canvasDimensions
    const radius = getRadiusByLevel(nextIcon.level)
    const clampedX = Math.max(radius, Math.min(width - radius, x))

    const dropY = isMobile ? height * 0.15 : dropLineRef.current

    const newObject: GameObject = {
      id: Math.random().toString(36).substr(2, 9),
      x: clampedX,
      y: dropY,
      vx: 0,
      vy: 0,
      level: nextIcon.level,
      radius: getRadiusByLevel(nextIcon.level),
      icon: nextIcon,
      image: loadedImages.get(nextIcon.png)
    }

    setGameObjects(prev => [...prev, newObject])
    setNextIcon(META_ICONS[Math.floor(Math.random() * 3)]) // Sadece ilk 3 seviyeden düşür
    playSound('drop')

    // 300ms sonra yeni obje düşmesine izin ver
    setTimeout(() => {
      setIsDropping(false)
    }, 300)
  }, [nextIcon, isGameOver, imagesLoaded, loadedImages, canvasDimensions, isMobile, isDropping]) // canDrop kaldırıldı

  const updatePhysics = useCallback(() => {
    if (isGameOver) return // Sadece oyun bittiğinde durdur
    const { width, height } = canvasDimensions
    const dangerZoneY = isMobile ? height * 0.1 : dropLineRef.current

    setGameObjects(prev => {
      let updated = [...prev]
      const toRemove = new Set<string>()
      const toAdd: GameObject[] = []

      // Fizik güncellemeleri
      updated = updated.map(obj => {
        let newY = obj.y + obj.vy
        let newVy = obj.vy + GRAVITY

        // Zemin çarpışması
        if (newY + obj.radius > height) {
          newY = height - obj.radius
          newVy = -newVy * DAMPING
        }

        // Duvar çarpışmaları
        let newX = obj.x + obj.vx
        let newVx = obj.vx * 0.99 // Sürtünme

        if (newX - obj.radius < 0) {
          newX = obj.radius
          newVx = -newVx * DAMPING
        }
        if (newX + obj.radius > width) {
          newX = width - obj.radius
          newVx = -newVx * DAMPING
        }

        return {
          ...obj,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy
        }
      })

      // Çarpışma ve birleşme kontrolü
      for (let i = 0; i < updated.length; i++) {
        for (let j = i + 1; j < updated.length; j++) {
          if (!toRemove.has(updated[i].id) && !toRemove.has(updated[j].id)) {
            if (checkCollision(updated[i], updated[j])) {
              const merged = mergeObjects(updated[i], updated[j])
              if (merged) {
                toRemove.add(updated[i].id)
                toRemove.add(updated[j].id)
                toAdd.push(merged)
              } else {
                // Çarpışma fizik
                const dx = updated[j].x - updated[i].x
                const dy = updated[j].y - updated[i].y
                const distance = Math.sqrt(dx * dx + dy * dy)
                const overlap = updated[i].radius + updated[j].radius - distance
                
                if (distance > 0) {
                  const separationX = (dx / distance) * overlap * 0.5
                  const separationY = (dy / distance) * overlap * 0.5
                  
                  updated[i].x -= separationX
                  updated[i].y -= separationY
                  updated[j].x += separationX
                  updated[j].y += separationY
                  
                  const tempVx = updated[i].vx
                  const tempVy = updated[i].vy
                  updated[i].vx = updated[j].vx * DAMPING
                  updated[i].vy = updated[j].vy * DAMPING
                  updated[j].vx = tempVx * DAMPING
                  updated[j].vy = tempVy * DAMPING
                }
              }
            }
          }
        }
      }

      // Oyun sonu kontrolü
      const hasOverflow = updated.some(obj => obj.y - obj.radius < dangerZoneY && Math.abs(obj.vy) < 0.1)
      if (hasOverflow) {
        setIsGameOver(true)
        playSound('gameOver')
        onGameOver(score)
      }

      return [...updated.filter(obj => !toRemove.has(obj.id)), ...toAdd]
    })
  }, [isGameOver, score, onGameOver, canvasDimensions, isMobile])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width, height } = canvasDimensions
    const dangerZoneY = isMobile ? height * 0.1 : dropLineRef.current

    // Temizle
    ctx.clearRect(0, 0, width, height)

    // Arka plan
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, width, height)

    // Bırakma çizgisi
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(0, dangerZoneY)
    ctx.lineTo(width, dangerZoneY)
    ctx.stroke()
    ctx.setLineDash([])

    // Tehlike alanı
    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)'
    ctx.fillRect(0, 0, width, dangerZoneY)

    // Oyun nesneleri
    gameObjects.forEach(obj => {
      // Gölge
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.beginPath()
      ctx.ellipse(obj.x, obj.y + 5, obj.radius * 0.8, obj.radius * 0.3, 0, 0, Math.PI * 2)
      ctx.fill()

      // Ana daire
      ctx.fillStyle = obj.icon.color
      ctx.beginPath()
      ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2)
      ctx.fill()

      // PNG resmi çiz
      const loadedImage = loadedImages.get(obj.icon.png)
      if (loadedImage && loadedImage.complete && loadedImage.naturalWidth > 0) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(obj.x, obj.y, obj.radius * 0.8, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(loadedImage, obj.x - obj.radius * 0.8, obj.y - obj.radius * 0.8, obj.radius * 1.6, obj.radius * 1.6)
        ctx.restore()
      } else {
        // Yedek olarak emoji veya metin
        ctx.fillStyle = 'white'
        ctx.font = `bold ${obj.radius * 0.8}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // İkonlara özel emoji'ler
        const iconEmojis: { [key: string]: string } = {
          'Mikrofon': '🎤',
          'Fotoğraf Makinesi': '📷',
          'Kalem': '✏️',
          'Sosyal Medya': '💬',
          'Logo': '🎨',
          'Proje Klasörü': '📁',
          'Meta Sembolü': '🔷',
          'Bilgisayar': '💻',
          'Beğeni': '❤️',
          'Kahve': '☕'
        }

        const emoji = iconEmojis[obj.icon.name] || obj.icon.name.charAt(0)
        ctx.fillText(emoji, obj.x, obj.y)
      }
    })
  }, [gameObjects, canvasDimensions, isMobile])

  const gameLoop = useCallback(() => {
    updatePhysics()
    draw()
    animationRef.current = requestAnimationFrame(gameLoop)
  }, [updatePhysics, draw])

  useEffect(() => {
    if (imagesLoaded) {
      animationRef.current = requestAnimationFrame(gameLoop)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameLoop, imagesLoaded])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    dropObject(e.clientX, e.clientY)
  }

  const handleTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const touch = e.touches[0]
    dropObject(touch.clientX, touch.clientY)
  }

  if (!imagesLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Oyun yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className={`${isMobile ? 'p-2' : 'p-4'}`}>
          <div className={`flex justify-between items-center mb-4 ${isMobile ? 'text-sm' : ''}`}>
            <div>
              <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>Oyuncu: {username}</h2>
              <p className={`${isMobile ? 'text-base' : 'text-lg'}`}>Skor: <span className="font-bold text-blue-600">{score}</span></p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-center">
                <p className={`text-xs text-gray-600 ${isMobile ? 'hidden sm:block' : ''}`}>Sıradaki İkon</p>
                <div className={`bg-gray-200 rounded-full flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}>
                  {loadedImages.get(nextIcon.png) ? (
                    <img
                      src={nextIcon.png}
                      alt={nextIcon.name}
                      className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} object-contain`}
                    />
                  ) : (
                    <span className={`${isMobile ? 'text-xs' : 'text-base'}`}>{nextIcon.name.charAt(0)}</span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              {onShowQRCode && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onShowQRCode}
                  className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`}
                  title="QR Kod ile Mobil Erişim"
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="relative">
            <canvas
              ref={canvasRef}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              className={`border-2 border-gray-300 rounded-lg cursor-pointer mx-auto ${isMobile ? 'max-w-full' : ''}`}
              onClick={handleCanvasClick}
              onTouchStart={handleTouch}
            />
            
            {isGameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="text-center text-white p-4">
                  <h3 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold mb-2`}>Oyun Bitti!</h3>
                  <p className={`${isMobile ? 'text-lg' : 'text-xl'} mb-4`}>Final Skor: {score}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    className={isMobile ? 'px-4 py-2' : ''}
                  >
                    Tekrar Oyna
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className={`mt-4 text-center text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            <p>Kutuyu doldurmadan ikonları birleştir!</p>
            <p>Kırmızı çizgiyi geçme!</p>
            {isMobile && (
              <p className="font-semibold mt-2">Dokunmatik ekran için optimize edilmiş</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quiz Popup */}
      {showQuiz && currentQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
            <CardContent className={`${isMobile ? 'p-4' : 'p-6'} relative`}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuizAnswer(-1)} // -1 = kapat/yanlış cevap
                className="absolute top-2 right-2"
                title="Kapat"
              >
                <X className="h-4 w-4" />
              </Button>

              <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-4`}>Meta'nın Kodunu Çöz!</h3>
              <p className={`${isMobile ? 'text-sm mb-4' : 'mb-6'}`}>{currentQuiz.question}</p>
              <div className="space-y-2">
                {currentQuiz.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={`w-full text-left justify-start ${isMobile ? 'text-sm py-2' : ''}`}
                    onClick={() => handleQuizAnswer(index)}
                    onMouseEnter={() => playSound('drop')} // Hover sesi
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 mt-4`}>
                Doğru cevap: {pendingScore * 2} puan!
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
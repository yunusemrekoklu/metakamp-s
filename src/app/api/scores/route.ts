
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId, score } = await request.json()

    if (!userId || score === undefined) {
      return NextResponse.json(
        { error: 'Kullanıcı ID ve skor zorunludur' },
        { status: 400 }
      )
    }

    // Skor kontrolü
    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { error: 'Geçerli bir skor girin' },
        { status: 400 }
      )
    }

    // Kullanıcının varlığını kontrol et
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Yeni skor oluştur
    const newScore = await db.score.create({
      data: {
        userId,
        score
      },
      include: {
        user: {
          select: {
            username: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      score: {
        id: newScore.id,
        score: newScore.score,
        username: newScore.user.username,
        createdAt: newScore.createdAt
      }
    })

  } catch (error) {
    console.error('Score creation error:', error)
    return NextResponse.json(
      { error: 'Skor kaydedilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const scores = await db.score.findMany({
      include: {
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        score: 'desc'
      }
    })

    return NextResponse.json(scores)

  } catch (error) {
    console.error('Scores fetch error:', error)
    return NextResponse.json(
      { error: 'Skorlar getirilemedi' },
      { status: 500 }
    )
  }
}
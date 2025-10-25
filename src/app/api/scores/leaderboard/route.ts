import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const leaderboard = await db.score.findMany({
      select: {
        id: true,
        score: true,
        createdAt: true,
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        score: 'desc'
      },
      take: 10 // Sadece ilk 10
    })

    // Format the response
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      id: entry.id,
      username: entry.user.username,
      score: entry.score,
      createdAt: entry.createdAt.toISOString()
    }))

    return NextResponse.json(formattedLeaderboard)

  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json(
      { error: 'Liderlik tablosu getirilemedi' },
      { status: 500 }
    )
  }
}
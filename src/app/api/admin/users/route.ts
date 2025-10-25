import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        scores: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Son 5 skor
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    // Tüm skorları ve kullanıcıları sil
    await prisma.score.deleteMany({})
    await prisma.user.deleteMany({})

    return NextResponse.json({ message: 'Tüm veriler başarıyla sıfırlandı' })
  } catch (error) {
    console.error('Admin reset error:', error)
    return NextResponse.json({ error: 'Sıfırlama işlemi başarısız' }, { status: 500 })
  }
}
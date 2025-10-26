// API route disabled for static export
export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, username, password, wantsNewsletter } = await request.json()

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'E-posta, kullanıcı adı ve şifre zorunludur' },
        { status: 400 }
      )
    }

    // E-posta formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      )
    }

    // Kullanıcı adı kontrolü
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: 'Kullanıcı adı 3-20 karakter arasında olmalıdır' },
        { status: 400 }
      )
    }

    // Şifre kontrolü
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      )
    }

    // Benzer kullanıcı adı kontrolü
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'Bu e-posta adresi zaten kayıtlı' },
          { status: 409 }
        )
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: 'Bu kullanıcı adı zaten kullanılıyor' },
          { status: 409 }
        )
      }
    }

    // Yeni kullanıcı oluştur
    const user = await db.user.create({
      data: {
        email,
        username,
        password, // Not: Gerçek uygulamada hash'lenmiş şifre saklanmalı
        wantsNewsletter: wantsNewsletter || false
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        wantsNewsletter: user.wantsNewsletter
      }
    })

  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        wantsNewsletter: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)

  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { error: 'Kullanıcılar getirilemedi' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-posta ve şifre gereklidir' },
        { status: 400 }
      )
    }

    // Kullanıcıyı e-posta ile bul
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase()
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Basit şifre kontrolü (gerçek uygulamada hash ile karşılaştırma yapılmalı)
    // Not: Bu sadece demo amaçlıdır, production'da güvenli şifre hashleme kullanın
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Şifre hatalı' },
        { status: 401 }
      )
    }

    // Şifre bilgisini user objesinden çıkar
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Giriş başarılı',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Giriş sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}
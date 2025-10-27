import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcrypt'

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
    const user = await db.user.findUnique({
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

    // Güvenli şifre kontrolü - bcrypt ile hash karşılaştırma
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
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
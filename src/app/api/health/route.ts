
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Veritabanı bağlantısını test et
    await db.$connect();

    // Basit bir sorgu çalıştırarak bağlantıyı doğrula
    const result = await db.$executeRaw`SELECT 1 as test`;

    return Response.json({
      message: "API healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
      status: "ok"
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return Response.json({
      message: "API unhealthy",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
      status: "error"
    }, { status: 503 });
  } finally {
    await db.$disconnect();
  }
}
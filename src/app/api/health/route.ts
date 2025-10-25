// API route disabled for static export
export const dynamic = 'force-static';

export async function GET() {
  return Response.json({ message: "API disabled" });
}
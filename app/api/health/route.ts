import { NextResponse } from 'next/server'
export const runtime = 'edge'

export async function GET() {
  return NextResponse.json({ 
    app:'NavSphere',
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
}
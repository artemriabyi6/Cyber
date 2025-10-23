// app/api/coach-notes/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    const coachNotes = await prisma.coachNote.findMany({
      take: 5
    })

    return NextResponse.json(coachNotes)
  } catch (error) {
    console.error('Помилка завантаження нотаток:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}
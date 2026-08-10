import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Сторінку не знайдено — Rodonit Agro',
}

export default function NotFound() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>404 — Сторінку не знайдено</h1>
    </div>
  )
}

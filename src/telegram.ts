const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID as string
const API = 'https://api.telegram.org'

export async function sendMovieRequest(title: string, year?: string): Promise<{ ok: boolean; error?: string }> {
  if (!BOT_TOKEN || !CHAT_ID) {
    return { ok: false, error: 'Telegram not configured' }
  }

  const text = year ? `${title} (${year})` : title

  try {
    const res = await fetch(`${API}/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        disable_web_page_preview: false,
      }),
    })

    const data = await res.json()

    if (!data.ok) {
      return { ok: false, error: data.description || 'Telegram API error' }
    }

    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error' }
  }
}
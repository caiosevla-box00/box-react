export const API_URL = 'https://script.google.com/macros/s/AKfycbzqtVMOPIcVGwd45GzU6PYAzsl-KLJa27zwjSWVFcmR_6JizIIgkiaCpqa1q3OpTCZWTQ/exec'
export const BOX_TOKEN = 'BOX2903'

export async function apiCall<T = unknown>(action: string, body: Record<string, unknown> = {}): Promise<{ ok: boolean; data?: T; msg?: string; error?: string }> {
  try {
    const payload = encodeURIComponent(JSON.stringify({ action, token: BOX_TOKEN, ...body }))
    const url = `${API_URL}?action=${action}&payload=${payload}`
    const res = await fetch(url, { method: 'GET', redirect: 'follow' })
    const text = await res.text()
    if (text.trim().startsWith('<')) return { ok: false, error: 'Resposta inválida' }
    return JSON.parse(text)
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

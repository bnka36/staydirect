const DEEPL_LANGS: Record<string, string> = { en: 'EN', es: 'ES', fr: 'FR' }

export async function deepLTranslate(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim()) return text
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) return text
  const dl = DEEPL_LANGS[targetLang]
  if (!dl) return text

  try {
    const res = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: { 'Authorization': `DeepL-Auth-Key ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: [text], source_lang: 'FR', target_lang: dl }),
      next: { revalidate: 604800 }, // cache 7 jours
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return text
    const data = await res.json()
    return data?.translations?.[0]?.text || text
  } catch {
    return text
  }
}

export async function deepLTranslateMany(texts: string[], targetLang: string): Promise<string[]> {
  if (!texts.length) return texts
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) return texts
  const dl = DEEPL_LANGS[targetLang]
  if (!dl) return texts

  try {
    const res = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: { 'Authorization': `DeepL-Auth-Key ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: texts, source_lang: 'FR', target_lang: dl }),
      next: { revalidate: 604800 },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return texts
    const data = await res.json()
    return data?.translations?.map((t: { text: string }) => t.text) || texts
  } catch {
    return texts
  }
}

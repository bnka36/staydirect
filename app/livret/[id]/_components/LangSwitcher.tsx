'use client'
import { useRouter } from 'next/navigation'

const LANGS = [
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
]

export default function LangSwitcher({ current, bookId }: { current: string; bookId: string }) {
  const router = useRouter()

  return (
    <div className="flex gap-1 bg-black/30 backdrop-blur-sm rounded-full p-1">
      {LANGS.map(l => (
        <button
          key={l.code}
          onClick={() => router.push(`/livret/${bookId}?lang=${l.code}`)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
            current === l.code
              ? 'bg-white text-gray-900'
              : 'text-white/80 hover:text-white hover:bg-white/20'
          }`}
        >
          <span>{l.flag}</span>
          <span>{l.label}</span>
        </button>
      ))}
    </div>
  )
}

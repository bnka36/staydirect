'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', plan: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setStatus(res.ok ? 'success' : 'error')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-gray-900">StayDirect</span>
        </Link>
        <Link href="/pricing" className="text-sm text-blue-600 font-medium hover:underline">Voir les tarifs</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Gauche — Texte */}
          <div>
            <h1 className="text-4xl font-black text-gray-900 leading-tight mb-4">
              On vous rappelle<br />
              <span className="text-blue-600">gratuitement</span> 📞
            </h1>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Vous avez des questions sur StayDirect ? On vous explique tout en quelques minutes.
            </p>

            <div className="space-y-4">
              {[
                { icon: '⚡', title: 'Réponse rapide', desc: 'On vous répond sous 24h' },
                { icon: '🎁', title: 'Demo gratuite', desc: 'On vous montre comment ça marche' },
                { icon: '💳', title: 'Sans engagement', desc: 'Annulez quand vous voulez' },
                { icon: '🇫🇷', title: 'Support français', desc: 'Une équipe française à votre écoute' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-500">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Droite — Formulaire */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Message envoyé !</h3>
                <p className="text-gray-500">On vous répond très vite. Vérifiez votre boîte mail.</p>
                <Link href="/" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                  Retour à l'accueil
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Prénom & Nom *</label>
                    <input required value={form.name} onChange={e => set('name', e.target.value)}
                      placeholder="Jean Dupont"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Téléphone</label>
                    <input value={form.phone} onChange={e => set('phone', e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email *</label>
                  <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="jean@exemple.fr"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Je suis intéressé par</label>
                  <select value={form.plan} onChange={e => set('plan', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Choisir...</option>
                    <option value="solo">Solo — 19€/mois (1 logement)</option>
                    <option value="petit">Petit propriétaire — 39€/mois (5 logements)</option>
                    <option value="pro">Pro / Agence — 69€/mois (15 logements)</option>
                    <option value="livret">Livret d'accueil QR — 4.90€/mois</option>
                    <option value="autre">Autre / Je veux des infos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Votre message *</label>
                  <textarea required rows={4} value={form.message} onChange={e => set('message', e.target.value)}
                    placeholder="Bonjour, j'ai une question sur..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>

                {status === 'error' && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                    ❌ Une erreur est survenue. Réessayez ou écrivez à contact@staydirect.fr
                  </div>
                )}

                <button type="submit" disabled={status === 'loading'}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition disabled:opacity-50">
                  {status === 'loading' ? '⏳ Envoi...' : '📬 Envoyer le message'}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  Ou directement par email : <a href="mailto:contact@staydirect.fr" className="text-blue-500">contact@staydirect.fr</a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

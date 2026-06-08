import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function LivretPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const book = await prisma.welcomeBook.findUnique({
    where: { id },
    include: {
      property: {
        select: {
          name: true,
          city: true,
          images: true,
          user: { select: { name: true, image: true } },
        },
      },
    },
  })

  if (!book || !book.isActive) notFound()

  // Incrémenter vues
  await prisma.welcomeBook.update({ where: { id }, data: { views: book.views + 1 } })

  const restaurants = book.restaurants ? JSON.parse(book.restaurants) : []
  const activities = book.activities ? JSON.parse(book.activities) : []
  const transport = book.transport ? JSON.parse(book.transport) : []

  const coverImg = book.coverImage || book.property.images?.[0] || null

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Hero */}
      <div className="relative h-64 bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden">
        {coverImg && (
          <img src={coverImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <div className="text-4xl mb-3">🏠</div>
          <h1 className="text-2xl font-bold mb-1">{book.property.name}</h1>
          <p className="text-blue-200 text-sm">{book.property.city}</p>
          {book.property.user?.name && (
            <p className="text-blue-100 text-xs mt-2">Votre hôte : {book.property.user.name}</p>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Message de bienvenue */}
        {book.welcomeMessage && (
          <Card emoji="👋" title="Bienvenue !">
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{book.welcomeMessage}</p>
          </Card>
        )}

        {/* Check-in / Check-out */}
        {(book.checkInTime || book.checkOutTime) && (
          <Card emoji="🔑" title="Arrivée & Départ">
            <div className="grid grid-cols-2 gap-3">
              {book.checkInTime && (
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Check-in</div>
                  <div className="text-lg font-bold text-green-700">{book.checkInTime}</div>
                </div>
              )}
              {book.checkOutTime && (
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Check-out</div>
                  <div className="text-lg font-bold text-orange-700">{book.checkOutTime}</div>
                </div>
              )}
            </div>
            {book.checkInInstructions && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">Instructions d'arrivée</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{book.checkInInstructions}</p>
              </div>
            )}
            {book.checkOutInstructions && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">Instructions de départ</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{book.checkOutInstructions}</p>
              </div>
            )}
          </Card>
        )}

        {/* WiFi */}
        {(book.wifiName || book.wifiPassword) && (
          <Card emoji="📶" title="WiFi">
            <div className="space-y-2">
              {book.wifiName && (
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-xs text-gray-500">Réseau</span>
                  <span className="font-bold text-gray-900">{book.wifiName}</span>
                </div>
              )}
              {book.wifiPassword && (
                <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
                  <span className="text-xs text-gray-500">Mot de passe</span>
                  <span className="font-bold text-blue-700 tracking-wider">{book.wifiPassword}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Règles */}
        {book.houseRules && (
          <Card emoji="📋" title="Règles de la maison">
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{book.houseRules}</p>
          </Card>
        )}

        {/* Restaurants */}
        {restaurants.length > 0 && (
          <Card emoji="🍽️" title="Restaurants recommandés">
            <div className="space-y-3">
              {restaurants.map((r: { name: string; description: string; distance?: string }, i: number) => (
                <div key={i} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🍴</div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{r.name}</div>
                    {r.description && <div className="text-xs text-gray-500">{r.description}</div>}
                    {r.distance && <div className="text-xs text-orange-600 mt-0.5">📍 {r.distance}</div>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Activités */}
        {activities.length > 0 && (
          <Card emoji="🎯" title="Activités & Visites">
            <div className="space-y-3">
              {activities.map((a: { name: string; description: string }, i: number) => (
                <div key={i} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-sm flex-shrink-0">⭐</div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{a.name}</div>
                    {a.description && <div className="text-xs text-gray-500">{a.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Transport */}
        {transport.length > 0 && (
          <Card emoji="🚗" title="Transports">
            <div className="space-y-3">
              {transport.map((t: { name: string; description: string }, i: number) => (
                <div key={i} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🚌</div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    {t.description && <div className="text-xs text-gray-500">{t.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Conseils locaux */}
        {book.localTips && (
          <Card emoji="💡" title="Conseils de votre hôte">
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{book.localTips}</p>
          </Card>
        )}

        {/* Contact */}
        {(book.ownerPhone || book.emergencyPhone) && (
          <Card emoji="📞" title="Contacts">
            <div className="space-y-2">
              {book.ownerPhone && (
                <a href={`tel:${book.ownerPhone}`} className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3 hover:bg-blue-100 transition">
                  <div>
                    <div className="text-xs text-gray-500">Votre hôte</div>
                    <div className="font-bold text-blue-700">{book.ownerPhone}</div>
                  </div>
                  <span className="text-2xl">📱</span>
                </a>
              )}
              {book.emergencyPhone && (
                <a href={`tel:${book.emergencyPhone}`} className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3 hover:bg-red-100 transition">
                  <div>
                    <div className="text-xs text-gray-500">Urgence</div>
                    <div className="font-bold text-red-700">{book.emergencyPhone}</div>
                  </div>
                  <span className="text-2xl">🚨</span>
                </a>
              )}
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-4 text-xs text-gray-400">
          Propulsé par <a href="https://staydirect.fr" className="text-blue-500 font-medium">StayDirect</a>
        </div>
      </div>
    </div>
  )
}

function Card({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
        <span className="text-xl">{emoji}</span>
        <h2 className="font-bold text-gray-900">{title}</h2>
      </div>
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  )
}

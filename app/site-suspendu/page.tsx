export default function SiteSuspenduPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full p-10 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-3">Site temporairement suspendu</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Ce site de réservation est momentanément indisponible. Veuillez contacter directement le propriétaire.
        </p>
      </div>
    </div>
  )
}

export interface Testimonial {
  name: string
  location: string
  avatar: string
  color: string
  text: string
  stars: number
}

// Ajoute tes vrais témoignages ici au fur et à mesure
export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Mouss A.',
    location: '5 villas · Marrakech',
    avatar: 'MA',
    color: 'bg-emerald-100 text-emerald-700',
    text: "Je cherchais une solution pro sans passer par les plateformes. StayDirect m'a donné mon propre site rapidement. Mes clients de Marrakech réservent directement maintenant.",
    stars: 5,
  },
  {
    name: 'Ghizlane M.',
    location: 'Appartements · Sète',
    avatar: 'GM',
    color: 'bg-blue-100 text-blue-700',
    text: "StayDirect m'a permis de professionnaliser mes locations à Sète. Site propre, réservations directes, livret numérique — tout ce qu'il me fallait en un seul outil.",
    stars: 5,
  },
]

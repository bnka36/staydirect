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
  // Exemple — remplace par tes vrais clients :
  // {
  //   name: 'Ahmed K.',
  //   location: '3 villas · Marrakech',
  //   avatar: 'AK',
  //   color: 'bg-emerald-100 text-emerald-700',
  //   text: "Le livret QR est incroyable. Mes clients ont tout sur leur téléphone dès l'arrivée.",
  //   stars: 5,
  // },
]

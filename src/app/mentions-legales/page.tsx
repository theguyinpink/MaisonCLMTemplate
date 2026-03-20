export default function MentionsLegales() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-32">
      <h1
        className="mb-12 text-4xl text-gray-900 md:text-5xl"
        style={{ fontFamily: '"Playfair Display", serif' }}
      >
        Mentions légales
      </h1>

      <div className="space-y-10 text-[1rem] leading-8 text-gray-600">

        {/* Éditeur */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Éditeur du site
          </h2>
          <p>Clément Carré</p>
          <p>Micro-entrepreneur</p>
          <p>Nom commercial : Maison CLM</p>
          <p>Adresse : 6 Place Père André Jarlan, 77380 Combs-la-Ville</p>
          <p>Email : maison.clm.contact@gmail.com</p>
          <p>SIRET : 10256322800018</p>
          <p>TVA non applicable, article 293B du CGI</p>
        </div>

        {/* Directeur */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Directeur de la publication
          </h2>
          <p>Clément Carré</p>
        </div>

        {/* Hébergement */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Hébergement
          </h2>
          <p>Vercel Inc.</p>
          <p>440 N Barranca Ave #4133</p>
          <p>Covina, CA 91723</p>
          <p>États-Unis</p>
        </div>

        {/* Propriété */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Propriété intellectuelle
          </h2>
          <p>
            L’ensemble des contenus présents sur ce site (textes, images,
            éléments graphiques, design) est protégé par le droit de la propriété
            intellectuelle.
          </p>
          <p>
            Toute reproduction, distribution ou utilisation sans autorisation
            préalable est interdite.
          </p>
        </div>

        {/* Données */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Données personnelles
          </h2>
          <p>
            Pour plus d’informations sur la gestion des données personnelles,
            veuillez consulter notre Politique de confidentialité.
          </p>
        </div>

        {/* Responsabilité */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Responsabilité
          </h2>
          <p>
            L’éditeur du site s’efforce de fournir des informations aussi précises
            que possible, mais ne peut garantir l’exactitude ou l’exhaustivité
            des contenus.
          </p>
        </div>

      </div>
    </section>
  )
}
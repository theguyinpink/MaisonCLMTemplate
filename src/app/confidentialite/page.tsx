export default function Confidentialite() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-32">
      <h1
        className="mb-12 text-4xl text-gray-900 md:text-5xl"
        style={{ fontFamily: '"Playfair Display", serif' }}
      >
        Politique de confidentialité
      </h1>

      <div className="space-y-10 text-[1rem] leading-8 text-gray-600">

        {/* Responsable */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Responsable du traitement
          </h2>
          <p>
            Les données personnelles sont collectées par Clément Carré,
            micro-entrepreneur, nom commercial Maison CLM.
          </p>
          <p>Email : maison.clm.contact@gmail.com</p>
        </div>

        {/* Collecte */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Collecte des données
          </h2>
          <p>
            Les données collectées via le formulaire de contact ou par email
            sont utilisées uniquement dans le cadre d’échanges professionnels.
          </p>
        </div>

        {/* Données */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Données collectées
          </h2>
          <p>
            Les informations susceptibles d’être collectées incluent :
          </p>
          <ul className="list-disc pl-6">
            <li>Nom</li>
            <li>Adresse email</li>
            <li>Contenu du message</li>
          </ul>
        </div>

        {/* Finalité */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Finalité du traitement
          </h2>
          <p>
            Les données sont utilisées exclusivement pour répondre aux demandes
            de contact et échanger dans un cadre professionnel.
          </p>
        </div>

        {/* Base légale */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Base légale
          </h2>
          <p>
            Le traitement des données repose sur le consentement de l’utilisateur
            lorsqu’il remplit le formulaire de contact.
          </p>
        </div>

        {/* Conservation */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Durée de conservation
          </h2>
          <p>
            Les données sont conservées pendant une durée maximale de 3 ans
            à compter du dernier contact, sauf obligation légale contraire.
          </p>
        </div>

        {/* Partage */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Partage des données
          </h2>
          <p>
            Aucune donnée personnelle n’est vendue, échangée ou cédée à des tiers.
          </p>
        </div>

        {/* Cookies */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Cookies
          </h2>
          <p>
            Le site peut utiliser des cookies à des fins de fonctionnement ou
            de mesure d’audience. Vous pouvez configurer votre navigateur pour
            refuser les cookies.
          </p>
        </div>

        {/* Droits */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Vos droits
          </h2>
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD),
            vous disposez d’un droit d’accès, de rectification, de suppression
            et d’opposition concernant vos données personnelles.
          </p>
          <p>
            Vous pouvez exercer ces droits à tout moment via :
          </p>
          <p className="font-medium text-gray-900">
            maison.clm.contact@gmail.com
          </p>
          <p>
            Vous avez également le droit d’introduire une réclamation auprès de
            la CNIL (www.cnil.fr).
          </p>
        </div>

      </div>
    </section>
  )
}
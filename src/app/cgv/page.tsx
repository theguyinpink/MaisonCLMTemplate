export default function CGV() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-32">
      <h1
        className="mb-12 text-4xl text-gray-900 md:text-5xl"
        style={{ fontFamily: '"Playfair Display", serif' }}
      >
        Conditions Générales de Vente
      </h1>

      <div className="space-y-10 text-[1rem] leading-8 text-gray-600">

        {/* Objet */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Objet
          </h2>
          <p>
            Les présentes Conditions Générales de Vente régissent les ventes de
            produits numériques proposées par Maison CLM.
          </p>
        </div>

        {/* Produits */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Produits
          </h2>
          <p>
            Les produits vendus sont des templates digitaux téléchargeables.
            Aucun produit physique n’est expédié.
          </p>
        </div>

        {/* Prix */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Prix
          </h2>
          <p>
            Les prix sont indiqués en euros (€). TVA non applicable,
            article 293B du CGI.
          </p>
        </div>

        {/* Paiement */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Paiement
          </h2>
          <p>
            Le paiement est sécurisé et effectué via Stripe.
          </p>
        </div>

        {/* Livraison */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Livraison
          </h2>
          <p>
            Les produits sont disponibles immédiatement après paiement via
            téléchargement ou accès à la bibliothèque utilisateur.
          </p>
        </div>

        {/* Rétractation */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Droit de rétractation
          </h2>
          <p>
            Conformément à la législation, le droit de rétractation ne s’applique
            pas aux produits numériques une fois téléchargés ou accessibles.
          </p>
        </div>

        {/* Responsabilité */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Responsabilité
          </h2>
          <p>
            Maison CLM ne peut être tenue responsable d’une mauvaise utilisation
            des templates.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Contact
          </h2>
          <p>
            Pour toute question : maison.clm.contact@gmail.com
          </p>
        </div>

      </div>
    </section>
  );
}
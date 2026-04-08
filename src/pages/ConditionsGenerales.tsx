import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SEO from "@/components/SEO";

const ConditionsGenerales = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Conditions Générales de Vente" description="Consultez les conditions générales de vente de SavoirHub." path="/conditions-generales" />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimateOnScroll>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Conditions Générales de Vente</h1>
            <p className="text-muted-foreground mb-6">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>
          </AnimateOnScroll>

          <div className="prose prose-sm md:prose-base max-w-none space-y-8 text-muted-foreground">
            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Article 1 – Objet</h2>
                <p>Les présentes conditions générales de vente (CGV) régissent l'ensemble des transactions effectuées sur le site Savoir Hub. En passant commande, le client accepte sans réserve les présentes CGV. Savoir Hub se réserve le droit de modifier ces conditions à tout moment. Les CGV applicables sont celles en vigueur au moment de la commande.</p>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Article 2 – Produits et Services</h2>
                <p>Savoir Hub propose des formations numériques, des kits professionnels, des livres numériques et des outils de gestion sous forme de produits digitaux téléchargeables. Chaque produit est décrit avec le plus de précision possible. Les images et descriptions sont fournies à titre indicatif. Savoir Hub ne saurait être tenu responsable d'éventuelles erreurs mineures dans les descriptions.</p>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Article 3 – Prix</h2>
                <p>Les prix sont indiqués en Francs CFA (XOF) toutes taxes comprises. Savoir Hub se réserve le droit de modifier ses tarifs à tout moment, étant entendu que le prix applicable est celui affiché au moment de la validation de la commande. Les promotions et offres spéciales sont valables dans la limite des stocks disponibles et pendant la durée indiquée.</p>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Article 4 – Commande et Paiement</h2>
                <p>Le client passe commande en ajoutant des produits à son panier et en suivant le processus de validation. Le paiement peut être effectué par Mobile Money (MTN, Moov, Orange Money, Wave, TMoney, Airtel Money) ou par carte bancaire (Visa, MasterCard). La commande est confirmée dès réception du paiement. Un email de confirmation est envoyé au client avec les liens de téléchargement.</p>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Article 5 – Livraison</h2>
                <p>Les produits numériques sont livrés instantanément par email et/ou via l'espace client après confirmation du paiement. Aucune livraison physique n'est effectuée. Le client est responsable de la bonne saisie de son adresse email lors de la commande.</p>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Article 6 – Propriété Intellectuelle</h2>
                <p>L'ensemble des contenus proposés par Savoir Hub (formations, documents, outils) sont protégés par le droit de la propriété intellectuelle. Toute reproduction, distribution ou revente sans autorisation écrite préalable est strictement interdite et passible de poursuites judiciaires. L'achat d'un produit confère un droit d'utilisation personnel et non transférable.</p>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Article 7 – Responsabilité</h2>
                <p>Savoir Hub s'engage à fournir des produits de qualité. Toutefois, les résultats obtenus grâce aux formations et outils dépendent de l'engagement et des actions de chaque utilisateur. Savoir Hub ne garantit aucun résultat financier spécifique. Le site peut connaître des interruptions temporaires pour maintenance ou mise à jour.</p>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Article 8 – Contact</h2>
                <p>Pour toute question relative aux présentes CGV, vous pouvez nous contacter à l'adresse suivante : <a href="mailto:contact@savoirhub.com" className="text-primary hover:underline">contact@savoirhub.com</a></p>
              </section>
            </AnimateOnScroll>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default ConditionsGenerales;

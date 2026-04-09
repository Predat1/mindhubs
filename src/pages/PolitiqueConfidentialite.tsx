import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SEO from "@/components/SEO";

const PolitiqueConfidentialite = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Politique de Confidentialité" description="Découvrez comment MindHub protège vos données personnelles." path="/politique-confidentialite" />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimateOnScroll>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Politique de Confidentialité</h1>
            <p className="text-muted-foreground mb-6">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>
          </AnimateOnScroll>

          <div className="prose prose-sm md:prose-base max-w-none space-y-8 text-muted-foreground">
            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">1. Collecte des données</h2>
                <p>Mind Hub collecte les données personnelles suivantes lors de votre inscription et de vos achats : nom et prénom, adresse email, numéro de téléphone, et informations de paiement. Ces données sont nécessaires au traitement de vos commandes et à la gestion de votre compte client. Nous ne collectons aucune donnée superflue.</p>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">2. Utilisation des données</h2>
                <p>Vos données personnelles sont utilisées pour : traiter et suivre vos commandes, vous donner accès à vos produits numériques, vous envoyer des communications relatives à vos achats, améliorer nos services et votre expérience utilisateur, et vous envoyer notre newsletter (si vous y avez consenti). Nous ne vendons ni ne louons vos données à des tiers.</p>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">3. Protection des données</h2>
                <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction. Les transactions de paiement sont sécurisées et chiffrées. L'accès aux données est limité aux seuls employés autorisés.</p>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">4. Cookies</h2>
                <p>Notre site utilise des cookies pour améliorer votre expérience de navigation. Les cookies essentiels permettent le fonctionnement du site. Les cookies analytiques nous aident à comprendre comment le site est utilisé. Vous pouvez configurer votre navigateur pour refuser les cookies, bien que cela puisse limiter certaines fonctionnalités.</p>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">5. Vos droits</h2>
                <p>Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles. Vous pouvez également vous opposer au traitement de vos données ou demander une limitation. Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@mindhub.com" className="text-primary hover:underline">contact@mindhub.com</a></p>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">6. Conservation des données</h2>
                <p>Vos données personnelles sont conservées pendant la durée de votre relation commerciale avec Mind Hub et pendant une période de 3 ans après votre dernière interaction. Les données de facturation sont conservées conformément aux obligations légales en vigueur.</p>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">7. Contact</h2>
                <p>Pour toute question concernant notre politique de confidentialité, contactez notre délégué à la protection des données à l'adresse : <a href="mailto:contact@mindhub.com" className="text-primary hover:underline">contact@mindhub.com</a></p>
              </section>
            </AnimateOnScroll>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default PolitiqueConfidentialite;

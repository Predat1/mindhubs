import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SEO from "@/components/SEO";
import { toast } from "@/hooks/use-toast";
import fbPixel from "@/hooks/useFacebookPixel";

const contactInfo = [
  { icon: Mail, label: "Email", value: "contact@mindhub.com", href: "mailto:contact@mindhub.com" },
  { icon: Phone, label: "Téléphone", value: "+228 90 00 00 00", href: "tel:+22890000000" },
  { icon: MapPin, label: "Adresse", value: "Lomé, Togo", href: "#" },
  { icon: Clock, label: "Horaires", value: "Lun - Ven : 8h - 18h", href: "#" },
];

const faqItems = [
  { q: "Comment accéder à mes formations ?", a: "Après l'achat, vous recevez un accès immédiat à votre formation via votre espace personnel. L'accès est à vie." },
  { q: "Quel est le délai de réponse du support ?", a: "Notre équipe répond sous 24h maximum, du lundi au vendredi. Le support est disponible par email et WhatsApp." },
  { q: "Proposez-vous des remboursements ?", a: "Oui, nous offrons une garantie satisfait ou remboursé de 14 jours sur toutes nos formations." },
  { q: "Les formations sont-elles certifiantes ?", a: "Oui, un certificat de complétion est délivré à la fin de chaque formation." },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast({ title: "Erreur", description: "Veuillez entrer une adresse email valide.", variant: "destructive" });
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", email: "", subject: "", message: "" });
      fbPixel.contact();
      fbPixel.lead({ content_name: "Contact Form" });
      toast({ title: "Message envoyé ✅", description: "Merci ! Nous vous répondrons rapidement." });
    }, 1500);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent("Bonjour MindHub, j'ai une question concernant vos formations.");
    window.open(`https://wa.me/22890000000?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Contact" description="Contactez l'équipe MindHub. Email, téléphone, WhatsApp — nous sommes là pour vous aider." path="/contact" />
      <Navbar />

      {/* Hero */}
      <section className="pt-20 sm:pt-16">
        <div className="relative py-16 sm:py-24 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
          <div className="relative container mx-auto px-4 space-y-4 sm:space-y-6">
            <AnimateOnScroll>
              <span className="badge-purple inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                Contactez-nous
              </span>
            </AnimateOnScroll>
            <AnimateOnScroll delay={100}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground px-2">
                Nous sommes là pour <span className="text-gradient-brand">vous aider</span>
              </h1>
            </AnimateOnScroll>
            <AnimateOnScroll delay={200}>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-lg px-2">
                Une question ? Un besoin particulier ? N'hésitez pas à nous contacter.
              </p>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="container mx-auto px-4 -mt-4 sm:-mt-6 mb-10 sm:mb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {contactInfo.map((c, i) => (
            <AnimateOnScroll key={c.label} delay={i * 80}>
              <a
                href={c.href}
                className="stat-card rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 hover:border-primary/40 transition-all hover-scale block text-center sm:text-left"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <c.icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{c.label}</p>
                  <p className="text-xs sm:text-sm font-semibold text-foreground">{c.value}</p>
                </div>
              </a>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* Form + WhatsApp */}
      <section className="container mx-auto px-4 pb-10 sm:pb-16">
        <div className="grid md:grid-cols-5 gap-6 sm:gap-8">
          <AnimateOnScroll className="md:col-span-3">
            <div className="stat-card rounded-xl sm:rounded-2xl p-5 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-5 sm:mb-6">Envoyez-nous un message</h2>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-foreground">Nom complet *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      maxLength={100}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background border border-border text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-foreground">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      maxLength={255}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background border border-border text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-foreground">Sujet</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    maxLength={200}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background border border-border text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Le sujet de votre message"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-foreground">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    maxLength={2000}
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background border border-border text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                    placeholder="Décrivez votre demande..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary-brand w-full py-3 sm:py-3.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover-scale disabled:opacity-60"
                >
                  {sending ? (
                    <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={14} />
                      Envoyer le message
                    </>
                  )}
                </button>
              </form>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={200} className="md:col-span-2">
            <div className="space-y-4 sm:space-y-6">
              <div className="stat-card rounded-xl sm:rounded-2xl p-5 sm:p-6 space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <MessageCircle size={24} className="text-green-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">Réponse rapide via WhatsApp</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Besoin d'une réponse immédiate ? Contactez-nous directement sur WhatsApp.
                </p>
                <button
                  onClick={handleWhatsApp}
                  className="w-full py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all hover-scale flex items-center justify-center gap-2"
                >
                  <MessageCircle size={14} />
                  Discuter sur WhatsApp
                </button>
              </div>

              <div className="stat-card rounded-xl sm:rounded-2xl p-5 sm:p-6 space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-foreground">Notre localisation</h3>
                <div className="w-full h-32 sm:h-40 rounded-lg bg-muted/50 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <MapPin size={28} className="text-primary mx-auto" />
                    <p className="text-xs sm:text-sm text-muted-foreground">Lomé, Togo</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 sm:py-16 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <AnimateOnScroll>
            <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Questions fréquentes</h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-base">
                Retrouvez les réponses aux questions les plus posées.
              </p>
            </div>
          </AnimateOnScroll>
          <div className="max-w-2xl mx-auto space-y-2 sm:space-y-3">
            {faqItems.map((faq, i) => (
              <AnimateOnScroll key={i} delay={i * 80}>
                <div className="stat-card rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                  >
                    <span className="font-semibold text-foreground text-xs sm:text-sm pr-4">{faq.q}</span>
                    <span className={`text-primary transition-transform duration-300 ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === i ? "max-h-40 pb-4 sm:pb-5 px-4 sm:px-5" : "max-h-0"
                    }`}
                  >
                    <p className="text-xs sm:text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Contact;

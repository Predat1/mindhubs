import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SEO from "@/components/SEO";
import { toast } from "@/hooks/use-toast";

const contactInfo = [
  { icon: Mail, label: "Email", value: "contact@savoirhub.com", href: "mailto:contact@savoirhub.com" },
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
      toast({ title: "Message envoyé ✅", description: "Merci pour votre message ! Nous vous répondrons dans les plus brefs délais." });
    }, 1500);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent("Bonjour SavoirHub, j'ai une question concernant vos formations.");
    window.open(`https://wa.me/22890000000?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-16">
        <div className="relative py-24 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
          <div className="relative container mx-auto px-4 space-y-6">
            <AnimateOnScroll>
              <span className="badge-purple inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider">
                Contactez-nous
              </span>
            </AnimateOnScroll>
            <AnimateOnScroll delay={100}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                Nous sommes là pour <span className="text-gradient-brand">vous aider</span>
              </h1>
            </AnimateOnScroll>
            <AnimateOnScroll delay={200}>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Une question ? Un besoin particulier ? N'hésitez pas à nous contacter, notre équipe vous répondra rapidement.
              </p>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="container mx-auto px-4 -mt-6 mb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactInfo.map((c, i) => (
            <AnimateOnScroll key={c.label} delay={i * 80}>
              <a
                href={c.href}
                className="stat-card rounded-xl p-5 flex items-center gap-4 hover:border-primary/40 transition-all hover-scale block"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <c.icon size={22} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className="text-sm font-semibold text-foreground">{c.value}</p>
                </div>
              </a>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* Form + WhatsApp */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Form */}
          <AnimateOnScroll className="md:col-span-3">
            <div className="stat-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Envoyez-nous un message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Nom complet *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      maxLength={100}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      maxLength={255}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Sujet</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    maxLength={200}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Le sujet de votre message"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    maxLength={2000}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                    placeholder="Décrivez votre demande..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary-brand w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover-scale disabled:opacity-60"
                >
                  {sending ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={16} />
                      Envoyer le message
                    </>
                  )}
                </button>
              </form>
            </div>
          </AnimateOnScroll>

          {/* Sidebar */}
          <AnimateOnScroll delay={200} className="md:col-span-2">
            <div className="space-y-6">
              {/* WhatsApp CTA */}
              <div className="stat-card rounded-2xl p-6 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <MessageCircle size={28} className="text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Réponse rapide via WhatsApp</h3>
                <p className="text-sm text-muted-foreground">
                  Besoin d'une réponse immédiate ? Contactez-nous directement sur WhatsApp pour une assistance en temps réel.
                </p>
                <button
                  onClick={handleWhatsApp}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all hover-scale flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  Discuter sur WhatsApp
                </button>
              </div>

              {/* Map placeholder */}
              <div className="stat-card rounded-2xl p-6 space-y-3">
                <h3 className="text-lg font-bold text-foreground">Notre localisation</h3>
                <div className="w-full h-40 rounded-lg bg-muted/50 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <MapPin size={32} className="text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Lomé, Togo</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <AnimateOnScroll>
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Questions fréquentes</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Retrouvez les réponses aux questions les plus posées.
              </p>
            </div>
          </AnimateOnScroll>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqItems.map((faq, i) => (
              <AnimateOnScroll key={i} delay={i * 80}>
                <div className="stat-card rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="font-semibold text-foreground text-sm pr-4">{faq.q}</span>
                    <span className={`text-primary transition-transform duration-300 ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === i ? "max-h-40 pb-5 px-5" : "max-h-0"
                    }`}
                  >
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
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

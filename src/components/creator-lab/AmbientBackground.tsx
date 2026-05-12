/**
 * AmbientBackground
 * Fond animé premium avec orbes flottantes et grille subtile.
 * Inspiré des visuels Lovable / Linear — glassmorphism + gradients.
 */
const AmbientBackground = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
    {/* Grid */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage:
          "linear-gradient(hsl(var(--primary)/0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.4) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }}
    />

    {/* Orb 1 — primary */}
    <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[140px] animate-pulse" />

    {/* Orb 2 — accent */}
    <div
      className="absolute top-1/3 right-0 h-[400px] w-[400px] rounded-full bg-accent/15 blur-[120px]"
      style={{ animation: "float 12s ease-in-out infinite alternate" }}
    />

    {/* Orb 3 — fuchsia */}
    <div
      className="absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-fuchsia-500/10 blur-[100px]"
      style={{ animation: "float 16s ease-in-out infinite alternate-reverse" }}
    />

    <style>{`
      @keyframes float {
        0% { transform: translateY(0) scale(1); }
        100% { transform: translateY(-40px) scale(1.08); }
      }
    `}</style>
  </div>
);

export default AmbientBackground;

import { Check, X } from "lucide-react";

interface Props {
  password: string;
}

export const getPasswordScore = (password: string) => {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  return checks.filter(Boolean).length;
};

const PasswordStrength = ({ password }: Props) => {
  const checks = [
    { label: "8 caractères minimum", valid: password.length >= 8 },
    { label: "Une majuscule", valid: /[A-Z]/.test(password) },
    { label: "Un chiffre", valid: /[0-9]/.test(password) },
    { label: "Un caractère spécial", valid: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.valid).length;
  const labels = ["Très faible", "Faible", "Moyen", "Bon", "Excellent"];
  const colors = [
    "bg-muted",
    "bg-destructive",
    "bg-yellow-500",
    "bg-yellow-400",
    "bg-accent",
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${colors[score]}`}
            style={{ width: `${(score / 4) * 100}%` }}
          />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground min-w-[60px] text-right">
          {labels[score]}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <li
            key={c.label}
            className={`flex items-center gap-1 text-[10px] transition-colors ${
              c.valid ? "text-accent" : "text-muted-foreground"
            }`}
          >
            {c.valid ? <Check size={10} /> : <X size={10} />}
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrength;

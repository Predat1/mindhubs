import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const getTimeLeft = () => {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const diff = endOfDay.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s };
};

const CountdownTimer = () => {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20">
      <Clock size={16} className="text-destructive shrink-0" />
      <span className="text-sm font-semibold text-destructive">
        Offre expire dans {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
      </span>
    </div>
  );
};

export default CountdownTimer;

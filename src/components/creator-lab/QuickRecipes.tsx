import { BookOpen, BarChart3, Video, FileSpreadsheet, Presentation, Pen, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useCreatorLab, type PipelineStepId } from "@/contexts/CreatorLabContext";

interface QuickRecipesProps {
  onStart: (step: PipelineStepId, idea: string) => void;
}

const RECIPES = [
  {
    icon: BookOpen,
    label: "E-book Guide Pratique",
    idea: "Guide pratique étape par étape",
    color: "from-violet-500/20 to-violet-600/5 text-violet-400 border-violet-500/20",
  },
  {
    icon: BarChart3,
    label: "Business Plan PDF",
    idea: "Business plan complet avec projections financières",
    color: "from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20",
  },
  {
    icon: Video,
    label: "Formation Vidéo (Scripts)",
    idea: "Formation vidéo avec scripts de cours",
    color: "from-pink-500/20 to-pink-600/5 text-pink-400 border-pink-500/20",
  },
  {
    icon: FileSpreadsheet,
    label: "Template / Checklist",
    idea: "Template pratique et checklist actionnable",
    color: "from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20",
  },
  {
    icon: Presentation,
    label: "Masterclass Slides",
    idea: "Masterclass avec slides et notes de présentation",
    color: "from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20",
  },
  {
    icon: Pen,
    label: "Coaching / Workbook",
    idea: "Programme de coaching avec workbook interactif",
    color: "from-orange-500/20 to-orange-600/5 text-orange-400 border-orange-500/20",
  },
];

/**
 * QuickRecipes
 * Grille de raccourcis pour démarrer un workflow Creator Lab
 * avec un type de produit pré-défini.
 */
const QuickRecipes = ({ onStart }: QuickRecipesProps) => {
  const { setCurrentIdea, setProductInfo } = useCreatorLab();

  const handleClick = (recipe: typeof RECIPES[number]) => {
    setCurrentIdea(recipe.idea);
    setProductInfo(recipe.idea, recipe.label);
    onStart("sandbox", recipe.idea);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-black tracking-tight">Démarrage rapide</h3>
        <p className="text-xs text-muted-foreground font-medium">Choisissez un format, l'IA fait le reste.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {RECIPES.map((recipe, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => handleClick(recipe)}
            className={`group relative flex flex-col items-start gap-3 rounded-2xl border bg-gradient-to-br p-5 text-left backdrop-blur-xl transition-all hover:scale-[1.03] hover:shadow-xl ${recipe.color}`}
          >
            <recipe.icon size={20} />
            <span className="text-xs font-black leading-snug">{recipe.label}</span>
            <ArrowRight
              size={14}
              className="absolute bottom-4 right-4 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickRecipes;

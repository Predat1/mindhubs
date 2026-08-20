import { useEffect, useState } from "react";
import { CheckCircle2, CircleHelp, Loader2, Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type QuestionType = "single_choice" | "multiple_choice" | "true_false" | "short_answer";

type Answer = { id: string; answer_text: string; sort_order: number };
type Question = { id: string; prompt: string; question_type: QuestionType; sort_order: number; answers: Answer[] };
type Quiz = { id: string; title: string; instructions: string | null; passing_score: number; max_attempts: number | null; questions: Question[] };

export default function QuizPlayer({ lessonId }: { lessonId: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean; attemptsRemaining: number | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any)
        .from("quizzes")
        .select("id, title, instructions, passing_score, max_attempts, questions:quiz_questions(id, prompt, question_type, sort_order, answers:quiz_answers(id, answer_text, sort_order))")
        .eq("lesson_id", lessonId)
        .maybeSingle();
      if (cancelled) return;
      if (error) toast.error("Impossible de charger le quiz", { description: error.message });
      if (data) {
        setQuiz({
          ...data,
          questions: (data.questions || []).sort((a: Question, b: Question) => a.sort_order - b.sort_order)
            .map((question: Question) => ({ ...question, answers: (question.answers || []).sort((a, b) => a.sort_order - b.sort_order) })),
        });
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [lessonId]);

  const setAnswer = (question: Question, value: string) => {
    setAnswers((current) => {
      if (question.question_type !== "multiple_choice") return { ...current, [question.id]: value };
      const currentValues = Array.isArray(current[question.id]) ? current[question.id] as string[] : [];
      return {
        ...current,
        [question.id]: currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  const submit = async () => {
    if (!quiz || quiz.questions.some((question) => answers[question.id] === undefined || answers[question.id] === "" || (Array.isArray(answers[question.id]) && answers[question.id].length === 0))) {
      toast.error("Répondez à toutes les questions avant d’envoyer le quiz.");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await (supabase as any).rpc("submit_quiz_attempt", {
        p_quiz_id: quiz.id,
        p_answers: answers,
      });
      if (error) throw error;
      const attempt = Array.isArray(data) ? data[0] : data;
      setResult({ score: Number(attempt.score), passed: Boolean(attempt.passed), attemptsRemaining: attempt.attempts_remaining == null ? null : Number(attempt.attempts_remaining) });
      toast.success(attempt.passed ? "Quiz réussi !" : "Quiz envoyé, continuez vos révisions.");
    } catch (error: any) {
      toast.error("Impossible d’envoyer le quiz", { description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Chargement du quiz…</div>;
  if (!quiz) return <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">Ce quiz n’est pas encore disponible.</div>;

  return (
    <section className="space-y-6 rounded-[2rem] border border-border bg-card p-6 md:p-8" aria-labelledby={`quiz-${quiz.id}`}>
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-primary"><CircleHelp size={20} aria-hidden="true" /><span className="text-xs font-black uppercase tracking-widest">Évaluation</span></div>
        <h2 id={`quiz-${quiz.id}`} className="text-2xl font-black">{quiz.title}</h2>
        {quiz.instructions && <p className="text-sm text-muted-foreground">{quiz.instructions}</p>}
        <p className="text-xs text-muted-foreground">Réussite à partir de {quiz.passing_score}%{quiz.max_attempts ? ` · ${quiz.max_attempts} tentative(s)` : ""}</p>
      </div>

      <div className="space-y-5">
        {quiz.questions.map((question, index) => {
          const selected = answers[question.id];
          return (
            <fieldset key={question.id} className="space-y-3 rounded-2xl border border-border/80 p-4 md:p-5">
              <legend className="max-w-full px-1 text-sm font-bold">{index + 1}. {question.prompt}</legend>
              {question.question_type === "short_answer" ? (
                <Textarea value={typeof selected === "string" ? selected : ""} onChange={(event) => setAnswer(question, event.target.value)} placeholder="Votre réponse" className="min-h-24" />
              ) : (
                <div className="grid gap-2">
                  {question.answers.map((answer) => {
                    const isSelected = Array.isArray(selected) ? selected.includes(answer.id) : selected === answer.id;
                    return (
                      <button key={answer.id} type="button" onClick={() => setAnswer(question, answer.id)} className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 text-left text-sm transition-colors ${isSelected ? "border-primary bg-primary/10 text-foreground" : "border-border hover:border-primary/50"}`} aria-pressed={isSelected}>
                        {isSelected ? <CheckCircle2 size={17} className="text-primary" aria-hidden="true" /> : <Circle size={17} className="text-muted-foreground" aria-hidden="true" />}
                        {answer.answer_text}
                      </button>
                    );
                  })}
                </div>
              )}
            </fieldset>
          );
        })}
      </div>

      {result && (
        <div className={`flex items-start gap-3 rounded-2xl border p-4 ${result.passed ? "border-success/30 bg-success/10" : "border-warning/30 bg-warning/10"}`} role="status" aria-live="polite">
          {result.passed ? <CheckCircle2 className="mt-0.5 text-success" /> : <XCircle className="mt-0.5 text-warning" />}
          <div><p className="font-bold">Score : {result.score}% · {result.passed ? "Réussi" : "À revoir"}</p><p className="text-sm text-muted-foreground">{result.attemptsRemaining == null ? "Vous pouvez retenter lorsque vous le souhaitez." : `${result.attemptsRemaining} tentative(s) restante(s).`}</p></div>
        </div>
      )}

      <Button type="button" onClick={submit} disabled={submitting} className="min-h-11 rounded-xl gap-2">
        {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send size={16} />}
        {submitting ? "Correction…" : "Envoyer mes réponses"}
      </Button>
    </section>
  );
}


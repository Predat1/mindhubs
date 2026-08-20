import { useEffect, useState } from "react";
import { Check, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type QuestionType = "single_choice" | "multiple_choice" | "true_false" | "short_answer";

interface Answer {
  id?: string;
  answer_text: string;
  is_correct: boolean;
  sort_order: number;
}

interface Question {
  id?: string;
  question_type: QuestionType;
  prompt: string;
  explanation: string;
  sort_order: number;
  answers: Answer[];
}

interface Quiz {
  id?: string;
  title: string;
  instructions: string;
  passing_score: number;
  max_attempts: number | null;
  questions: Question[];
}

const emptyQuestion = (sortOrder: number): Question => ({
  question_type: "single_choice",
  prompt: "",
  explanation: "",
  sort_order: sortOrder,
  answers: [
    { answer_text: "", is_correct: true, sort_order: 0 },
    { answer_text: "", is_correct: false, sort_order: 1 },
  ],
});

export default function QuizBuilder({ lessonId }: { lessonId: string }) {
  const [quiz, setQuiz] = useState<Quiz>({ title: "Quiz de la leçon", instructions: "", passing_score: 70, max_attempts: null, questions: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any)
        .from("quizzes")
        .select("*, questions:quiz_questions(*, answers:quiz_answers(*))")
        .eq("lesson_id", lessonId)
        .maybeSingle();
      if (cancelled) return;
      if (error) toast.error("Impossible de charger le quiz", { description: error.message });
      if (data) {
        setQuiz({
          ...data,
          instructions: data.instructions || "",
          questions: (data.questions || []).sort((a: Question, b: Question) => a.sort_order - b.sort_order).map((question: Question) => ({
            ...question,
            explanation: question.explanation || "",
            answers: (question.answers || []).sort((a: Answer, b: Answer) => a.sort_order - b.sort_order),
          })),
        });
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [lessonId]);

  const updateQuestion = (index: number, patch: Partial<Question>) => {
    setQuiz((current) => ({ ...current, questions: current.questions.map((question, i) => i === index ? { ...question, ...patch } : question) }));
  };

  const updateAnswer = (questionIndex: number, answerIndex: number, patch: Partial<Answer>) => {
    setQuiz((current) => ({
      ...current,
      questions: current.questions.map((question, i) => i !== questionIndex ? question : {
        ...question,
        answers: question.answers.map((answer, j) => j === answerIndex ? { ...answer, ...patch } : answer),
      }),
    }));
  };

  const saveQuiz = async () => {
    setSaving(true);
    try {
      const { data: savedQuiz, error: quizError } = await (supabase as any)
        .from("quizzes")
        .upsert({
          ...(quiz.id ? { id: quiz.id } : {}),
          lesson_id: lessonId,
          title: quiz.title.trim() || "Quiz de la leçon",
          instructions: quiz.instructions.trim() || null,
          passing_score: quiz.passing_score,
          max_attempts: quiz.max_attempts,
        }, { onConflict: "lesson_id" })
        .select()
        .single();
      if (quizError) throw quizError;

      const { data: existingQuestions } = await (supabase as any).from("quiz_questions").select("id").eq("quiz_id", savedQuiz.id);
      const savedQuestionIds: string[] = [];
      for (let index = 0; index < quiz.questions.length; index++) {
        const question = quiz.questions[index];
        const { data: savedQuestion, error: questionError } = await (supabase as any)
          .from("quiz_questions")
          .upsert({
            ...(question.id ? { id: question.id } : {}),
            quiz_id: savedQuiz.id,
            question_type: question.question_type,
            prompt: question.prompt.trim() || `Question ${index + 1}`,
            explanation: question.explanation.trim() || null,
            sort_order: index,
          }, { onConflict: "id" })
          .select()
          .single();
        if (questionError) throw questionError;
        savedQuestionIds.push(savedQuestion.id);

        const { data: existingAnswers } = await (supabase as any).from("quiz_answers").select("id").eq("question_id", savedQuestion.id);
        const savedAnswerIds: string[] = [];
        for (let answerIndex = 0; answerIndex < question.answers.length; answerIndex++) {
          const answer = question.answers[answerIndex];
          const { data: savedAnswer, error: answerError } = await (supabase as any)
            .from("quiz_answers")
            .upsert({
              ...(answer.id ? { id: answer.id } : {}),
              question_id: savedQuestion.id,
              answer_text: answer.answer_text.trim() || `Réponse ${answerIndex + 1}`,
              is_correct: answer.is_correct,
              sort_order: answerIndex,
            }, { onConflict: "id" })
            .select()
            .single();
          if (answerError) throw answerError;
          savedAnswerIds.push(savedAnswer.id);
        }
        const staleAnswerIds = (existingAnswers || []).map((answer: { id: string }) => answer.id).filter((id: string) => !savedAnswerIds.includes(id));
        if (staleAnswerIds.length) await (supabase as any).from("quiz_answers").delete().in("id", staleAnswerIds);
      }

      const staleQuestionIds = (existingQuestions || []).map((question: { id: string }) => question.id).filter((id: string) => !savedQuestionIds.includes(id));
      if (staleQuestionIds.length) await (supabase as any).from("quiz_questions").delete().in("id", staleQuestionIds);
      setQuiz((current) => ({ ...current, id: savedQuiz.id }));
      toast.success("Quiz sauvegardé");
    } catch (error: unknown) {
      toast.error("Erreur de sauvegarde du quiz", { description: (error as Error).message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 size={14} className="animate-spin" /> Chargement du quiz…</div>;

  return (
    <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-sm font-bold">Évaluation de la leçon</p><p className="text-xs text-muted-foreground">Ajoutez un quiz sans quitter le programme.</p></div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setQuiz((current) => ({ ...current, questions: [...current.questions, emptyQuestion(current.questions.length)] }))} className="rounded-xl gap-2"><Plus size={14} /> Question</Button>
          <Button type="button" size="sm" onClick={saveQuiz} disabled={saving} className="rounded-xl gap-2">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Enregistrer</Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr,120px,120px]">
        <Input value={quiz.title} onChange={(e) => setQuiz((current) => ({ ...current, title: e.target.value }))} placeholder="Titre du quiz" />
        <Input type="number" min="0" max="100" value={quiz.passing_score} onChange={(e) => setQuiz((current) => ({ ...current, passing_score: Number(e.target.value) }))} aria-label="Score de réussite" placeholder="Score %" />
        <Input type="number" min="1" value={quiz.max_attempts ?? ""} onChange={(e) => setQuiz((current) => ({ ...current, max_attempts: e.target.value ? Number(e.target.value) : null }))} aria-label="Tentatives maximales" placeholder="Tentatives" />
      </div>
      <Textarea value={quiz.instructions} onChange={(e) => setQuiz((current) => ({ ...current, instructions: e.target.value }))} placeholder="Consignes facultatives" className="min-h-16" />
      {quiz.questions.length === 0 ? <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">Aucune question. Ajoutez-en une pour évaluer vos étudiants.</p> : (
        <div className="space-y-3">
          {quiz.questions.map((question, questionIndex) => (
            <div key={question.id || questionIndex} className="space-y-3 rounded-xl border border-border bg-background/70 p-3">
              <div className="flex items-center gap-2"><span className="grid size-6 place-items-center rounded-md bg-primary/10 text-xs font-bold text-primary">{questionIndex + 1}</span><Input value={question.prompt} onChange={(e) => updateQuestion(questionIndex, { prompt: e.target.value })} placeholder="Votre question" /><Button type="button" variant="ghost" size="icon" onClick={() => setQuiz((current) => ({ ...current, questions: current.questions.filter((_, index) => index !== questionIndex) }))} aria-label="Supprimer la question"><Trash2 size={14} className="text-destructive" /></Button></div>
              <div className="grid gap-2 sm:grid-cols-[180px,1fr]"><select value={question.question_type} onChange={(e) => updateQuestion(questionIndex, { question_type: e.target.value as QuestionType })} className="h-9 rounded-lg border border-border bg-card px-2 text-xs"><option value="single_choice">Choix unique</option><option value="multiple_choice">Choix multiples</option><option value="true_false">Vrai / faux</option><option value="short_answer">Réponse courte</option></select><Input value={question.explanation} onChange={(e) => updateQuestion(questionIndex, { explanation: e.target.value })} placeholder="Explication après correction (facultatif)" /></div>
              {question.question_type !== "short_answer" && <div className="space-y-2">{question.answers.map((answer, answerIndex) => <div key={answer.id || answerIndex} className="flex items-center gap-2"><button type="button" onClick={() => updateAnswer(questionIndex, answerIndex, { is_correct: !answer.is_correct })} className={`grid size-7 place-items-center rounded-lg border ${answer.is_correct ? "border-success bg-success/10 text-success" : "border-border text-muted-foreground"}`} aria-label={answer.is_correct ? "Réponse correcte" : "Marquer comme correcte"}>{answer.is_correct ? <Check size={14} /> : null}</button><Input value={answer.answer_text} onChange={(e) => updateAnswer(questionIndex, answerIndex, { answer_text: e.target.value })} placeholder={`Réponse ${answerIndex + 1}`} /></div>)}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import { useLocalDay } from "@/lib/daily/use-local-day";
import Link from "next/link";
import bankFile from "@/data/quiz/questions.json";
import {
  questionFor,
  quizNumber,
  withShuffledOptions,
  type QuizQuestion,
} from "@/lib/daily/quiz-select";
import { useBrowserStorage } from "@/lib/daily/use-browser-storage";
const bank = bankFile.questions as QuizQuestion[];
type Play = { questionId: string; wrong: number[]; correct: boolean };
export function DailyQuiz() {
  const today = useLocalDay();
  return today ? (
    <Question key={today} today={today} />
  ) : (
    <p role="status">Loading today’s question…</p>
  );
}
function Question({ today }: { today: string }) {
  const [saved, save] = useBrowserStorage<Play | null>(
    `iuoc.quiz.${today}`,
    null,
  );
  const date = new Date(`${today}T12:00:00`);
  const pinned = saved && bank.find((q) => q.id === saved.questionId);
  const q = pinned ? withShuffledOptions(pinned) : questionFor(bank, date)!;
  const state =
    saved?.questionId === q.id && Array.isArray(saved.wrong)
      ? saved
      : { questionId: q.id, wrong: [], correct: false };
  const done = state.correct || state.wrong.length >= 3;
  function answer(index: number) {
    if (done || state.wrong.includes(index)) return;
    save({
      questionId: q.id,
      correct: index === q.answer,
      wrong: index === q.answer ? state.wrong : [...state.wrong, index],
    });
  }
  return (
    <>
      <p className="daily-eyebrow">
        {date.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}{" "}
        · Question {quizNumber(bank, date)}
      </p>
      <h2 className="quiz-prompt">{q.prompt}</h2>
      <div className="quiz-options">
        {q.options.map((option, i) => (
          <button
            key={i}
            disabled={done || state.wrong.includes(i)}
            data-result={
              done && i === q.answer
                ? "correct"
                : state.wrong.includes(i)
                  ? "wrong"
                  : undefined
            }
            onClick={() => answer(i)}
          >
            <span>{String.fromCharCode(65 + i)}</span>
            {option}
          </button>
        ))}
      </div>
      <div className="quiz-feedback" role="status" aria-live="polite">
        {done ? (
          <>
            <h3>{state.correct ? "Correct." : "Today’s answer"}</h3>
            {!state.correct && <p>{q.options[q.answer]}</p>}
            {q.basis && <p>{q.basis}</p>}
            {q.sura && q.aya && (
              <Link
                href={`/quran?surah=${q.sura}#ayah-${q.aya}`}
                className="daily-link"
              >
                Read Quran {q.sura}:{q.aya}
              </Link>
            )}
            <p className="daily-muted">
              Come back tomorrow for the next question.
            </p>
          </>
        ) : (
          <>
            <p>{3 - state.wrong.length} attempts remaining.</p>
            {state.wrong.length > 0 && q.hint && <p>Hint: {q.hint}</p>}
          </>
        )}
      </div>
    </>
  );
}

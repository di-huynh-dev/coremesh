"use client";

import React, { useState } from "react";
import { FiCheckCircle, FiXCircle, FiArrowRight } from "react-icons/fi";
import QuizResults from "./QuizResults";
import CodeBlock from "./CodeBlock";

export interface QuizQuestion {
  id: string;
  text: string;
  codeSnippet?: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  relatedQuestionSlug?: string;
}

export interface QuizData {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  questions: QuizQuestion[];
}

interface QuizPlayerProps {
  quiz: QuizData;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz }) => {
  const getShuffledQuestions = (questions: QuizQuestion[]) => {
    const questionsCopy = [...questions];
    for (let i = questionsCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questionsCopy[i], questionsCopy[j]] = [questionsCopy[j], questionsCopy[i]];
    }
    return questionsCopy.map(q => {
      const optionsCopy = [...q.options];
      for (let i = optionsCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsCopy[i], optionsCopy[j]] = [optionsCopy[j], optionsCopy[i]];
      }
      return { ...q, options: optionsCopy };
    });
  };

  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>(() => 
    getShuffledQuestions(quiz.questions)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [prevQuizId, setPrevQuizId] = useState(quiz.id);

  if (quiz.id !== prevQuizId) {
    setPrevQuizId(quiz.id);
    setShuffledQuestions(getShuffledQuestions(quiz.questions));
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setMistakes([]);
    setIsFinished(false);
  }

  const shuffleQuiz = () => {
    setShuffledQuestions(getShuffledQuestions(quiz.questions));
  };

  if (shuffledQuestions.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const question = shuffledQuestions[currentIndex];
  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === question.correctOptionId;

  const handleOptionSelect = (optionId: string) => {
    if (isAnswered) return; // Prevent changing answer
    setSelectedOption(optionId);
    
    if (optionId === question.correctOptionId) {
      setScore((s) => s + 1);
    } else {
      if (question.relatedQuestionSlug) {
        setMistakes((prev) => [...prev, question.relatedQuestionSlug!]);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleRetake = () => {
    shuffleQuiz(); // Re-shuffle on retake
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setMistakes([]);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <QuizResults
        score={score}
        totalQuestions={shuffledQuestions.length}
        mistakes={mistakes}
        onRetake={handleRetake}
        category={quiz.category}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-bold text-text-muted mb-2 uppercase tracking-widest">
          <span>Question {currentIndex + 1} of {shuffledQuestions.length}</span>
          <span>{Math.round((currentIndex / shuffledQuestions.length) * 100)}%</span>
        </div>
        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / shuffledQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-card-bg/60 backdrop-blur-md border border-card-border rounded-3xl p-6 md:p-10 shadow-lg mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6 leading-relaxed">
          {question.text}
        </h2>

        {question.codeSnippet && (
          <div className="mb-6 -mx-2 md:mx-0">
            <CodeBlock code={question.codeSnippet} language="javascript" />
          </div>
        )}

        <div className="flex flex-col gap-3">
          {question.options.map((option) => {
            const isSelected = selectedOption === option.id;
            const isActuallyCorrect = option.id === question.correctOptionId;
            
            // Determine styles based on state
            let buttonStyle = "bg-zinc-950/50 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 text-zinc-300";
            if (isAnswered) {
              if (isActuallyCorrect) {
                buttonStyle = "bg-emerald-500/10 border-emerald-500/50 text-emerald-400";
              } else if (isSelected) {
                buttonStyle = "bg-rose-500/10 border-rose-500/50 text-rose-400";
              } else {
                buttonStyle = "bg-zinc-950/30 border-zinc-900/50 text-zinc-600 opacity-50"; // Dim others
              }
            }

            return (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                disabled={isAnswered}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium flex justify-between items-center cursor-pointer disabled:cursor-not-allowed ${buttonStyle}`}
              >
                <span>{option.text}</span>
                {isAnswered && isActuallyCorrect && <FiCheckCircle className="w-5 h-5 text-emerald-500" />}
                {isAnswered && isSelected && !isActuallyCorrect && <FiXCircle className="w-5 h-5 text-rose-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation & Next Button */}
      {isAnswered && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`p-6 rounded-2xl border mb-6 ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </h3>
            <p className="text-zinc-300 text-sm leading-relaxed">
              {question.explanation}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNextQuestion}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-foreground text-background font-bold hover:bg-zinc-300 transition cursor-pointer"
            >
              {currentIndex === shuffledQuestions.length - 1 ? "Finish Quiz" : "Next Question"}
              <FiArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPlayer;

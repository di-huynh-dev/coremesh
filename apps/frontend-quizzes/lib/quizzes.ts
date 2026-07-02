import fs from 'fs';
import path from 'path';

export interface QuizQuestion {
  id: string;
  text: string;
  codeSnippet?: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  relatedQuestionSlug?: string;
  slug?: string;
}

export interface Quiz {
  id: string;
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  questions: QuizQuestion[];
}

const quizzesDirectory = path.join(process.cwd(), 'data', 'quizzes');

export function getAllQuizzes(): Quiz[] {
  if (!fs.existsSync(quizzesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(quizzesDirectory);
  const allQuizzes: Quiz[] = [];

  for (const fileName of fileNames) {
    if (fileName.endsWith('.json')) {
      const fullPath = path.join(quizzesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      try {
        const quizzes = JSON.parse(fileContents) as Quiz[];
        allQuizzes.push(...quizzes);
      } catch (e) {
        console.error(`Error parsing ${fileName}:`, e);
      }
    }
  }

  return allQuizzes;
}

export function getQuizzesByCategory(category: string): Quiz[] {
  const allQuizzes = getAllQuizzes();
  return allQuizzes.filter(quiz => quiz.category.toLowerCase() === category.toLowerCase());
}

export function getQuizById(category: string, id: string): Quiz | undefined {
  const allQuizzes = getAllQuizzes();
  return allQuizzes.find(quiz => quiz.category.toLowerCase() === category.toLowerCase() && quiz.id === id);
}

export function getQuizCategories(): string[] {
  const allQuizzes = getAllQuizzes();
  const categories = new Set(allQuizzes.map(quiz => quiz.category));
  return Array.from(categories);
}

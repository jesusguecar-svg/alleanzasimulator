export type NormalizedQuestion = {
  id: string;
  domain: string;
  subdomain?: string;
  difficulty: 'easy' | 'medium' | 'hard' | string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  source?: string;
  citation?: string;
  tags?: string[];
};

export type SessionQuestion = NormalizedQuestion & {
  shuffledOptions: string[];
};

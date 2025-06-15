
import { Question, State } from '@/types';

const QUESTIONS_URL = '/question.json';
const STATES_URL = '/states.json';

interface ApiQuestion {
  num: string;
  question: string;
  a: string;
  b: string;
  c: string;
  d: string;
  solution: string;
  state?: string;
  id: string;
  image?: string;
  category?: string | string[]; // add this!
}

export const fetchQuestions = async (states: State[]): Promise<Question[]> => {
  try {
    const response = await fetch(QUESTIONS_URL);
    if (!response.ok) throw new Error('Failed to fetch questions');
    
    let responseText = await response.text();
    if (responseText.trim().startsWith('s[')) {
      responseText = responseText.trim().substring(1);
    }

    const apiQuestions: ApiQuestion[] = JSON.parse(responseText);
    console.log('[DEBUG] Total questions loaded:', apiQuestions.length);
    console.log('[DEBUG] Available state codes:', states.map(s => s.code));

    const transformQuestion = (apiQuestion: ApiQuestion): Question & { image?: string; category?: string | string[] } => {
      const answers = [apiQuestion.a, apiQuestion.b, apiQuestion.c, apiQuestion.d];
      const solutionMap: { [key: string]: number } = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
      
      let stateCode: string | undefined;
      if (apiQuestion.num && apiQuestion.num.includes('-')) {
        const potentialStateCode = apiQuestion.num.split('-')[0];
        console.log('[DEBUG] Checking num:', apiQuestion.num, 'potential state code:', potentialStateCode);
        const matchingState = states.find(s => s.code === potentialStateCode);
        if (matchingState) {
          stateCode = matchingState.code;
          console.log('[DEBUG] Matched question', apiQuestion.num, 'to state:', stateCode);
        }
      }

      // Pass through category (could be string or array)
      const { category } = apiQuestion;

      const transformedQuestion: Question & { image?: string; category?: string | string[] } = {
        id: parseInt(apiQuestion.num.replace(/[^0-9]/g, '') || '0'),
        question: apiQuestion.question,
        answers,
        correct: solutionMap[apiQuestion.solution] || 0,
        state: stateCode,
        ...(apiQuestion.image !== undefined ? { image: apiQuestion.image } : {}),
        ...(category !== undefined ? { category } : {}), // Add this line!
      };

      if (stateCode) {
        console.log('[DEBUG] Transformed question with state:', {
          id: transformedQuestion.id,
          num: apiQuestion.num,
          state: stateCode
        });
      }

      return transformedQuestion;
    };
    
    const transformedQuestions = apiQuestions.map(transformQuestion);
    const stateQuestions = transformedQuestions.filter(q => q.state);
    console.log(`[DEBUG] Found ${stateQuestions.length} state-specific questions after transformation.`);
    console.log('[DEBUG] State questions by state:', stateQuestions.reduce((acc, q) => {
      acc[q.state!] = (acc[q.state!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));
    if (stateQuestions.length > 0) {
      console.log('[DEBUG] Sample state questions:', stateQuestions.slice(0, 3).map(q => ({
        id: q.id,
        state: q.state,
        question: q.question.substring(0, 50) + '...'
      })));
    }
    return transformedQuestions;

  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

export const fetchStates = async (): Promise<State[]> => {
  try {
    const response = await fetch(STATES_URL);
    if (!response.ok) throw new Error('Failed to fetch states');
    return await response.json();
  } catch (error) {
    console.error('Error fetching states:', error);
    throw error;
  }
};

export const getQuestionsByTopic = (questions: Question[], topic: string): Question[] => {
  function getTopicsFromQuestion(q: Question): string[] {
    if (Array.isArray((q as any).topics)) return (q as any).topics;
    if (typeof (q as any).topic === 'string') return [(q as any).topic];
    return ['others'];
  }
  return questions.filter(q => getTopicsFromQuestion(q).includes(topic));
};

export const getQuestionsByState = (questions: Question[], stateCode: string): Question[] => {
  return questions.filter(q => q.state === stateCode);
};

export const getNonStateQuestions = (questions: Question[]): Question[] => {
  return questions.filter(q => !q.state);
};

export const generateMockExam = (questions: Question[], stateCode?: string): Question[] => {
  const nonStateQuestions = getNonStateQuestions(questions);
  const stateQuestions = stateCode ? getQuestionsByState(questions, stateCode) : [];
  const shuffledNonState = [...nonStateQuestions].sort(() => Math.random() - 0.5);
  const selected30 = shuffledNonState.slice(0, 30);
  const shuffledState = [...stateQuestions].sort(() => Math.random() - 0.5);
  const selected3 = shuffledState.slice(0, 3);
  return [...selected30, ...selected3].sort(() => Math.random() - 0.5);
};

import type { OgrenmeAlani } from '../types';

let cachedCurriculumData: Record<string, Record<number, OgrenmeAlani[]>> | null = null;

export const getCurriculumData = async (): Promise<Record<string, Record<number, OgrenmeAlani[]>>> => {
  if (cachedCurriculumData) {
    return cachedCurriculumData;
  }
  
  // Dynamically import the new index file which aggregates all curriculum modules.
  const { allCurriculumData } = await import('../data/curriculum/index');
  cachedCurriculumData = allCurriculumData;
  return allCurriculumData;
};

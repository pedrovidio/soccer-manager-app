import type { useEditProfileForm } from '@features/athletes/hooks/useEditProfileForm';

export type StepQuestionarioProps = Pick<
  ReturnType<typeof useEditProfileForm>,
  | 'highestLevel' | 'setHighestLevel'
  | 'yearsPlaying' | 'setYearsPlaying'
  | 'weeklyFrequency' | 'setWeeklyFrequency'
  | 'pace' | 'setPace' | 'shooting' | 'setShooting' | 'passing' | 'setPassing'
  | 'dribbling' | 'setDribbling' | 'defense' | 'setDefense' | 'physical' | 'setPhysical'
>;

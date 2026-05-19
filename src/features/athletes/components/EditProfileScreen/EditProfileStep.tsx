import React, { memo } from 'react';
import StepCadastro from '../StepCadastro';
import StepDisponibilidade from '../StepDisponibilidade';
import StepQuestionario from '../StepQuestionario';
import { useEditProfileForm } from '../../hooks/useEditProfileForm';

type Props = {
  form: ReturnType<typeof useEditProfileForm>;
};

function EditProfileStepComponent({ form }: Props) {
  if (form.step === 0) return <StepCadastro {...form} />;
  if (form.step === 2) return <StepDisponibilidade {...form} />;

  return (
    <StepQuestionario
      highestLevel={form.highestLevel} setHighestLevel={form.setHighestLevel}
      yearsPlaying={form.yearsPlaying} setYearsPlaying={form.setYearsPlaying}
      weeklyFrequency={form.weeklyFrequency} setWeeklyFrequency={form.setWeeklyFrequency}
      pace={form.pace} setPace={form.setPace}
      shooting={form.shooting} setShooting={form.setShooting}
      passing={form.passing} setPassing={form.setPassing}
      dribbling={form.dribbling} setDribbling={form.setDribbling}
      defense={form.defense} setDefense={form.setDefense}
      physical={form.physical} setPhysical={form.setPhysical}
    />
  );
}

export const EditProfileStep = memo(EditProfileStepComponent);

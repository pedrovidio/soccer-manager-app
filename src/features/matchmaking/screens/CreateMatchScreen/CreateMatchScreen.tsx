import React from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { CancelMatchModal } from './CancelMatchModal';
import { CreateMatchHeader } from './CreateMatchHeader';
import { DangerZone } from './DangerZone';
import { DateTimeFields } from './DateTimeFields';
import { LocationField } from './LocationField';
import { MatchTypeSelector } from './MatchTypeSelector';
import { RecurringToggle } from './RecurringToggle';
import { styles } from './styles';
import { SubmitButton } from './SubmitButton';
import { useCreateMatchScreen } from './useCreateMatchScreen';
import { VacancyFields } from './VacancyFields';

export default function CreateMatchScreen() {
  const form = useCreateMatchScreen();

  return (
    <SafeAreaView style={styles.safe}>
      <CreateMatchHeader isEditing={form.isEditing} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <MatchTypeSelector value={form.type} onChange={form.handleTypeChange} />
        <DateTimeFields
          date={form.date}
          showDatePicker={form.showDatePicker}
          showTimePicker={form.showTimePicker}
          onDatePress={() => form.setShowDatePicker(true)}
          onTimePress={() => form.setShowTimePicker(true)}
          onDateChange={form.onDateChange}
          onTimeChange={form.onTimeChange}
        />
        <LocationField
          value={form.location}
          coords={form.coords}
          onChange={form.setLocation}
          onSelect={form.handlePlaceSelect}
        />
        <VacancyFields
          totalVacancies={form.totalVacancies}
          reserveVacancies={form.reserveVacancies}
          typeLabel={form.selectedType?.label ?? 'partida'}
          suggestedVacancies={form.selectedType?.vacancies ?? 0}
          onTotalChange={form.setTotalVacancies}
          onReserveChange={form.setReserveVacancies}
        />
        <RecurringToggle
          date={form.date}
          value={form.isRecurring}
          onToggle={() => form.setIsRecurring((value) => !value)}
        />

        <View style={styles.topSpacer} />
        <SubmitButton isEditing={form.isEditing} isPending={form.isPending} onPress={form.handleSubmit} />

        {form.canCancelMatch && (
          <DangerZone
            isRecurring={form.isRecurring}
            isPending={form.cancelMatchMutation.isPending}
            onCancel={form.openCancel}
          />
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {form.cancelMode && (
        <CancelMatchModal
          mode={form.cancelMode}
          reason={form.cancelReason}
          isPending={form.cancelMatchMutation.isPending}
          onReasonChange={form.setCancelReason}
          onClose={form.closeCancel}
          onConfirm={form.confirmCancel}
        />
      )}
    </SafeAreaView>
  );
}

import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { CreateGroupHeader } from './CreateGroupHeader';
import { GroupConfigStep } from './GroupConfigStep';
import { InviteAthletesStep } from './InviteAthletesStep';
import { styles } from './styles';
import { useCreateGroupScreen } from './useCreateGroupScreen';

export function CreateGroupScreen() {
  const controller = useCreateGroupScreen();

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <CreateGroupHeader step={controller.step} onBack={controller.handleBack} />
        {controller.step === 1 ? (
          <GroupConfigStep
            form={controller.form}
            onChange={controller.updateField}
            onNext={controller.goToInvites}
          />
        ) : (
          <InviteAthletesStep
            query={controller.query}
            results={controller.results}
            selected={controller.selected}
            searching={controller.searching}
            submitting={controller.submitting}
            onSearch={controller.handleSearch}
            onToggle={controller.toggleAthlete}
            onRemove={controller.removeSelected}
            onSubmit={controller.handleSubmit}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../../common/theme';
import { GroupForm } from '../GroupForm/GroupForm';
import { EditGroupHeader } from './EditGroupHeader';
import { GroupMemberStats } from './GroupMemberStats';
import { styles } from './styles';
import { useEditGroupScreen } from './useEditGroupScreen';

export function EditGroupScreen() {
  const controller = useEditGroupScreen();

  if (controller.loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <EditGroupHeader groupName={controller.group?.name} isAdmin={controller.isAdmin} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <GroupForm form={controller.form} editable={controller.isAdmin} onChange={controller.updateField} />
          {controller.group && <GroupMemberStats group={controller.group} />}
          {controller.isAdmin && (
            <TouchableOpacity
              style={[styles.btn, controller.saving ? styles.btnDisabled : null]}
              onPress={controller.handleSave}
              disabled={controller.saving}
            >
              {controller.saving
                ? <ActivityIndicator color={Colors.white} />
                : <Text style={styles.btnText}>Salvar alteracoes</Text>}
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

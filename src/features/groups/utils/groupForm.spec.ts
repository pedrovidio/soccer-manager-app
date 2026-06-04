import {
  INITIAL_GROUP_FORM,
  buildCreateGroupPayload,
  buildUpdateGroupPayload,
  validateGroupForm,
} from './groupForm';

describe('groupForm', () => {
  const validForm = {
    ...INITIAL_GROUP_FORM,
    name: 'Pelada Sexta',
    teamNames: ['Casa', 'Fora'],
  };

  it('sends initialCashBalance only when creating a group with a positive value', () => {
    expect(buildCreateGroupPayload({ ...validForm, initialCashBalance: '' }, 'admin-1')).not.toHaveProperty('initialCashBalance');
    expect(buildCreateGroupPayload({ ...validForm, initialCashBalance: '0,00' }, 'admin-1')).not.toHaveProperty('initialCashBalance');
    expect(buildCreateGroupPayload({ ...validForm, initialCashBalance: '123,45' }, 'admin-1')).toMatchObject({
      initialCashBalance: 123.45,
    });
  });

  it('keeps initialCashBalance out of update payloads', () => {
    expect(buildUpdateGroupPayload({ ...validForm, initialCashBalance: '123,45' }, 'admin-1')).not.toHaveProperty('initialCashBalance');
  });

  it('validates the initial cash balance currency input', () => {
    expect(validateGroupForm({ ...validForm, initialCashBalance: '' })).toBeNull();
    expect(validateGroupForm({ ...validForm, initialCashBalance: '0,00' })).toBeNull();
    expect(validateGroupForm({ ...validForm, initialCashBalance: 'abc' })).toBe('Valor ja em caixa deve ser um valor numerico.');
  });
});

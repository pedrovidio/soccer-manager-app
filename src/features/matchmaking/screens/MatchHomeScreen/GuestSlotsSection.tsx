import React, { memo, useCallback } from 'react';
import { ActivityIndicator, FlatList, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@ui/tokens/theme';
import { NearbyAthlete } from '@features/matchmaking/types';
import { s } from '../MatchHomeScreen.styles';
import { GENDER_OPTIONS } from './options';
import { GuestAthleteRow } from './GuestAthleteRow';
import { MatchHomeController } from './types';

type GuestSlotsSectionProps = {
  controller: MatchHomeController;
};

function GuestSlotsSectionComponent({ controller }: GuestSlotsSectionProps) {
  const {
    closeGuestMutation,
    data,
    gender,
    guestOpen,
    guestVacancies,
    isAdmin,
    maxAge,
    minAge,
    minOverall,
    nameSearch,
    nearby,
    openGuestMutation,
    radiusKm,
    selectedSpotAthleteIds,
    selectedSpotAthletesCount,
    selectedVisibleCount,
    setGender,
    setGuestOpen,
    setGuestVacancies,
    setMaxAge,
    setMinAge,
    setMinOverall,
    setNameSearch,
    setRadiusKm,
    toggleFavoriteMutation,
    toggleSpotSelection,
  } = controller;

  const renderGender = useCallback(({ item }: { item: typeof GENDER_OPTIONS[number] }) => (
    <TouchableOpacity
      style={[s.genderChip, gender === item.value && s.genderChipActive]}
      onPress={() => setGender(item.value)}
      activeOpacity={0.7}
    >
      <Text style={[s.genderChipText, gender === item.value && s.genderChipTextActive]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  ), [gender, setGender]);

  const renderAthlete = useCallback(({ item }: { item: NearbyAthlete }) => (
    <GuestAthleteRow
      athlete={item}
      isFavoritePending={toggleFavoriteMutation.isPending}
      isSelected={selectedSpotAthleteIds.includes(item.id)}
      onFavorite={(athlete) => toggleFavoriteMutation.mutate(athlete)}
      onToggle={toggleSpotSelection}
    />
  ), [selectedSpotAthleteIds, toggleFavoriteMutation, toggleSpotSelection]);

  if (!data || data.status === 'FINISHED' || !isAdmin) return null;

  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Vagas para avulsos</Text>
        <Switch
          value={guestOpen}
          onValueChange={(value) => {
            setGuestOpen(value);
            if (!value && data.guestConfig) closeGuestMutation.mutate();
          }}
          trackColor={{ true: Colors.primary }}
          thumbColor={Colors.white}
        />
      </View>

      {guestOpen && (
        <>
          <View style={s.guestFilters}>
            <View style={s.filterRow}>
              <View style={s.flex1}>
                <Text style={s.filterLabel}>Vagas</Text>
                <TextInput
                  style={s.filterInput}
                  value={String(guestVacancies)}
                  onChangeText={(text) => setGuestVacancies(text === '' ? 0 : parseInt(text, 10) || 0)}
                  keyboardType="numeric"
                />
              </View>
              <View style={s.flex1}>
                <Text style={s.filterLabel}>Raio (km)</Text>
                <TextInput
                  style={s.filterInput}
                  value={String(radiusKm)}
                  onChangeText={(text) => setRadiusKm(text === '' ? 0 : parseFloat(text) || 0)}
                  keyboardType="numeric"
                />
              </View>
              <View style={s.flex1}>
                <Text style={s.filterLabel}>OVR min.</Text>
                <TextInput
                  style={s.filterInput}
                  value={String(minOverall)}
                  onChangeText={(text) => setMinOverall(text === '' ? 0 : parseInt(text, 10) || 0)}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={s.filterRow}>
              <View style={s.flex1}>
                <Text style={s.filterLabel}>Idade min.</Text>
                <TextInput
                  style={s.filterInput}
                  value={String(minAge)}
                  onChangeText={(text) => setMinAge(text === '' ? 0 : parseInt(text, 10) || 0)}
                  keyboardType="numeric"
                />
              </View>
              <View style={s.flex1}>
                <Text style={s.filterLabel}>Idade max.</Text>
                <TextInput
                  style={s.filterInput}
                  value={String(maxAge)}
                  onChangeText={(text) => setMaxAge(text === '' ? 0 : parseInt(text, 10) || 0)}
                  keyboardType="numeric"
                />
              </View>
              <View style={s.flex1} />
            </View>

            <Text style={s.filterLabel}>Genero</Text>
            <FlatList
              data={GENDER_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={renderGender}
              horizontal
              scrollEnabled={false}
              contentContainerStyle={s.genderRow}
            />
          </View>

          <View style={s.searchWrap}>
            <Ionicons name="search-outline" size={16} color={Colors.n400} style={s.searchIcon} />
            <TextInput
              style={s.searchInput}
              placeholder="Buscar por nome..."
              placeholderTextColor={Colors.n400}
              value={nameSearch}
              onChangeText={setNameSearch}
              returnKeyType="search"
            />
            {nameSearch.length > 0 && (
              <TouchableOpacity onPress={() => setNameSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color={Colors.n400} />
              </TouchableOpacity>
            )}
          </View>

          <View style={s.athleteCounter}>
            <View style={s.athleteCounterLeft}>
              <Ionicons name="people" size={18} color={Colors.primary} />
              <Text style={s.athleteCounterNum}>{nearby.length}</Text>
              <Text style={s.athleteCounterLabel}>
                atleta{nearby.length !== 1 ? 's' : ''} encontrado{nearby.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <Text style={s.athleteCounterSub}>
              {selectedSpotAthletesCount} selecionado{selectedSpotAthletesCount !== 1 ? 's' : ''}
              {selectedSpotAthletesCount !== selectedVisibleCount ? ` (${selectedVisibleCount} visiveis)` : ''}
            </Text>
          </View>

          {nearby.length === 0 ? (
            <View style={s.emptyCard}>
              <Ionicons name="person-outline" size={32} color={Colors.n300} />
              <Text style={s.emptyText}>Nenhum atleta encontrado com esses filtros</Text>
            </View>
          ) : (
            <FlatList
              data={nearby}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={renderAthlete}
            />
          )}

          <TouchableOpacity
            style={[s.inviteBtn, (openGuestMutation.isPending || selectedSpotAthletesCount === 0) && s.inviteBtnDisabled]}
            onPress={() => openGuestMutation.mutate()}
            disabled={openGuestMutation.isPending || selectedSpotAthletesCount === 0}
            activeOpacity={0.8}
          >
            {openGuestMutation.isPending ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Ionicons name="send-outline" size={16} color={Colors.white} />
                <Text style={s.inviteBtnText}>
                  Convidar {selectedSpotAthletesCount} selecionado{selectedSpotAthletesCount !== 1 ? 's' : ''}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

export const GuestSlotsSection = memo(GuestSlotsSectionComponent);

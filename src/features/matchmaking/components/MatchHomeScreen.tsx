import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Switch, TextInput, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../common/theme';
import { PresenceStatus, Gender } from '../types';
import { BackButton } from '../../common/components/BackButton';
import { phaseLabel } from '../utils/matchPhase';
import { AthleteRatingRow } from './AthleteRatingRow';
import { CounterBadge } from './CounterBadge';
import { PresenceRow } from './PresenceRow';
import { SpotApplicationRow } from './SpotApplicationRow';
import { s } from './MatchHomeScreen.styles';
import { posLabel } from '../utils/formatters';
import { useMatchHomeController } from '../hooks/useMatchHomeController';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'ANY', label: 'Qualquer' },
  { value: 'M',   label: 'Masculino' },
  { value: 'F',   label: 'Feminino' },
];

const PRESENCE_FILTER_LABEL: Record<PresenceStatus, string> = {
  CONFIRMED: 'Confirmados',
  WAITLISTED: 'Na fila de espera',
  DECLINED: 'Recusaram',
  PENDING: 'Pendentes',
};

// Main screen

function teamNameFallback(teamNumber: number) {
  return `Time ${teamNumber}`;
}

export default function MatchHomeScreen() {
  const {
    athleteId,
    data,
    guestOpen,
    guestVacancies,
    isAdmin,
    isError,
    isLoading,
    maxAge,
    minAge,
    minOverall,
    nameSearch,
    nearby,
    presenceFilter,
    radiusKm,
    ratingStars,
    refetch,
    scoreA,
    scoreB,
    selectedSpotAthleteIds,
    selectedSpotAthletesCount,
    selectedVisibleCount,
    finishComment,
    finishModalVisible,
    gender,
    summary,
    cancelPresenceMutation,
    checkInMutation,
    closeGuestMutation,
    confirmCancelPresence,
    finishMatchMutation,
    goToEdit,
    matchmakingMutation,
    openGuestMutation,
    ratingMutation,
    reportSpotPaymentMutation,
    respondSpotApplicationMutation,
    scoreMutation,
    setFinishComment,
    setFinishModalVisible,
    setGender,
    setGuestOpen,
    setGuestVacancies,
    setMaxAge,
    setMinAge,
    setMinOverall,
    setNameSearch,
    setPresenceFilter,
    setRadiusKm,
    setScoreA,
    setScoreB,
    toggleFavoriteMutation,
    toggleSpotSelection,
  } = useMatchHomeController();

  if (isLoading) {
    return (
      <SafeAreaView style={[s.safe, s.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError || !data || !summary) {
    return (
      <SafeAreaView style={[s.safe, s.center]}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
        <Text style={s.errorText}>Erro ao carregar a partida</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => refetch()}>
          <Text style={s.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const {
    date,
    time,
    confirmed,
    waitlisted,
    declined,
    pending,
    spotsLeft,
    pct,
    currentPresence,
    ratableAthletes,
    filteredPresence,
    visibleMatchmakingResult,
    hasVisibleMatchmakingResult,
    minimumConfirmed,
    phase,
    canDrawTeams,
    shouldSuggestSpot,
    pendingSpotApplications,
  } = summary;
  const isFinished = data.status === 'FINISHED';
  const isParticipant = currentPresence?.status === 'CONFIRMED';
  const hasCheckedIn = Boolean(currentPresence?.checkedIn || data.checkedInIds?.includes(athleteId));
  return (
    <SafeAreaView style={s.safe}>

      {/* HEADER */}
      <View style={s.header}>
        <BackButton />
        <View style={s.rowContent}>
          <Text style={s.headerTitle} numberOfLines={1}>{isFinished ? 'Partida encerrada' : 'Proxima partida'}</Text>
          <Text style={s.headerSub}>{data.location} - {date}</Text>
        </View>
        {isAdmin && !isFinished && (
          <TouchableOpacity
            style={s.editBtn}
            onPress={goToEdit}
          >
            <Ionicons name="create-outline" size={20} color={Colors.n700} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

        {/* Info card */}
        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <View style={s.infoItem}>
              <Ionicons name="time-outline" size={18} color={Colors.primary} />
              <Text style={s.infoValue}>{time}</Text>
              <Text style={s.infoLabel}>Horario</Text>
            </View>
            <View style={s.infoDivider} />
            <View style={s.infoItem}>
              <Ionicons name="football-outline" size={18} color={Colors.primary} />
              <Text style={s.infoValue}>{data.type}</Text>
              <Text style={s.infoLabel}>Modalidade</Text>
            </View>
            <View style={s.infoDivider} />
            <View style={s.infoItem}>
              <Ionicons name="people-outline" size={18} color={Colors.primary} />
              <Text style={s.infoValue}>{data.totalVacancies}</Text>
              <Text style={s.infoLabel}>Vagas</Text>
            </View>
          </View>

          <View style={[s.statusBadge, { backgroundColor: phase === 'WAITING_CONFIRMATION' ? Colors.warningLight : Colors.primaryLight }]}>
            <Text style={[s.statusBadgeText, { color: phase === 'WAITING_CONFIRMATION' ? Colors.warningDark : Colors.primary }]}>
              {phaseLabel(phase)}
            </Text>
          </View>

          {/* ADMIN ACTIONS */}
          {isAdmin && !isFinished && data.status !== 'CANCELLED' && (
            <View style={s.adminActionsRow}>
              <TouchableOpacity
                style={[s.actionBtn, s.actionBtnFinish]}
                onPress={() => setFinishModalVisible(true)}
                disabled={finishMatchMutation.isPending}
                activeOpacity={0.7}
              >
                {finishMatchMutation.isPending ? (
                  <ActivityIndicator color={Colors.successDark} size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.successDark} />
                    <Text style={s.actionBtnTextFinish}>Finalizar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Confirmation counters */}
        {!isFinished && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Confirmacoes</Text>
            <View style={s.counterCard}>
              <CounterBadge value={confirmed} label="Confirmados" color={Colors.success} active={presenceFilter === 'CONFIRMED'} onPress={() => setPresenceFilter(presenceFilter === 'CONFIRMED' ? 'ALL' : 'CONFIRMED')} />
              <CounterBadge value={pending}   label="Pendentes"   color={Colors.warning} active={presenceFilter === 'PENDING'} onPress={() => setPresenceFilter(presenceFilter === 'PENDING' ? 'ALL' : 'PENDING')} />
              <CounterBadge value={waitlisted} label="Na fila" color={Colors.primary} active={presenceFilter === 'WAITLISTED'} onPress={() => setPresenceFilter(presenceFilter === 'WAITLISTED' ? 'ALL' : 'WAITLISTED')} />
              <CounterBadge value={declined}  label="Recusaram"   color={Colors.error} active={presenceFilter === 'DECLINED'} onPress={() => setPresenceFilter(presenceFilter === 'DECLINED' ? 'ALL' : 'DECLINED')} />
              <CounterBadge value={spotsLeft} label="Vagas livres" color={Colors.n500} active={false} />
            </View>
            {/* PROGRESS */}
            <View style={s.progressBg}>
              <View style={[s.progressFill, { width: `${pct}%` as any }]} />
            </View>
            <Text style={s.progressLabel}>{confirmed} de {data.totalVacancies} vagas preenchidas - minimo {minimumConfirmed}</Text>
            {shouldSuggestSpot && (
              <View style={s.hintBox}>
                <Ionicons name="person-add-outline" size={16} color={Colors.warningDark} />
                <Text style={s.hintText}>Faltam {Math.max(minimumConfirmed - confirmed, 0)} atleta(s) para confirmar o jogo. Considere convidar avulsos.</Text>
              </View>
            )}
          </View>
        )}

        {hasVisibleMatchmakingResult && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Escalacoes</Text>
            <View style={s.teamsWrap}>
              {visibleMatchmakingResult.teams.map((team) => {
                const isMyTeam = team.athletes.some((athlete) => athlete.id === athleteId);
                return (
                  <View key={team.teamNumber} style={[s.teamBox, isMyTeam && s.myTeamBox]}>
                    <Text style={[s.teamTitle, isMyTeam && s.myTeamTitle]}>
                      {team.name ?? teamNameFallback(team.teamNumber)} - OVR {team.averageOverall}{isMyTeam ? ' - seu time' : ''}
                    </Text>
                    {team.athletes.map((athlete) => (
                      <Text key={athlete.id} style={[s.teamAthlete, athlete.id === athleteId && s.myTeamTitle]}>
                        {athlete.name}{athlete.id === athleteId ? ' (voce)' : ''} - {posLabel(athlete.position)} - {athlete.overall}
                      </Text>
                    ))}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {!isFinished && (isParticipant || isAdmin) && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Acoes da partida</Text>
            <View style={s.matchActionsCard}>
              {isParticipant && data.status !== 'CANCELLED' && (
                <TouchableOpacity
                  style={[s.secondaryActionBtn, s.secondaryActionDanger]}
                  onPress={confirmCancelPresence}
                  disabled={cancelPresenceMutation.isPending}
                  activeOpacity={0.7}
                >
                  <Ionicons name="exit-outline" size={16} color={Colors.errorDark} />
                  <Text style={[s.secondaryActionText, { color: Colors.errorDark }]}>
                    {cancelPresenceMutation.isPending ? 'Cancelando...' : 'Cancelar check-in'}
                  </Text>
                </TouchableOpacity>
              )}

              {isAdmin && data.status !== 'CANCELLED' && (
                <>
                  <View style={s.inlineActionRow}>
                    <TouchableOpacity
                      style={[s.secondaryActionBtn, { flex: 1 }]}
                      onPress={() => matchmakingMutation.mutate()}
                      disabled={!canDrawTeams || matchmakingMutation.isPending}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="shuffle-outline" size={16} color={Colors.primary} />
                      <Text style={s.secondaryActionText}>{canDrawTeams ? 'Sortear times' : 'Aguardando minimo'}</Text>
                    </TouchableOpacity>
                  </View>

                  {false && hasVisibleMatchmakingResult && (
                    <View style={s.teamsWrap}>
                      <Text style={s.teamsDiff}>Diferenca OVR: {visibleMatchmakingResult.overallDifference}</Text>
                      {visibleMatchmakingResult!.teams.map((team) => (
                        <View key={team.teamNumber} style={s.teamBox}>
                          <Text style={s.teamTitle}>
                            {team.name ?? teamNameFallback(team.teamNumber)} - OVR {team.averageOverall}
                          </Text>
                          {team.athletes.map((athlete) => (
                            <Text key={athlete.id} style={s.teamAthlete}>
                              {athlete.name} - {posLabel(athlete.position)} - {athlete.overall}
                            </Text>
                          ))}
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        )}

        {isParticipant && isFinished && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Pos-jogo</Text>
            <View style={s.matchActionsCard}>
              <Text style={s.filterLabel}>Registrar placar</Text>
              <View style={s.inlineActionRow}>
                <TextInput style={[s.filterInput, { flex: 1 }]} value={scoreA} onChangeText={setScoreA} keyboardType="numeric" placeholder="Time 1" />
                <TextInput style={[s.filterInput, { flex: 1 }]} value={scoreB} onChangeText={setScoreB} keyboardType="numeric" placeholder="Time 2" />
                <TouchableOpacity style={s.smallPrimaryBtn} onPress={() => scoreMutation.mutate()} disabled={scoreMutation.isPending}>
                  <Text style={s.smallPrimaryText}>Salvar</Text>
                </TouchableOpacity>
              </View>

              <Text style={[s.filterLabel, { marginTop: 12 }]}>Avaliar atletas</Text>
              <FlatList
                data={ratableAthletes}
                keyExtractor={(athlete) => athlete.athleteId}
                scrollEnabled={false}
                renderItem={({ item: athlete }) => (
                  <AthleteRatingRow
                    name={athlete.name}
                    position={posLabel(athlete.position)}
                    overall={athlete.overall}
                    value={ratingStars[athlete.athleteId]}
                    disabled={ratingMutation.isPending}
                    onRate={(stars) => ratingMutation.mutate({ evaluatedAthleteId: athlete.athleteId, stars })}
                  />
                )}
              />

            </View>
          </View>
        )}

        {!isAdmin && isFinished && data.mySpotPayment?.status === 'PENDING' && (
          <View style={s.section}>
            <View style={s.paymentCard}>
              <View style={s.rowContent}>
                <Text style={s.paymentTitle}>Pagamento do avulso</Text>
                <Text style={s.paymentText}>
                  {`Valor: R$ ${data.mySpotPayment.amount.toFixed(2).replace('.', ',')}`}
                </Text>
              </View>
              <TouchableOpacity
                style={[s.paymentBtn, reportSpotPaymentMutation.isPending && s.inviteBtnDisabled]}
                onPress={() => reportSpotPaymentMutation.mutate()}
                disabled={reportSpotPaymentMutation.isPending}
                activeOpacity={0.7}
              >
                {reportSpotPaymentMutation.isPending
                  ? <ActivityIndicator color={Colors.white} size="small" />
                  : <Text style={s.paymentBtnText}>
                      {data.mySpotPayment.paymentReportedAt ? 'Reenviar aviso' : 'Informar pagamento'}
                    </Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!isFinished && isAdmin && pendingSpotApplications.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Candidaturas pendentes</Text>
            <FlatList
              data={pendingSpotApplications}
              keyExtractor={(application) => application.id}
              scrollEnabled={false}
              renderItem={({ item: application }) => (
                <SpotApplicationRow
                  item={application}
                  isPending={respondSpotApplicationMutation.isPending && respondSpotApplicationMutation.variables?.applicationId === application.id}
                  onAccept={() => respondSpotApplicationMutation.mutate({ applicationId: application.id, accept: true })}
                  onDecline={() => respondSpotApplicationMutation.mutate({ applicationId: application.id, accept: false })}
                />
              )}
            />
          </View>
        )}

        {/* Presence list */}
        {!isFinished && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{presenceFilter === 'ALL' ? 'Lista de presenca' : PRESENCE_FILTER_LABEL[presenceFilter]}</Text>
            {filteredPresence.length === 0 ? (
              <View style={s.emptyCard}>
                <Text style={s.emptyText}>Nenhum atleta encontrado</Text>
              </View>
            ) : (
              <FlatList
                data={filteredPresence}
                keyExtractor={(item) => item.athleteId}
                scrollEnabled={false}
                renderItem={({ item }) => <PresenceRow item={item} />}
              />
            )}
          </View>
        )}

        {/* Guest slots */}
        {!isFinished && isAdmin && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Vagas para avulsos</Text>
              <Switch
                value={guestOpen}
                onValueChange={(v) => {
                  setGuestOpen(v);
                  if (!v && data.guestConfig) closeGuestMutation.mutate();
                }}
                trackColor={{ true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            {guestOpen && (
              <>
                {/* FILTROS */}
                <View style={s.guestFilters}>
                  <View style={s.filterRow}>
                    <View style={s.flex1}>
                      <Text style={s.filterLabel}>Vagas</Text>
                      <TextInput style={s.filterInput} value={guestVacancies} onChangeText={setGuestVacancies} keyboardType="numeric" />
                    </View>
                    <View style={s.flex1}>
                      <Text style={s.filterLabel}>Raio (km)</Text>
                      <TextInput style={s.filterInput} value={radiusKm} onChangeText={setRadiusKm} keyboardType="numeric" />
                    </View>
                    <View style={s.flex1}>
                      <Text style={s.filterLabel}>OVR min.</Text>
                      <TextInput style={s.filterInput} value={minOverall} onChangeText={setMinOverall} keyboardType="numeric" />
                    </View>
                  </View>
                  <View style={s.filterRow}>
                    <View style={s.flex1}>
                      <Text style={s.filterLabel}>Idade min.</Text>
                      <TextInput style={s.filterInput} value={minAge} onChangeText={setMinAge} keyboardType="numeric" />
                    </View>
                    <View style={s.flex1}>
                      <Text style={s.filterLabel}>Idade max.</Text>
                      <TextInput style={s.filterInput} value={maxAge} onChangeText={setMaxAge} keyboardType="numeric" />
                    </View>
                    <View style={s.flex1} />
                  </View>

                  {/* Gender */}
                  <Text style={s.filterLabel}>Genero</Text>
                  <View style={s.genderRow}>
                    {GENDER_OPTIONS.map((g) => (
                      <TouchableOpacity
                        key={g.value}
                        style={[s.genderChip, gender === g.value && s.genderChipActive]}
                        onPress={() => setGender(g.value)}
                        activeOpacity={0.7}
                      >
                        <Text style={[s.genderChipText, gender === g.value && s.genderChipTextActive]}>
                          {g.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* BUSCA POR NOME */}
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

                {/* CONTADOR DE ATLETAS */}
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

                {/* LISTA DE ATLETAS DISPONIVEIS */}
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
                    renderItem={({ item: a }) => {
                      const isSelected = selectedSpotAthleteIds.includes(a.id);
                      return (
                        <TouchableOpacity
                          style={[s.guestRow, isSelected && s.guestRowSelected]}
                          onPress={() => toggleSpotSelection(a.id)}
                          activeOpacity={0.75}
                        >
                          <View style={[s.selectCircle, isSelected && s.selectCircleActive]}>
                            {isSelected && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                          </View>
                          <View style={s.guestAvatar}>
                            <Text style={s.guestAvatarText}>{(a.name ?? '??').slice(0, 2).toUpperCase()}</Text>
                          </View>
                          <View style={s.rowContent}>
                            <Text style={s.guestName}>{a.name}</Text>
                            <Text style={s.guestSub}>{posLabel(a.position ?? '')} - {a.age} anos - {a.gender === 'M' ? 'Masc.' : 'Fem.'}</Text>
                          </View>
                          <View style={[s.ovrBadge, a.overall >= 70 ? s.ovrHigh : a.overall >= 50 ? s.ovrMid : s.ovrLow]}>
                            <Text style={s.ovrText}>{a.overall}</Text>
                          </View>
                          <TouchableOpacity
                            style={[s.favoriteBtn, a.isFavorite && s.favoriteBtnActive]}
                            onPress={(event) => {
                              event.stopPropagation();
                              toggleFavoriteMutation.mutate(a);
                            }}
                            disabled={toggleFavoriteMutation.isPending}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name={a.isFavorite ? 'star' : 'star-outline'}
                              size={18}
                              color={a.isFavorite ? Colors.warningDark : Colors.n400}
                            />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}

                {/* Invite button */}
                <TouchableOpacity
                  style={[s.inviteBtn, (openGuestMutation.isPending || selectedSpotAthletesCount === 0) && s.inviteBtnDisabled]}
                  onPress={() => openGuestMutation.mutate()}
                  disabled={openGuestMutation.isPending || selectedSpotAthletesCount === 0}
                  activeOpacity={0.8}
                >
                  {openGuestMutation.isPending
                    ? <ActivityIndicator color={Colors.white} size="small" />
                    : <>
                        <Ionicons name="send-outline" size={16} color={Colors.white} />
                        <Text style={s.inviteBtnText}>
                          Convidar {selectedSpotAthletesCount} selecionado{selectedSpotAthletesCount !== 1 ? 's' : ''}
                        </Text>
                      </>
                  }
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

      </ScrollView>

      {/* MODAL FINALIZAR JOGO */}
      {finishModalVisible && (
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Finalizar Jogo</Text>
            <Text style={s.modalSubtitle}>Voce pode adicionar uma observacao (opcional)</Text>

            <TextInput
              style={s.modalInput}
              placeholder="Observacao (max. 500 caracteres)"
              placeholderTextColor={Colors.n400}
              value={finishComment}
              onChangeText={setFinishComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={s.modalCharCount}>{finishComment.length}/500</Text>

            <View style={s.modalButtonRow}>
              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnSecondary]}
                onPress={() => {
                  setFinishModalVisible(false);
                  setFinishComment('');
                }}
                disabled={finishMatchMutation.isPending}
              >
                <Text style={s.modalBtnTextSecondary}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnPrimary]}
                onPress={() => finishMatchMutation.mutate()}
                disabled={finishComment.length > 500 || finishMatchMutation.isPending}
              >
                {finishMatchMutation.isPending ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={s.modalBtnTextPrimary}>Finalizar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

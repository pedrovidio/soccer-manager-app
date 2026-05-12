import React from 'react';
import { FlatList, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProfileLogic } from '../../hooks/useProfileLogic';
import { ProfileHistoryItem } from '../../types/profile.types';

export const ProfileView = () => {
  const { data, isLoading, isError, refetch, isRefetching, handleLogout } = useProfileLogic();

  if (isLoading) {
    return (
      <View className="flex-1 bg-neutral-50 p-4 pt-16">
        <View className="h-24 bg-neutral-200 rounded-3xl mb-4 animate-pulse" />
        <View className="h-32 bg-neutral-200 rounded-3xl mb-8 animate-pulse" />
        <View className="flex-1 bg-neutral-200 rounded-3xl animate-pulse" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 bg-neutral-50 justify-center items-center p-6">
        <Text className="text-xl font-bold text-neutral-800 mb-2">Erro ao carregar</Text>
        <Text className="text-neutral-500 text-center mb-6">Não foi possível carregar seu perfil.</Text>
        <TouchableOpacity onPress={() => refetch()} className="bg-emerald-600 px-6 py-4 rounded-xl">
          <Text className="text-white font-bold">Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderHistoryItem = ({ item }: { item: ProfileHistoryItem }) => (
    <View className="bg-white p-4 rounded-2xl mb-3 border border-neutral-100 shadow-sm">
      <Text className="text-neutral-800 font-bold mb-1">
        {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
      </Text>
      <Text className="text-neutral-500 text-xs mb-2">{item.location}</Text>
      <View className="self-start bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
        <Text className="text-neutral-600 text-xs font-bold uppercase">{item.status}</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-neutral-50 pt-12 px-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-black text-neutral-800">Perfil</Text>
        <TouchableOpacity onPress={handleLogout} className="p-2 bg-red-50 rounded-full border border-red-100">
          <MaterialCommunityIcons name="logout" size={20} color="#dc2626" />
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <View className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100 mb-4 flex-row items-center">
        <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mr-4 border-2 border-emerald-200">
          <Text className="text-2xl font-black text-emerald-700">{data.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-neutral-800">{data.name}</Text>
          <Text className="text-neutral-500 text-sm mb-1" numberOfLines={1}>{data.email}</Text>
          <View className="flex-row gap-2">
            <View className="bg-emerald-50 px-2 py-1 rounded-md">
              <Text className="text-emerald-700 text-[10px] font-black uppercase">{data.preferredPosition}</Text>
            </View>
            <View className="bg-emerald-50 px-2 py-1 rounded-md">
              <Text className="text-emerald-700 text-[10px] font-black uppercase">OVR {data.overall}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Finance Card */}
      <View className={`p-6 rounded-3xl shadow-sm border mb-6 ${data.financialDebt > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
        <View className="flex-row justify-between items-start mb-2">
          <Text className={`font-bold ${data.financialDebt > 0 ? 'text-red-700' : 'text-emerald-700'}`}>Status Financeiro</Text>
          <MaterialCommunityIcons name={data.financialDebt > 0 ? "alert-circle" : "check-circle"} size={24} color={data.financialDebt > 0 ? "#b91c1c" : "#047857"} />
        </View>
        <Text className={`text-4xl font-black ${data.financialDebt > 0 ? 'text-red-800' : 'text-emerald-800'}`}>
          {data.financialDebt > 0 ? `R$ ${data.financialDebt.toFixed(2)}` : 'Regular'}
        </Text>
        {data.financialDebt > 0 && (
          <Text className="text-red-600 text-xs mt-2 font-medium">Você possui débitos pendentes. Marketplace e convites bloqueados.</Text>
        )}
      </View>

      {/* History List */}
      <Text className="text-lg font-bold text-neutral-800 mb-3">Histórico de Partidas</Text>
      
      <View className="flex-1">
        <FlatList
          data={data.history}
          renderItem={renderHistoryItem}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={<Text className="text-neutral-500 text-center mt-4">Você ainda não tem histórico de partidas.</Text>}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </View>
  );
};

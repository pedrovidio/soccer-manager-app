import React, { memo } from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { styles } from './styles';

type Props = {
  query: string;
  searching: boolean;
  onSearch: (text: string) => void;
};

function SearchBarComponent({ query, searching, onSearch }: Props) {
  return (
    <View style={styles.searchWrap}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Arena.neon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome..."
          placeholderTextColor={Arena.textSubtle}
          value={query}
          onChangeText={onSearch}
          autoFocus
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searching && <ActivityIndicator size="small" color={Arena.neon} />}
      </View>
    </View>
  );
}

export const SearchBar = memo(SearchBarComponent);

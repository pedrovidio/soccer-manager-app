import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius } from '../tokens/theme';

export interface PlaceResult {
  description: string;
  lat: number;
  lng: number;
}

interface Props {
  value: string;
  onSelect: (place: PlaceResult) => void;
  onChange: (text: string) => void;
  placeholder?: string;
}

export function PlacesAutocomplete({ value, onSelect, onChange, placeholder }: Props) {
  const [query, setQuery]             = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [loading, setLoading]         = useState(false);
  const [showList, setShowList]       = useState(false);
  const debounceRef                   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value && value !== query) setQuery(value);
  }, [value]);

  function handleChange(text: string) {
    setQuery(text);
    onChange(text);
    setSuggestions([]);
    setShowList(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.length < 3) return;
    debounceRef.current = setTimeout(() => fetchSuggestions(text), 500);
  }

  async function fetchSuggestions(input: string) {
    setLoading(true);
    try {
      const url =
        `https://nominatim.openstreetmap.org/search` +
        `?q=${encodeURIComponent(input)}` +
        `&format=json&addressdetails=1&limit=5&countrycodes=br&accept-language=pt-BR`;
      const res  = await fetch(url, { headers: { 'User-Agent': 'SoccerManagerApp/1.0' } });
      const json: any[] = await res.json();
      setSuggestions(
        json.map((item) => ({
          description: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }))
      );
      setShowList(true);
    } catch {}
    setLoading(false);
  }

  function handleSelect(item: PlaceResult) {
    setQuery(item.description);
    onChange(item.description);
    setSuggestions([]);
    setShowList(false);
    onSelect(item);
  }

  function handleClear() {
    setQuery('');
    onChange('');
    setSuggestions([]);
    setShowList(false);
  }

  return (
    <View style={s.wrap}>
      <View style={s.inputRow}>
        <Ionicons name="location-outline" size={16} color={Colors.primary} />
        <TextInput
          style={s.input}
          value={query}
          onChangeText={handleChange}
          placeholder={placeholder ?? 'Buscar quadra ou endereço...'}
          placeholderTextColor={Colors.n400}
          returnKeyType="search"
          onBlur={() => setTimeout(() => setShowList(false), 200)}
        />
        {loading
          ? <ActivityIndicator size="small" color={Colors.primary} />
          : query.length > 0 && (
              <TouchableOpacity onPress={handleClear} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={Colors.n400} />
              </TouchableOpacity>
            )
        }
      </View>

      {showList && (
        <View style={s.list}>
          {suggestions.length === 0 && !loading ? (
            <View style={s.item}>
              <Text style={s.emptyText}>Nenhum resultado encontrado</Text>
            </View>
          ) : (
            suggestions.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[s.item, i === suggestions.length - 1 && s.itemLast]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="location-outline" size={14} color={Colors.n500} style={{ marginTop: 2 }} />
                <Text style={s.itemText} numberOfLines={2}>{item.description}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap:      { zIndex: 10 },
  inputRow:  {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.n300,
    borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 10,
  },
  input:     { flex: 1, fontSize: 14, color: Colors.n900, padding: 0 },
  list:      {
    position: 'absolute', top: '100%', left: 0, right: 0,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.n200,
    borderRadius: Radius.r8, marginTop: 4,
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8,
    zIndex: 20,
  },
  item:      {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: Colors.n200,
  },
  itemLast:  { borderBottomWidth: 0 },
  itemText:  { flex: 1, fontSize: 13, color: Colors.n800, lineHeight: 18 },
  emptyText: { fontSize: 13, color: Colors.n400 },
});

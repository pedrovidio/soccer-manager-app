import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { PlacesAutocomplete, PlaceResult } from '@ui/composites/PlacesAutocomplete';
import { MatchCoords } from './types';
import { styles } from './styles';

type LocationFieldProps = {
  value: string;
  coords: MatchCoords;
  onChange: (value: string) => void;
  onSelect: (place: PlaceResult) => void;
};

function LocationFieldComponent({ value, coords, onChange, onSelect }: LocationFieldProps) {
  return (
    <>
      <Text style={styles.label}>Local</Text>
      <PlacesAutocomplete value={value} onChange={onChange} onSelect={onSelect} />
      {coords.latitude !== 0 && (
        <View style={styles.coordsRow}>
          <Ionicons name="checkmark-circle" size={13} color={Arena.success} />
          <Text style={styles.coordsText}>Localização confirmada</Text>
        </View>
      )}
    </>
  );
}

export const LocationField = memo(LocationFieldComponent);

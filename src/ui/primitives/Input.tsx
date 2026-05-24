import React, { memo } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { Colors } from '../tokens/theme';
import { styles } from './styles';

function InputComponent({ style, placeholderTextColor = Colors.n400, ...props }: TextInputProps) {
  return <TextInput style={[styles.input, style]} placeholderTextColor={placeholderTextColor} {...props} />;
}

export const Input = memo(InputComponent);

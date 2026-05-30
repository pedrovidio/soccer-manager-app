import React, { memo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { Arena, Colors } from '../tokens/theme';
import { styles } from './styles';

type ButtonVariant = 'primary' | 'secondary' | 'text';

type ButtonProps = Omit<TouchableOpacityProps, 'children'> & {
  title: string;
  loading?: boolean;
  variant?: ButtonVariant;
};

function ButtonComponent({
  title,
  loading = false,
  variant = 'primary',
  disabled = false,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'text' && styles.buttonText,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Arena.bgDeep : Arena.neon} />
      ) : (
        <Text
          style={[
            styles.buttonLabel,
            variant === 'secondary' && styles.buttonSecondaryLabel,
            variant === 'text' && styles.buttonTextLabel,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export const Button = memo(ButtonComponent);

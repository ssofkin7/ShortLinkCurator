import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from './theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary[600],
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary[100],
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.primary[600],
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      case 'danger':
        return {
          backgroundColor: colors.error[500],
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: colors.primary[600],
          borderWidth: 0,
        };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return colors.white;
      case 'secondary':
        return colors.gray[800];
      case 'outline':
        return colors.primary[600];
      case 'ghost':
        return colors.primary[600];
      case 'danger':
        return colors.white;
      default:
        return colors.white;
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
          borderRadius: borderRadius.sm,
        };
      case 'md':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderRadius: borderRadius.md,
        };
      case 'lg':
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          borderRadius: borderRadius.md,
        };
      default:
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderRadius: borderRadius.md,
        };
    }
  };

  const getTextSize = (): TextStyle => {
    switch (size) {
      case 'sm':
        return {
          fontSize: typography.fontSizes.sm,
        };
      case 'md':
        return {
          fontSize: typography.fontSizes.md,
        };
      case 'lg':
        return {
          fontSize: typography.fontSizes.lg,
        };
      default:
        return {
          fontSize: typography.fontSizes.md,
        };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.contentContainer}>
        {leftIcon && !loading && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        {loading ? (
          <ActivityIndicator
            size="small"
            color={getTextColor()}
            style={styles.spinner}
          />
        ) : (
          <Text
            style={[
              styles.text,
              getTextSize(),
              { color: getTextColor() },
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
        
        {rightIcon && !loading && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
  leftIcon: {
    marginRight: spacing.xs,
  },
  rightIcon: {
    marginLeft: spacing.xs,
  },
  spinner: {
    marginHorizontal: spacing.xs,
  },
});
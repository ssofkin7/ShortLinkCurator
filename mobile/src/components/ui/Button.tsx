import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from './theme';

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
  const getBackgroundColor = () => {
    if (disabled) return colors.gray[300];
    
    switch (variant) {
      case 'primary':
        return colors.primary[600];
      case 'secondary':
        return colors.gray[200];
      case 'outline':
      case 'ghost':
        return 'transparent';
      case 'danger':
        return colors.error[500];
      default:
        return colors.primary[600];
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.gray[500];
    
    switch (variant) {
      case 'primary':
        return 'white';
      case 'secondary':
        return colors.gray[800];
      case 'outline':
        return colors.primary[600];
      case 'ghost':
        return colors.primary[600];
      case 'danger':
        return 'white';
      default:
        return 'white';
    }
  };

  const getBorderColor = () => {
    if (disabled) return colors.gray[300];
    
    switch (variant) {
      case 'outline':
        return colors.primary[600];
      default:
        return 'transparent';
    }
  };

  const getSizeStyles = (): { 
    buttonHeight: number; 
    buttonPadding: { paddingHorizontal: number }; 
    fontSize: number 
  } => {
    switch (size) {
      case 'sm':
        return {
          buttonHeight: 32,
          buttonPadding: { paddingHorizontal: spacing.md },
          fontSize: typography.fontSizes.sm,
        };
      case 'lg':
        return {
          buttonHeight: 52,
          buttonPadding: { paddingHorizontal: spacing.xl },
          fontSize: typography.fontSizes.lg,
        };
      case 'md':
      default:
        return {
          buttonHeight: 44,
          buttonPadding: { paddingHorizontal: spacing.lg },
          fontSize: typography.fontSizes.md,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          height: sizeStyles.buttonHeight,
          width: fullWidth ? '100%' : undefined,
        },
        sizeStyles.buttonPadding,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: sizeStyles.fontSize,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.fontWeights.medium as any,
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: spacing.xs,
  },
  rightIcon: {
    marginLeft: spacing.xs,
  },
});
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  View
} from 'react-native';
import { colors, typography, borderRadius, spacing } from './theme';

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
  
  // Get variant styles
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
          indicator: '#fff',
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
          indicator: colors.primary[500],
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
          indicator: colors.primary[500],
        };
      case 'ghost':
        return {
          container: styles.ghostContainer,
          text: styles.ghostText,
          indicator: colors.primary[500],
        };
      case 'danger':
        return {
          container: styles.dangerContainer,
          text: styles.dangerText,
          indicator: '#fff',
        };
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
          indicator: '#fff',
        };
    }
  };

  // Get size styles
  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return {
          container: styles.smallContainer,
          text: styles.smallText,
          iconSize: 16,
        };
      case 'md':
        return {
          container: styles.mediumContainer,
          text: styles.mediumText,
          iconSize: 20,
        };
      case 'lg':
        return {
          container: styles.largeContainer,
          text: styles.largeText,
          iconSize: 24,
        };
      default:
        return {
          container: styles.mediumContainer,
          text: styles.mediumText,
          iconSize: 20,
        };
    }
  };

  const variantStyle = getVariantStyle();
  const sizeStyle = getSizeStyle();
  
  const containerStyles = [
    styles.baseContainer,
    variantStyle.container,
    sizeStyle.container,
    fullWidth && styles.fullWidth,
    disabled && styles.disabledContainer,
    style,
  ];
  
  const textStyles = [
    styles.baseText,
    variantStyle.text,
    sizeStyle.text,
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        {leftIcon && !loading && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        {loading ? (
          <ActivityIndicator color={variantStyle.indicator} size="small" />
        ) : (
          <Text style={textStyles}>{title}</Text>
        )}
        
        {rightIcon && !loading && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  baseText: {
    fontWeight: typography.fontWeights.semibold as any,
    textAlign: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconContainer: {
    marginRight: spacing.xs,
  },
  rightIconContainer: {
    marginLeft: spacing.xs,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Variant styles
  primaryContainer: {
    backgroundColor: colors.primary[500],
  },
  primaryText: {
    color: '#fff',
  },
  secondaryContainer: {
    backgroundColor: colors.primary[100],
  },
  secondaryText: {
    color: colors.primary[700],
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  outlineText: {
    color: colors.primary[500],
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: colors.primary[500],
  },
  dangerContainer: {
    backgroundColor: colors.error,
  },
  dangerText: {
    color: '#fff',
  },
  
  // Size styles
  smallContainer: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  smallText: {
    fontSize: typography.fontSizes.sm,
  },
  mediumContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  mediumText: {
    fontSize: typography.fontSizes.md,
  },
  largeContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  largeText: {
    fontSize: typography.fontSizes.lg,
  },
  
  // Disabled styles
  disabledContainer: {
    backgroundColor: colors.gray[200],
    borderColor: colors.gray[300],
  },
  disabledText: {
    color: colors.gray[500],
  },
});
import React, { ReactNode } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  Platform,
  StyleProp,
  ViewStyle,
  ImageSourcePropType,
  ImageResizeMode,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from './theme';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'elevated' | 'outlined' | 'filled';
}

export const Card = ({
  children,
  onPress,
  onLongPress,
  style,
  variant = 'elevated',
}: CardProps) => {
  const getCardStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.white,
          ...shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.gray[200],
        };
      case 'filled':
        return {
          backgroundColor: colors.gray[50],
        };
      default:
        return {
          backgroundColor: colors.white,
          ...shadows.md,
        };
    }
  };

  const Container = onPress || onLongPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.card, getCardStyles(), style]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
};

interface CardHeaderProps {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  leftAccessory?: ReactNode;
  rightAccessory?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const CardHeader = ({
  children,
  title,
  subtitle,
  leftAccessory,
  rightAccessory,
  style,
}: CardHeaderProps) => {
  return (
    <View style={[styles.header, style]}>
      {children || (
        <>
          {leftAccessory && <View style={styles.leftAccessory}>{leftAccessory}</View>}
          <View style={styles.headerTextContainer}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {rightAccessory && <View style={styles.rightAccessory}>{rightAccessory}</View>}
        </>
      )}
    </View>
  );
};

interface CardImageProps {
  source: { uri: string } | number;
  height?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

export const CardImage = ({
  source,
  height = 200,
  resizeMode = 'cover',
}: CardImageProps) => {
  return (
    <Image
      source={source}
      style={[styles.image, { height }]}
      resizeMode={resizeMode}
    />
  );
};

interface CardContentProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const CardContent = ({ children, style }: CardContentProps) => {
  return <View style={[styles.content, style]}>{children}</View>;
};

interface CardFooterProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const CardFooter = ({ children, style }: CardFooterProps) => {
  return <View style={[styles.footer, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginVertical: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  headerTextContainer: {
    flex: 1,
  },
  leftAccessory: {
    marginRight: spacing.sm,
  },
  rightAccessory: {
    marginLeft: spacing.sm,
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '600',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[500],
    marginTop: spacing.xs / 2,
  },
  image: {
    width: '100%',
  },
  content: {
    padding: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
});
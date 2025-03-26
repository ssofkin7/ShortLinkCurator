import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { colors, spacing, borderRadius, shadows, typography } from './theme';

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
  const getCardStyle = () => {
    switch (variant) {
      case 'elevated':
        return [
          styles.card,
          styles.elevatedCard,
          style,
        ];
      case 'outlined':
        return [
          styles.card,
          styles.outlinedCard,
          style,
        ];
      case 'filled':
        return [
          styles.card,
          styles.filledCard,
          style,
        ];
      default:
        return [styles.card, styles.elevatedCard, style];
    }
  };

  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        style={getCardStyle()}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={getCardStyle()}>{children}</View>;
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
      {children ? (
        children
      ) : (
        <>
          <View style={styles.headerLeftContainer}>
            {leftAccessory && <View style={styles.leftAccessory}>{leftAccessory}</View>}
            <View style={styles.headerTextContainer}>
              {title && <Text style={styles.headerTitle}>{title}</Text>}
              {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
            </View>
          </View>
          {rightAccessory && <View>{rightAccessory}</View>}
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
    <View style={styles.imageContainer}>
      <Image
        source={source}
        style={[styles.image, { height, resizeMode }]}
      />
    </View>
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
    marginVertical: spacing.sm,
  },
  elevatedCard: {
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  outlinedCard: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filledCard: {
    backgroundColor: colors.gray[100],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftAccessory: {
    marginRight: spacing.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold as any,
    color: colors.gray[900],
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[500],
    marginTop: spacing.xs / 2,
  },
  imageContainer: {
    width: '100%',
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
    borderTopColor: colors.gray[200],
  },
});
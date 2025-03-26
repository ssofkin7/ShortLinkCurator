import React, { ReactNode } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  StyleProp, 
  ViewStyle,
  Image,
  Text,
  Platform
} from 'react-native';
import { colors, borderRadius, shadows, spacing, typography } from './theme';

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
  // Apply styles based on variant
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return styles.elevated;
      case 'outlined':
        return styles.outlined;
      case 'filled':
        return styles.filled;
      default:
        return styles.elevated;
    }
  };

  // Base component with styles
  const cardContent = (
    <View 
      style={[
        styles.container,
        getVariantStyle(),
        style,
      ]}
    >
      {children}
    </View>
  );

  // If onPress is defined, wrap with TouchableOpacity
  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

// Card header component
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
  if (children) {
    return <View style={[styles.header, style]}>{children}</View>;
  }

  return (
    <View style={[styles.header, style]}>
      {leftAccessory && (
        <View style={styles.leftAccessory}>{leftAccessory}</View>
      )}
      
      {(title || subtitle) && (
        <View style={styles.titleContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      
      {rightAccessory && (
        <View style={styles.rightAccessory}>{rightAccessory}</View>
      )}
    </View>
  );
};

// Card image component
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

// Card content component
interface CardContentProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const CardContent = ({ children, style }: CardContentProps) => {
  return <View style={[styles.content, style]}>{children}</View>;
};

// Card footer component
interface CardFooterProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const CardFooter = ({ children, style }: CardFooterProps) => {
  return <View style={[styles.footer, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  elevated: {
    backgroundColor: '#fff',
    ...shadows.md,
  },
  outlined: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filled: {
    backgroundColor: colors.gray[100],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  leftAccessory: {
    marginRight: spacing.sm,
  },
  rightAccessory: {
    marginLeft: spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold as any,
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[500],
    marginTop: spacing.xs / 2,
  },
  image: {
    width: '100%',
    // Top corners are rounded if image is first element
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  content: {
    padding: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
});
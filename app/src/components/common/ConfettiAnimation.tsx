/**
 * Confetti Animation Component
 * 
 * Creates a celebratory confetti animation effect.
 * Uses React Native Animated API for smooth performance.
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiPiece {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'triangle';
}

interface ConfettiAnimationProps {
  active: boolean;
  duration?: number;
  pieceCount?: number;
  colors?: string[];
  onComplete?: () => void;
}

const DEFAULT_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

export const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  active,
  duration = 3000,
  pieceCount = 50,
  colors = DEFAULT_COLORS,
  onComplete,
}) => {
  const confettiPieces = useRef<ConfettiPiece[]>([]);

  useEffect(() => {
    if (active) {
      initializeConfetti();
      animateConfetti();
    }
  }, [active]);

  const initializeConfetti = () => {
    confettiPieces.current = Array.from({ length: pieceCount }, (_, i) => {
      const randomX = Math.random() * SCREEN_WIDTH;
      const randomSize = Math.random() * 10 + 5;
      const shapes: Array<'circle' | 'square' | 'triangle'> = ['circle', 'square', 'triangle'];
      
      return {
        id: i,
        x: new Animated.Value(randomX),
        y: new Animated.Value(-50),
        rotation: new Animated.Value(0),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: randomSize,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      };
    });
  };

  const animateConfetti = () => {
    const animations = confettiPieces.current.map((piece) => {
      const randomDuration = duration + Math.random() * 1000 - 500;
      const randomXMovement = (Math.random() - 0.5) * 100;
      const randomRotations = Math.random() * 5 + 3;

      return Animated.parallel([
        Animated.timing(piece.y, {
          toValue: SCREEN_HEIGHT + 50,
          duration: randomDuration,
          useNativeDriver: true,
        }),
        Animated.timing(piece.x, {
          toValue: piece.x._value + randomXMovement,
          duration: randomDuration,
          useNativeDriver: true,
        }),
        Animated.timing(piece.rotation, {
          toValue: randomRotations * 360,
          duration: randomDuration,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(50, animations).start(() => {
      if (onComplete) {
        onComplete();
      }
    });
  };

  const renderShape = (piece: ConfettiPiece) => {
    const rotate = piece.rotation.interpolate({
      inputRange: [0, 360],
      outputRange: ['0deg', '360deg'],
    });

    const baseStyle = {
      position: 'absolute' as const,
      width: piece.size,
      height: piece.size,
      backgroundColor: piece.color,
      transform: [
        { translateX: piece.x },
        { translateY: piece.y },
        { rotate },
      ],
    };

    switch (piece.shape) {
      case 'circle':
        return (
          <Animated.View
            key={piece.id}
            style={[baseStyle, { borderRadius: piece.size / 2 }]}
          />
        );
      case 'triangle':
        return (
          <Animated.View
            key={piece.id}
            style={[
              baseStyle,
              {
                width: 0,
                height: 0,
                backgroundColor: 'transparent',
                borderStyle: 'solid',
                borderLeftWidth: piece.size / 2,
                borderRightWidth: piece.size / 2,
                borderBottomWidth: piece.size,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: piece.color,
              },
            ]}
          />
        );
      default:
        return <Animated.View key={piece.id} style={baseStyle} />;
    }
  };

  if (!active) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.current.map((piece) => renderShape(piece))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
});

export default ConfettiAnimation;

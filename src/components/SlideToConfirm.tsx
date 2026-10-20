import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, PanResponder, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontWeight, shadows } from "../constants/theme";

interface SlideToConfirmProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onConfirm: () => void;
  resetKey?: string | number;
}

const KNOB_SIZE = 48;
const TRACK_PADDING = 4;

export function SlideToConfirm({
  label,
  icon,
  color,
  onConfirm,
  resetKey,
}: SlideToConfirmProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const maxDragRef = useRef(0);
  const pan = useRef(new Animated.Value(0)).current;
  const knobScale = useRef(new Animated.Value(1)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pan.setValue(0);
  }, [resetKey]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: false,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const updateMaxDrag = (width: number) => {
    maxDragRef.current = Math.max(0, width - KNOB_SIZE - TRACK_PADDING * 2);
    setTrackWidth(width);
  };

  const triggerSlideSuccess = useCallback(() => {
    const max = maxDragRef.current;
    Animated.timing(pan, {
      toValue: max,
      duration: 150,
      useNativeDriver: false,
    }).start(() => {
      onConfirm();
      setTimeout(() => {
        Animated.timing(pan, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }, 350);
    });
  }, [onConfirm, pan]);

  // PanResponder is created once, so it must reach for the LATEST props
  // through refs — otherwise it would call a stale onConfirm snapshot
  // (e.g. one that still sees `pinVerified === false`).
  const triggerSlideSuccessRef = useRef(triggerSlideSuccess);
  useEffect(() => {
    triggerSlideSuccessRef.current = triggerSlideSuccess;
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Animated.spring(knobScale, {
          toValue: 1.1,
          friction: 5,
          tension: 60,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          pan.setValue(Math.min(gestureState.dx, maxDragRef.current));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        Animated.spring(knobScale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: false,
        }).start();

        const threshold = maxDragRef.current * 0.6;
        if (gestureState.dx > threshold) {
          triggerSlideSuccessRef.current();
        } else {
          Animated.spring(pan, {
            toValue: 0,
            friction: 5,
            tension: 45,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const textOpacity =
    maxDragRef.current > 0
      ? pan.interpolate({
          inputRange: [0, maxDragRef.current * 0.45],
          outputRange: [1, 0],
          extrapolate: "clamp",
        })
      : 1;

  const fillWidth = pan.interpolate({
    inputRange: [0, Math.max(1, maxDragRef.current)],
    outputRange: [KNOB_SIZE + TRACK_PADDING * 2, trackWidth || 100],
    extrapolate: "clamp",
  });

  const chevronTranslate = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 6, 0],
  });

  return (
    <View
      style={[styles.sliderTrack, { borderColor: `${color}35` }]}
      onLayout={(e) => updateMaxDrag(e.nativeEvent.layout.width)}
    >
      <Animated.View
        style={[
          styles.sliderFill,
          {
            width: fillWidth,
            backgroundColor: `${color}25`,
          },
        ]}
      />

      <Animated.View
        style={[styles.sliderLabelWrapper, { opacity: textOpacity }]}
        pointerEvents="none"
      >
        <Text style={[styles.sliderLabelText, { color }]}>{label}</Text>
        <Animated.View
          style={[styles.chevronsRow, { transform: [{ translateX: chevronTranslate }] }]}
        >
          <Ionicons name="chevron-forward" size={13} color={color} style={{ opacity: 0.35 }} />
          <Ionicons
            name="chevron-forward"
            size={13}
            color={color}
            style={{ marginLeft: -8, opacity: 0.65 }}
          />
          <Ionicons
            name="chevron-forward"
            size={13}
            color={color}
            style={{ marginLeft: -8, opacity: 1.0 }}
          />
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={[
          styles.sliderKnob,
          {
            backgroundColor: color,
            transform: [{ translateX: pan }, { scale: knobScale }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Ionicons name={icon} size={22} color={colors.white} />
      </Animated.View>
    </View>
  );
}

export default SlideToConfirm;

const styles = StyleSheet.create({
  sliderTrack: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neutral[100],
    borderWidth: 1.5,
    justifyContent: "center",
    paddingHorizontal: 4,
    overflow: "hidden",
    position: "relative",
    ...shadows.sm,
  },
  sliderFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 28,
  },
  sliderLabelWrapper: {
    position: "absolute",
    left: 56,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  sliderLabelText: {
    fontSize: 13,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
  },
  chevronsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 2,
  },
  sliderKnob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.md,
  },
});

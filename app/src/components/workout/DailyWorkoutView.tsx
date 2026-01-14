/**
 * DailyWorkoutView Component
 *
 * Visual journey showing daily workout progression with clickable day cards
 */

import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useThemeColors from '../../utils/useThemeColors';

interface DayData {
  dayName: string;
  dayNumber: number;
  workoutName: string;
  completed: boolean;
  current: boolean;
  exercises?: number;
  duration?: number;
}

interface DailyWorkoutViewProps {
  days: DayData[];
  onDayPress?: (dayNumber: number) => void;
}

const getDayIcon = (completed: boolean, current: boolean): keyof typeof MaterialCommunityIcons.glyphMap => {
  if (completed) return 'check-circle';
  if (current) return 'dumbbell';
  return 'calendar-blank';
};

const getDayStatus = (dayData: DayData) => {
  if (dayData.completed) return 'Completed!';
  if (dayData.current) return 'Ready';
  return 'Upcoming';
};

const getDayColors = (dayNumber: number, completed: boolean, current: boolean): [string, string] => {
  if (completed) {
    return ['#27ae60', '#229954']; // Green for completed
  }
  
  if (current) {
    return ['#3498db', '#2980b9']; // Blue for current
  }
  
  // Different colors for each day of the week
  const dayColors: Record<number, [string, string]> = {
    1: ['#e74c3c', '#c0392b'], // Monday - Red
    2: ['#9b59b6', '#8e44ad'], // Tuesday - Purple
    3: ['#1abc9c', '#16a085'], // Wednesday - Teal
    4: ['#f39c12', '#e67e22'], // Thursday - Orange
    5: ['#e91e63', '#c2185b'], // Friday - Pink
    6: ['#3498db', '#2980b9'], // Saturday - Blue
    7: ['#00b894', '#00a085'], // Sunday - Green
  };
  
  return dayColors[dayNumber] || ['#95a5a6', '#7f8c8d'];
};

export default function DailyWorkoutView({ days, onDayPress }: DailyWorkoutViewProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        YOUR FITNESS JOURNEY
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((day, index) => {
          const icon = getDayIcon(day.completed, day.current);
          const status = getDayStatus(day);
          const isAccessible = day.completed || day.current;
          
          return (
            <View key={day.dayNumber} style={styles.dayContainer}>
              <TouchableOpacity
                onPress={() => isAccessible && onDayPress?.(day.dayNumber)}
                disabled={!isAccessible}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={getDayColors(day.dayNumber, day.completed, day.current)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.dayCard,
                    day.current && styles.currentDay,
                  ]}
                >
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name={icon} size={36} color="#fff" />
                  </View>
                  <Text style={styles.dayLabel}>
                    {day.dayName}
                  </Text>
                  <Text style={styles.workoutName}>
                    {day.workoutName}
                  </Text>
                  <Text style={styles.dayStatus}>{status}</Text>
                  
                  {(day.completed || day.current) && (
                    <View style={styles.dayStats}>
                      {day.exercises && (
                        <Text style={styles.stat}>
                          {day.exercises} exercises
                        </Text>
                      )}
                      {day.duration && (
                        <Text style={styles.stat}>
                          ~{day.duration} min
                        </Text>
                      )}
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              
              {index < days.length - 1 && (
                <View style={styles.connector}>
                  <View style={[
                    styles.connectorLine,
                    day.completed && { backgroundColor: colors.success }
                  ]} />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 16,
    marginHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayCard: {
    width: 150,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  currentDay: {
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  workoutName: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 4,
    textAlign: 'center',
  },
  dayStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
  },
  dayStats: {
    alignItems: 'center',
    marginTop: 4,
  },
  stat: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  connector: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectorLine: {
    width: 30,
    height: 4,
    backgroundColor: '#bdc3c7',
    borderRadius: 2,
  },
});

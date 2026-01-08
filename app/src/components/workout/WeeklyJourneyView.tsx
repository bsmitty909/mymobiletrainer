/**
 * WeeklyJourneyView Component
 *
 * Visual journey showing weekly progression with icons, completion status, and stats
 */

import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useThemeColors from '../../utils/useThemeColors';

interface WeekData {
  weekNumber: number;
  completed: boolean;
  current: boolean;
  workoutsCompleted: number;
  totalWorkouts: number;
  totalVolume?: number;
}

interface WeeklyJourneyViewProps {
  weeks: WeekData[];
  onWeekPress?: (weekNumber: number) => void;
}

const getWeekIcon = (weekNumber: number, completed: boolean, current: boolean): keyof typeof MaterialCommunityIcons.glyphMap => {
  if (completed) return 'check-circle';
  if (current) return 'target';
  if (weekNumber === 0) return 'chart-bar';
  return 'lock';
};

const getWeekStatus = (weekData: WeekData) => {
  if (weekData.completed) return 'Completed!';
  if (weekData.current) return 'In Progress';
  return 'Locked';
};

const getWeekColors = (weekNumber: number, completed: boolean, current: boolean): [string, string] => {
  if (!completed && !current) {
    return ['#95a5a6', '#7f8c8d']; // Gray for locked
  }
  
  const weekColors: Record<number, [string, string]> = {
    0: ['#e74c3c', '#c0392b'], // Red for Max Week
    1: ['#3498db', '#2980b9'], // Blue
    2: ['#9b59b6', '#8e44ad'], // Purple
    3: ['#1abc9c', '#16a085'], // Teal
    4: ['#f39c12', '#e67e22'], // Orange
    5: ['#e91e63', '#c2185b'], // Pink
    6: ['#00b894', '#00a085'], // Green
  };
  
  return weekColors[weekNumber] || ['#34495e', '#2c3e50'];
};

export default function WeeklyJourneyView({ weeks, onWeekPress }: WeeklyJourneyViewProps) {
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
        {weeks.map((week, index) => {
          const icon = getWeekIcon(week.weekNumber, week.completed, week.current);
          const status = getWeekStatus(week);
          const isAccessible = week.completed || week.current;
          
          return (
            <View key={week.weekNumber} style={styles.weekContainer}>
              <TouchableOpacity
                onPress={() => isAccessible && onWeekPress?.(week.weekNumber)}
                disabled={!isAccessible}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={getWeekColors(week.weekNumber, week.completed, week.current)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.weekCard,
                    week.current && styles.currentWeek,
                  ]}
                >
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name={icon} size={36} color="#fff" />
                  </View>
                  <Text style={styles.weekLabel}>
                    {week.weekNumber === 0 ? 'MAX' : `Week ${week.weekNumber}`}
                  </Text>
                  <Text style={styles.weekStatus}>{status}</Text>
                  
                  {(week.completed || week.current) && (
                    <View style={styles.weekStats}>
                      <Text style={styles.stat}>
                        {week.workoutsCompleted}/{week.totalWorkouts} workouts
                      </Text>
                      {week.totalVolume && (
                        <Text style={styles.stat}>
                          {(week.totalVolume / 1000).toFixed(1)}k lbs
                        </Text>
                      )}
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              
              {index < weeks.length - 1 && (
                <View style={styles.connector}>
                  <View style={[
                    styles.connectorLine,
                    week.completed && { backgroundColor: colors.success }
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
  weekContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekCard: {
    width: 140,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  currentWeek: {
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
  weekLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  weekStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  weekStats: {
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

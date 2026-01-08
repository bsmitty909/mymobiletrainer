/**
 * Workout Streak Calendar Component
 * 
 * Displays a calendar visualization showing workout completion history.
 * Highlights days with completed workouts and shows current streak.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeColors } from '../../utils/useThemeColors';

interface WorkoutStreakCalendarProps {
  workoutDates: number[]; // Array of timestamps
  currentStreak: number;
  longestStreak: number;
}

interface CalendarDay {
  date: Date;
  hasWorkout: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export const WorkoutStreakCalendar: React.FC<WorkoutStreakCalendarProps> = ({
  workoutDates,
  currentStreak,
  longestStreak,
}) => {
  const colors = useThemeColors();

  const calendarData = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getDay();

    const daysInMonth = lastDayOfMonth.getDate();
    const days: CalendarDay[] = [];

    const workoutDatesSet = new Set(
      workoutDates.map(timestamp => {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      })
    );

    for (let i = 0; i < startDayOfWeek; i++) {
      const prevMonthDate = new Date(currentYear, currentMonth, -startDayOfWeek + i + 1);
      days.push({
        date: prevMonthDate,
        hasWorkout: false,
        isToday: false,
        isCurrentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateKey = `${currentYear}-${currentMonth}-${day}`;
      const isToday = 
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();

      days.push({
        date,
        hasWorkout: workoutDatesSet.has(dateKey),
        isToday,
        isCurrentMonth: true,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDate = new Date(currentYear, currentMonth + 1, i);
      days.push({
        date: nextMonthDate,
        hasWorkout: false,
        isToday: false,
        isCurrentMonth: false,
      });
    }

    return {
      days,
      monthName: firstDayOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
    };
  }, [workoutDates]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {calendarData.monthName}
        </Text>
        <View style={styles.streakInfo}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={[styles.streakValue, { color: colors.text }]}>
              {currentStreak}
            </Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
              Current
            </Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>⭐</Text>
            <Text style={[styles.streakValue, { color: colors.text }]}>
              {longestStreak}
            </Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
              Best
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.weekDaysContainer}>
        {weekDays.map((day) => (
          <View key={day} style={styles.weekDayCell}>
            <Text style={[styles.weekDayText, { color: colors.textSecondary }]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {calendarData.days.map((dayData, index) => {
          const dayStyle = [styles.dayCell];
          const textStyle = [styles.dayText, { color: colors.textSecondary }];

          if (dayData.isCurrentMonth) {
            textStyle.push({ color: colors.text });
          }

          if (dayData.hasWorkout) {
            dayStyle.push(styles.workoutDay);
            textStyle.push(styles.workoutDayText);
          }

          if (dayData.isToday) {
            dayStyle.push([styles.today, { borderColor: colors.primary }]);
          }

          return (
            <View key={index} style={dayStyle}>
              <Text style={textStyle}>{dayData.date.getDate()}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.workoutDay]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Workout Completed
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.today, { borderColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Today
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  streakInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakBadge: {
    alignItems: 'center',
    flex: 1,
  },
  streakEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  workoutDay: {
    backgroundColor: '#00b894',
  },
  workoutDayText: {
    color: '#fff',
    fontWeight: '700',
  },
  today: {
    borderWidth: 2,
    borderStyle: 'solid',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
});

export default WorkoutStreakCalendar;

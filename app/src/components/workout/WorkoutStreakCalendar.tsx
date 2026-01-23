/**
 * Workout Streak Calendar Component
 * 
 * Displays a calendar visualization showing workout completion history.
 * Highlights days with completed workouts and shows current streak.
 * Supports navigation across months and day selection.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../utils/useThemeColors';

interface WorkoutStreakCalendarProps {
  workoutDates: number[]; // Array of timestamps
  currentStreak: number;
  longestStreak: number;
  onDayPress?: (date: Date, hasWorkout: boolean) => void;
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
  onDayPress,
}) => {
  const colors = useThemeColors();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarData = useMemo(() => {
    const today = new Date();
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
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
      const prevMonthDate = new Date(year, month, -startDayOfWeek + i + 1);
      const dateKey = `${prevMonthDate.getFullYear()}-${prevMonthDate.getMonth()}-${prevMonthDate.getDate()}`;
      days.push({
        date: prevMonthDate,
        hasWorkout: workoutDatesSet.has(dateKey),
        isToday: false,
        isCurrentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = `${year}-${month}-${day}`;
      const isToday = 
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      days.push({
        date,
        hasWorkout: workoutDatesSet.has(dateKey),
        isToday,
        isCurrentMonth: true,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDate = new Date(year, month + 1, i);
      const dateKey = `${nextMonthDate.getFullYear()}-${nextMonthDate.getMonth()}-${nextMonthDate.getDate()}`;
      days.push({
        date: nextMonthDate,
        hasWorkout: workoutDatesSet.has(dateKey),
        isToday: false,
        isCurrentMonth: false,
      });
    }

    return {
      days,
      monthName: firstDayOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
    };
  }, [workoutDates, currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleTodayPress = () => {
    setCurrentMonth(new Date());
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View style={styles.monthNavigation}>
          <TouchableOpacity 
            onPress={handlePreviousMonth} 
            style={[styles.navButton, { backgroundColor: colors.background }]}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.monthTitle, { color: colors.text }]}>
            {calendarData.monthName}
          </Text>
          
          <TouchableOpacity 
            onPress={handleNextMonth} 
            style={[styles.navButton, { backgroundColor: colors.background }]}
          >
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handleTodayPress}
          style={[styles.todayButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>

        <View style={styles.streakInfo}>
          <View style={styles.streakBadge}>
            <MaterialCommunityIcons name="chart-timeline-variant" size={32} color="#FF6B35" />
            <Text style={[styles.streakValue, { color: colors.text }]}>
              {currentStreak}
            </Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
              Current
            </Text>
          </View>
          <View style={styles.streakBadge}>
            <MaterialCommunityIcons name="medal" size={32} color="#FFD700" />
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
            if (dayData.hasWorkout) { textStyle.push(styles.workoutDayText); }
            textStyle.push(styles.workoutDayText);
          }

          if (dayData.isToday) {
            
          }

          return (
            <TouchableOpacity
              key={index}
              style={dayStyle}
              onPress={() => onDayPress?.(dayData.date, dayData.hasWorkout)}
              activeOpacity={0.7}
            >
              <Text style={textStyle}>{dayData.date.getDate()}</Text>
              {dayData.hasWorkout && (
                <View style={styles.workoutIndicator}>
                  <MaterialCommunityIcons name="check-circle" size={12} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
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
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  todayButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  todayButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  streakInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakBadge: {
    alignItems: 'center',
    flex: 1,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
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
    position: 'relative',
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
  workoutIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
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

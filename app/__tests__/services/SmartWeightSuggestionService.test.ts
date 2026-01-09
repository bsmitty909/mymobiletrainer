/**
 * Unit Tests for SmartWeightSuggestionService
 * 
 * Tests smart weight recommendations, fatigue detection, and trend analysis.
 */

import { SmartWeightSuggestionService, WorkoutHistoryEntry, MaxAttemptHistory } from '../../src/services/SmartWeightSuggestionService';
import { EnhancedSetLog } from '../../src/types/enhanced';
import { RepTarget } from '../../src/types/index';

describe('SmartWeightSuggestionService', () => {
  
  const createMockSetLog = (reps: number, weight: number, intensity: number, targetRepsValue: number = 1): EnhancedSetLog => {
    const targetReps: RepTarget = { min: targetRepsValue, max: targetRepsValue };
    return {
      id: 'set-' + Math.random(),
      exerciseLogId: 'exercise-1',
      setNumber: 1,
      weight,
      reps,
      targetReps,
      restSeconds: 120,
      completedAt: Date.now(),
      intensityPercentage: intensity,
      isConditional: false,
      conditionMet: true,
      isDownSet: false,
      isMaxAttempt: intensity >= 0.9
    };
  };
  
  const createMockWorkoutHistory = (
    exerciseId: string,
    sets: EnhancedSetLog[],
    daysAgo: number = 0
  ): WorkoutHistoryEntry => ({
    sessionId: 'session-' + Math.random(),
    exerciseId,
    completedAt: Date.now() - (daysAgo * 24 * 60 * 60 * 1000),
    sets,
    fourRepMax: 225
  });
  
  const createMaxAttemptHistory = (
    successful: boolean,
    daysAgo: number = 0
  ): MaxAttemptHistory => ({
    id: 'attempt-' + Math.random(),
    userId: 'user-1',
    exerciseId: 'bench-press',
    sessionId: 'session-1',
    attemptedWeight: 225,
    repsCompleted: successful ? 1 : 0,
    successful,
    attemptedAt: Date.now() - (daysAgo * 24 * 60 * 60 * 1000)
  });

  describe('generateSuggestion', () => {
    
    test('should suggest weight increase after good rest period', () => {
      const recentHistory = [
        createMockWorkoutHistory('bench-press', [
          createMockSetLog(1, 225, 1.0)
        ], 7) // 7 days ago
      ];
      
      const suggestion = SmartWeightSuggestionService.generateSuggestion(
        'bench-press',
        225,
        225,
        1.0,
        recentHistory,
        []
      );
      
      expect(suggestion.suggestedWeight).toBeGreaterThan(225);
      expect(suggestion.adjustmentFromBase).toBe(5);
      expect(suggestion.reasoning).toContain('days since last workout');
      expect(suggestion.confidence).toBe('medium');
    });
    
    test('should detect fatigue and reduce weight', () => {
      const failedAttempts = [
        createMaxAttemptHistory(false, 0),
        createMaxAttemptHistory(false, 1),
        createMaxAttemptHistory(false, 2)
      ];
      
      const suggestion = SmartWeightSuggestionService.generateSuggestion(
        'bench-press',
        225,
        225,
        1.0,
        [],
        failedAttempts
      );
      
      expect(suggestion.suggestedWeight).toBeLessThan(225);
      expect(suggestion.adjustmentFromBase).toBe(-5);
      expect(suggestion.reasoning).toContain('Fatigue detected');
      expect(suggestion.confidence).toBe('high');
    });
    
    test('should suggest increase for improving performance trend', () => {
      // Service sorts by most recent first, so provide in that order
      const improvingHistory = [
        createMockWorkoutHistory('bench-press', [
          createMockSetLog(3, 200, 0.9, 1) // 3 reps at 90% (most recent, 0 days ago)
        ], 0),
        createMockWorkoutHistory('bench-press', [
          createMockSetLog(2, 200, 0.9, 1) // 2 reps at 90%
        ], 3),
        createMockWorkoutHistory('bench-press', [
          createMockSetLog(1, 200, 0.9, 1) // 1 rep at 90% (oldest, 6 days ago)
        ], 6)
      ];
      
      const suggestion = SmartWeightSuggestionService.generateSuggestion(
        'bench-press',
        200,
        225,
        0.9,
        improvingHistory,
        []
      );
      
      // Trend analysis compares chronologically, so newest-to-oldest shows increasing
      expect(suggestion.trendIndicator).toBe('increasing');
      expect(suggestion.adjustmentFromBase).toBeGreaterThanOrEqual(0);
    });
    
    test('should suggest decrease for declining performance', () => {
      const decliningHistory = [
        createMockWorkoutHistory('bench-press', [
          createMockSetLog(0, 200, 0.9, 1) // Failed (most recent, 0 days ago)
        ], 0),
        createMockWorkoutHistory('bench-press', [
          createMockSetLog(1, 200, 0.9, 1) // 1 rep
        ], 3),
        createMockWorkoutHistory('bench-press', [
          createMockSetLog(2, 200, 0.9, 1) // 2 reps (oldest, 6 days ago)
        ], 6)
      ];
      
      const suggestion = SmartWeightSuggestionService.generateSuggestion(
        'bench-press',
        200,
        225,
        0.9,
        decliningHistory,
        []
      );
      
      expect(suggestion.trendIndicator).toBe('decreasing');
      expect(suggestion.adjustmentFromBase).toBeLessThanOrEqual(0);
    });
    
    test('should maintain weight for stable performance', () => {
      const stableHistory = [
        createMockWorkoutHistory('bench-press', [
          createMockSetLog(1, 200, 0.9, 1)
        ], 0),
        createMockWorkoutHistory('bench-press', [
          createMockSetLog(1, 200, 0.9, 1)
        ], 3),
        createMockWorkoutHistory('bench-press', [
          createMockSetLog(1, 200, 0.9, 1)
        ], 6)
      ];
      
      const suggestion = SmartWeightSuggestionService.generateSuggestion(
        'bench-press',
        200,
        225,
        0.9,
        stableHistory,
        []
      );
      
      expect(suggestion.trendIndicator).toBe('stable');
      expect(suggestion.confidence).toBe('high');
    });
    
    test('should show form check prompt for large weight increase', () => {
      const recentHistory = [
        createMockWorkoutHistory('bench-press', [
          createMockSetLog(1, 180, 1.0, 1) // Last workout was at 180 lbs
        ], 1)
      ];
      
      const suggestion = SmartWeightSuggestionService.generateSuggestion(
        'bench-press',
        225, // 25% increase from 180 (well over 10% threshold)
        225,
        1.0,
        recentHistory,
        []
      );
      
      expect(suggestion.showFormCheckPrompt).toBe(true);
      expect(suggestion.formCheckMessage).toBeTruthy();
      expect(suggestion.formCheckMessage).toContain('form');
    });
    
    test('should round suggestion to nearest 5 lbs', () => {
      const suggestion = SmartWeightSuggestionService.generateSuggestion(
        'bench-press',
        223, // Should round to 225
        225,
        1.0,
        [],
        []
      );
      
      expect(suggestion.suggestedWeight % 5).toBe(0);
    });
    
    test('should have low confidence with insufficient data', () => {
      const suggestion = SmartWeightSuggestionService.generateSuggestion(
        'bench-press',
        225,
        225,
        1.0,
        [], // No history
        []
      );
      
      expect(suggestion.confidence).toBe('low');
      expect(suggestion.reasoning).toContain('Insufficient data');
    });
  });

  describe('detectFatigue', () => {
    
    test('should detect no fatigue with no history', () => {
      const result = SmartWeightSuggestionService.detectFatigue([]);
      
      expect(result.isFatigued).toBe(false);
      expect(result.consecutiveFailures).toBe(0);
      expect(result.recentSuccessRate).toBe(1.0);
    });
    
    test('should detect fatigue with 2+ consecutive failures', () => {
      const attempts = [
        createMaxAttemptHistory(false, 0),
        createMaxAttemptHistory(false, 1)
      ];
      
      const result = SmartWeightSuggestionService.detectFatigue(attempts);
      
      expect(result.isFatigued).toBe(true);
      expect(result.consecutiveFailures).toBe(2);
      expect(result.recommendation).toContain('Reduce weight');
    });
    
    test('should detect fatigue with low success rate', () => {
      const attempts = [
        createMaxAttemptHistory(false, 0),
        createMaxAttemptHistory(false, 1),
        createMaxAttemptHistory(false, 2),
        createMaxAttemptHistory(true, 3),
        createMaxAttemptHistory(false, 4)
      ];
      
      const result = SmartWeightSuggestionService.detectFatigue(attempts);
      
      expect(result.recentSuccessRate).toBeLessThan(0.4);
      expect(result.isFatigued).toBe(true);
    });
    
    test('should not detect fatigue with good success rate', () => {
      const attempts = [
        createMaxAttemptHistory(true, 0),
        createMaxAttemptHistory(true, 1),
        createMaxAttemptHistory(false, 2),
        createMaxAttemptHistory(true, 3),
        createMaxAttemptHistory(true, 4)
      ];
      
      const result = SmartWeightSuggestionService.detectFatigue(attempts);
      
      expect(result.isFatigued).toBe(false);
      expect(result.recentSuccessRate).toBeGreaterThan(0.6);
    });
    
    test('should recommend deload with 3+ consecutive failures', () => {
      const attempts = [
        createMaxAttemptHistory(false, 0),
        createMaxAttemptHistory(false, 1),
        createMaxAttemptHistory(false, 2)
      ];
      
      const result = SmartWeightSuggestionService.detectFatigue(attempts);
      
      expect(result.consecutiveFailures).toBe(3);
      expect(result.recommendation).toContain('deload');
    });
    
    test('should break consecutive count on success', () => {
      const attempts = [
        createMaxAttemptHistory(false, 0),
        createMaxAttemptHistory(true, 1),  // Success breaks the streak
        createMaxAttemptHistory(false, 2),
        createMaxAttemptHistory(false, 3)
      ];
      
      const result = SmartWeightSuggestionService.detectFatigue(attempts);
      
      expect(result.consecutiveFailures).toBe(1); // Only counts most recent
    });
  });

  describe('generateSuggestionSummary', () => {
    
    test('should generate formatted summary', () => {
      const suggestion = SmartWeightSuggestionService.generateSuggestion(
        'bench-press',
        225,
        225,
        1.0,
        [],
        []
      );
      
      const summary = SmartWeightSuggestionService.generateSuggestionSummary(suggestion);
      
      expect(summary).toBeTruthy();
      expect(summary.length).toBeGreaterThan(0);
    });
    
    test('should include confidence emoji', () => {
      const stableHistory = [
        createMockWorkoutHistory('bench-press', [createMockSetLog(1, 225, 1.0, 1)], 1),
        createMockWorkoutHistory('bench-press', [createMockSetLog(1, 225, 1.0, 1)], 2),
        createMockWorkoutHistory('bench-press', [createMockSetLog(1, 225, 1.0, 1)], 3)
      ];
      
      const highConfidence = SmartWeightSuggestionService.generateSuggestion(
        'bench-press',
        225,
        225,
        1.0,
        stableHistory,
        []
      );
      
      const summary = SmartWeightSuggestionService.generateSuggestionSummary(highConfidence);
      
      // Stable performance with 3 consistent workouts gets high confidence with ✓
      expect(summary).toContain('✓');
    });
    
    test('should include trend emoji', () => {
      const improvingHistory = [
        createMockWorkoutHistory('bench-press', [createMockSetLog(2, 200, 0.9, 1)], 0),
        createMockWorkoutHistory('bench-press', [createMockSetLog(1, 200, 0.9, 1)], 3)
      ];
      
      const suggestion = SmartWeightSuggestionService.generateSuggestion(
        'bench-press',
        200,
        225,
        0.9,
        improvingHistory,
        []
      );
      
      const summary = SmartWeightSuggestionService.generateSuggestionSummary(suggestion);
      
      expect(summary).toMatch(/📈|📉|➡️|❓/);
    });
  });

  describe('Edge Cases', () => {
    
    test('should handle zero weight suggestion', () => {
      const suggestion = SmartWeightSuggestionService.generateSuggestion(
        'bench-press',
        0,
        225,
        1.0,
        [],
        []
      );
      
      expect(suggestion.suggestedWeight).toBeGreaterThanOrEqual(0);
    });
    
    test('should handle very heavy weights (500+ lbs)', () => {
      const suggestion = SmartWeightSuggestionService.generateSuggestion(
        'bench-press',
        500,
        500,
        1.0,
        [],
        []
      );
      
      expect(suggestion.suggestedWeight).toBeGreaterThanOrEqual(0);
      expect(suggestion.suggestedWeight % 5).toBe(0);
    });
    
    test('should handle mixed exercise IDs in history', () => {
      const mixedHistory = [
        createMockWorkoutHistory('bench-press', [createMockSetLog(1, 225, 1.0)], 0),
        createMockWorkoutHistory('squat', [createMockSetLog(1, 315, 1.0)], 0),
        createMockWorkoutHistory('bench-press', [createMockSetLog(1, 220, 1.0)], 3)
      ];
      
      const suggestion = SmartWeightSuggestionService.generateSuggestion(
        'bench-press',
        225,
        225,
        1.0,
        mixedHistory,
        []
      );
      
      // Should only consider bench-press history
      expect(suggestion).toBeTruthy();
    });
    
    test('should prioritize fatigue over rest days', () => {
      const recentHistory = [
        createMockWorkoutHistory('bench-press', [createMockSetLog(1, 225, 1.0)], 7)
      ];
      
      const failedAttempts = [
        createMaxAttemptHistory(false, 0),
        createMaxAttemptHistory(false, 1)
      ];
      
      const suggestion = SmartWeightSuggestionService.generateSuggestion(
        'bench-press',
        225,
        225,
        1.0,
        recentHistory,
        failedAttempts
      );
      
      // Fatigue should override rest benefit
      expect(suggestion.adjustmentFromBase).toBeLessThanOrEqual(0);
      expect(suggestion.reasoning).toContain('Fatigue');
    });
  });
});

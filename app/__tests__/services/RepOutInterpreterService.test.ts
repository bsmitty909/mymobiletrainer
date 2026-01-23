/**
 * RepOutInterpreterService Tests
 * 
 * Tests for rep-out classification, safety guards, and readiness signals.
 * Critical for user safety and progression logic.
 */

import RepOutInterpreterService from '../../src/services/RepOutInterpreterService';

describe('RepOutInterpreterService', () => {
  describe('analyzeRepBand - 5-band classification (PRD)', () => {
    it('should classify 1-4 reps as too_heavy', () => {
      const analysis = RepOutInterpreterService.analyzeRepBand(3, 'P2');
      expect(analysis.band).toBe('too_heavy');
      expect(analysis.actionRequired).toBe(true);
    });

    it('should classify 5-6 reps as overloaded', () => {
      const analysis = RepOutInterpreterService.analyzeRepBand(5, 'P2');
      expect(analysis.band).toBe('overloaded');
      expect(analysis.actionRequired).toBe(true);
    });

    it('should classify 7-9 reps as ideal', () => {
      const analysis8 = RepOutInterpreterService.analyzeRepBand(8, 'P2');
      expect(analysis8.band).toBe('ideal');
      expect(analysis8.actionRequired).toBe(false);
    });

    it('should classify 10-12 reps as reserve', () => {
      const analysis = RepOutInterpreterService.analyzeRepBand(11, 'P2');
      expect(analysis.band).toBe('reserve');
      expect(analysis.actionRequired).toBe(false);
    });

    it('should classify 13-15 reps as light', () => {
      const analysis = RepOutInterpreterService.analyzeRepBand(14, 'P2');
      expect(analysis.band).toBe('light');
      expect(analysis.actionRequired).toBe(false);
    });
  });

  describe('detectSafetyGuards - 30% rep drop (PRD)', () => {
    it('should detect 30% rep drop and trigger auto-reduction', () => {
      const sets = [
        { reps: 10, protocol: 'P2' },
        { reps: 9, protocol: 'P2' },
        { reps: 6, protocol: 'P2' }, // 40% drop from first set
      ];

      const guard = RepOutInterpreterService.detectSafetyGuards(sets as any);
      
      expect(guard).toBeDefined();
      expect(guard?.type).toBe('rep_drop');
      expect(guard?.severity).toBe('critical');
      expect(guard?.actionTaken).toContain('reduce load');
    });

    it('should not trigger for normal rep decline', () => {
      const sets = [
        { reps: 10, protocol: 'P2' },
        { reps: 9, protocol: 'P2' },
        { reps: 8, protocol: 'P2' }, // 20% drop - normal fatigue
      ];

      const guard = RepOutInterpreterService.detectSafetyGuards(sets as any);
      expect(guard).toBeNull();
    });
  });

  describe('detectMultipleFailures', () => {
    it('should detect multiple P1 failures and suppress progression', () => {
      const recentAttempts = [
        { successful: false, timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
        { successful: false, timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
        { successful: false, timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 },
      ];

      const guard = RepOutInterpreterService.detectMultipleFailures(recentAttempts as any);
      
      expect(guard).toBeDefined();
      expect(guard?.type).toBe('multiple_failures');
      expect(guard?.severity).toBe('critical');
    });

    it('should not trigger for mixed results', () => {
      const recentAttempts = [
        { successful: true, timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
        { successful: false, timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
        { successful: true, timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 },
      ];

      const guard = RepOutInterpreterService.detectMultipleFailures(recentAttempts as any);
      expect(guard).toBeNull();
    });
  });

  describe('generateReadinessSignal', () => {
    it('should generate positive signal for high rep-out performance', () => {
      const recentSets = [
        { reps: 12, protocol: 'P2', timestamp: Date.now() },
        { reps: 11, protocol: 'P2', timestamp: Date.now() },
        { reps: 13, protocol: 'P3', timestamp: Date.now() },
      ];

      const signal = RepOutInterpreterService.generateReadinessSignal(
        'bench-press',
        recentSets as any,
        []
      );

      expect(signal.readyForP1).toBe(true);
      expect(signal.confidence).toBeGreaterThan(0.5);
      expect(signal.reasoning.length).toBeGreaterThan(0);
    });

    it('should generate negative signal if cooldown active', () => {
      const recentSets = [
        { reps: 12, protocol: 'P2', timestamp: Date.now() },
      ];

      const recentMax = {
        exerciseId: 'bench-press',
        dateAchieved: Date.now() - 7 * 24 * 60 * 60 * 1000,
      };

      const signal = RepOutInterpreterService.generateReadinessSignal(
        'bench-press',
        recentSets as any,
        [recentMax as any]
      );

      expect(signal.readyForP1).toBe(false);
    });

    it('should generate negative signal for low rep performance', () => {
      const recentSets = [
        { reps: 5, protocol: 'P2', timestamp: Date.now() },
        { reps: 6, protocol: 'P2', timestamp: Date.now() },
        { reps: 5, protocol: 'P3', timestamp: Date.now() },
      ];

      const signal = RepOutInterpreterService.generateReadinessSignal(
        'bench-press',
        recentSets as any,
        []
      );

      expect(signal.readyForP1).toBe(false);
      expect(signal.reasoning).toContain('rep-out performance');
    });
  });

  describe('getRepOutFeedback', () => {
    it('should provide positive feedback for ideal range', () => {
      const analysis = RepOutInterpreterService.analyzeRepBand(8, 'P2');
      const feedback = RepOutInterpreterService.getRepOutFeedback(analysis);

      expect(feedback.emoji).toBeDefined();
      expect(feedback.color).toBe('#4CAF50'); // Green for ideal
      expect(feedback.message).toContain('ideal');
    });

    it('should provide warning feedback for too heavy', () => {
      const analysis = RepOutInterpreterService.analyzeRepBand(3, 'P2');
      const feedback = RepOutInterpreterService.getRepOutFeedback(analysis);

      expect(feedback.color).toBe('#F44336'); // Red
      expect(feedback.actionRequired).toBe(true);
    });
  });

  describe('getP1TestingRecommendations', () => {
    it('should prioritize exercises with high readiness', () => {
      const signals = [
        {
          exerciseId: 'bench-press',
          readyForP1: true,
          confidence: 0.8,
          reasoning: ['High rep-outs'],
          priority: 'high' as const,
        },
        {
          exerciseId: 'squat',
          readyForP1: true,
          confidence: 0.5,
          reasoning: ['Moderate performance'],
          priority: 'medium' as const,
        },
      ];

      const recommendations = RepOutInterpreterService.getP1TestingRecommendations(signals as any);
      
      expect(recommendations.length).toBe(2);
      expect(recommendations[0].exerciseId).toBe('bench-press'); // Higher priority first
    });

    it('should filter out exercises not ready', () => {
      const signals = [
        {
          exerciseId: 'bench-press',
          readyForP1: false,
          confidence: 0.3,
          reasoning: ['Recent test'],
        },
      ];

      const recommendations = RepOutInterpreterService.getP1TestingRecommendations(signals as any);
      expect(recommendations.length).toBe(0);
    });
  });
});

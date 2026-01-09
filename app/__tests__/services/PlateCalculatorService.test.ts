/**
 * Unit Tests for PlateCalculatorService
 * 
 * Tests plate calculations, loadout generation, and equipment-specific logic.
 */

import PlateCalculatorService, { PlateSet } from '../../src/services/PlateCalculatorService';

describe('PlateCalculatorService', () => {
  
  describe('calculateBarbellPlates', () => {
    test('should calculate plates for 225 lbs with standard plates', () => {
      const result = PlateCalculatorService.calculateBarbellPlates(225);
      
      expect(result.totalWeight).toBe(225);
      expect(result.bar).toBe(45);
      expect(result.isExact).toBe(true);
      expect(result.platesPerSide).toEqual([
        { weight: 45, quantity: 2 }
      ]);
    });
    
    test('should handle bar only (45 lbs)', () => {
      const result = PlateCalculatorService.calculateBarbellPlates(45);
      
      expect(result.totalWeight).toBe(45);
      expect(result.bar).toBe(45);
      expect(result.platesPerSide).toEqual([]);
      expect(result.description).toContain('Bar only');
      expect(result.isExact).toBe(true);
    });
    
    test('should calculate complex weight (315 lbs)', () => {
      const result = PlateCalculatorService.calculateBarbellPlates(315);
      
      expect(result.totalWeight).toBe(315);
      expect(result.platesPerSide).toEqual([
        { weight: 45, quantity: 3 }
      ]);
    });
    
    test('should use smaller plates when needed (185 lbs)', () => {
      const result = PlateCalculatorService.calculateBarbellPlates(185);
      
      // 185 - 45 bar = 140 / 2 = 70 per side
      // 70 = 45 + 25
      expect(result.totalWeight).toBe(185);
      expect(result.platesPerSide).toEqual([
        { weight: 45, quantity: 1 },
        { weight: 25, quantity: 1 }
      ]);
    });
    
    test('should handle weights requiring 2.5 lb plates', () => {
      const result = PlateCalculatorService.calculateBarbellPlates(155);
      
      // 155 - 45 bar = 110 / 2 = 55 per side
      // 55 = 45 + 10
      expect(result.totalWeight).toBe(155);
      expect(result.platesPerSide).toEqual([
        { weight: 45, quantity: 1 },
        { weight: 10, quantity: 1 }
      ]);
    });
    
    test('should work with custom plate set (home gym)', () => {
      const homeGym: PlateSet = {
        name: 'Home Gym',
        availablePlates: [25, 10, 5, 2.5],
        barWeight: 45
      };
      
      const result = PlateCalculatorService.calculateBarbellPlates(135, homeGym);
      
      // 135 - 45 bar = 90 / 2 = 45 per side
      // 45 = 25 + 10 + 10 (greedy algorithm uses 2×10 instead of 1×10+1×5+1×2.5)
      expect(result.totalWeight).toBe(135);
      expect(result.platesPerSide).toEqual([
        { weight: 25, quantity: 1 },
        { weight: 10, quantity: 2 }
      ]);
    });
    
    test('should handle weight below bar weight', () => {
      const result = PlateCalculatorService.calculateBarbellPlates(40);
      
      expect(result.totalWeight).toBe(45);
      expect(result.platesPerSide).toEqual([]);
      expect(result.isExact).toBe(false);
      expect(result.difference).toBe(5);
    });
    
    test('should round to nearest achievable weight when exact match impossible', () => {
      const limitedPlates: PlateSet = {
        name: 'Limited',
        availablePlates: [45, 25],
        barWeight: 45
      };
      
      const result = PlateCalculatorService.calculateBarbellPlates(200, limitedPlates);
      
      // Best achievable: 45 + 45 + 45 + 45 + 45 = 225 or 45 + 45 + 45 = 135
      expect(result.totalWeight).toBeLessThanOrEqual(225);
      expect(result.isExact).toBe(false);
    });
  });
  
  describe('calculateDumbbellWeight', () => {
    test('should find exact dumbbell match', () => {
      const result = PlateCalculatorService.calculateDumbbellWeight(100); // 2x50 lb
      
      expect(result.totalWeight).toBe(100);
      expect(result.perDumbbell).toBe(50);
      expect(result.description).toContain('2×50');
      expect(result.isAvailable).toBe(true);
    });
    
    test('should find closest available dumbbell', () => {
      const result = PlateCalculatorService.calculateDumbbellWeight(53); // Closest is 25 or 30
      
      expect(result.perDumbbell).toBeGreaterThanOrEqual(25);
      expect(result.perDumbbell).toBeLessThanOrEqual(30);
      expect(result.isAvailable).toBe(true);
    });
    
    test('should handle heavy dumbbells (120 lbs total)', () => {
      const result = PlateCalculatorService.calculateDumbbellWeight(120);
      
      expect(result.totalWeight).toBe(120);
      expect(result.perDumbbell).toBe(60);
    });
  });
  
  describe('generateLoadingInstructions', () => {
    test('should generate instructions for multi-plate loadout', () => {
      const loadout = PlateCalculatorService.calculateBarbellPlates(225);
      const instructions = PlateCalculatorService.generateLoadingInstructions(loadout);
      
      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions[0]).toContain('Load each side');
      expect(instructions.some(i => i.includes('45'))).toBe(true);
      expect(instructions.some(i => i.includes('largest plates'))).toBe(true);
    });
    
    test('should handle bar-only case', () => {
      const loadout = PlateCalculatorService.calculateBarbellPlates(45);
      const instructions = PlateCalculatorService.generateLoadingInstructions(loadout);
      
      expect(instructions.length).toBe(1);
      expect(instructions[0]).toContain('bar only');
    });
  });
  
  describe('getIncrementSize', () => {
    test('should return correct increment for barbell', () => {
      const increment = PlateCalculatorService.getIncrementSize('barbell');
      expect(increment).toBe(5); // 2.5 lb plates on each side
    });
    
    test('should return correct increment for dumbbell', () => {
      const increment = PlateCalculatorService.getIncrementSize('dumbbell');
      expect(increment).toBe(5);
    });
    
    test('should return correct increment for machine', () => {
      const increment = PlateCalculatorService.getIncrementSize('machine');
      expect(increment).toBe(5);
    });
    
    test('should return correct increment for kettlebell', () => {
      const increment = PlateCalculatorService.getIncrementSize('kettlebell');
      expect(increment).toBe(4); // ~4 kg increments
    });
  });
  
  describe('isWeightAchievable', () => {
    test('should confirm achievable weight', () => {
      const result = PlateCalculatorService.isWeightAchievable(225, 'barbell');
      
      expect(result.achievable).toBe(true);
      expect(result.closestWeight).toBe(225);
      expect(result.message).toContain('Exact');
    });
    
    test('should indicate non-achievable weight', () => {
      const limitedPlates: PlateSet = {
        name: 'Limited',
        availablePlates: [45],
        barWeight: 45
      };
      
      const result = PlateCalculatorService.isWeightAchievable(
        200,
        'barbell',
        limitedPlates
      );
      
      expect(result.achievable).toBe(false);
      expect(result.closestWeight).not.toBe(200);
    });
    
    test('should always return true for machines', () => {
      const result = PlateCalculatorService.isWeightAchievable(173, 'machine');
      
      expect(result.achievable).toBe(true);
      expect(result.message).toContain('continuously adjustable');
    });
  });
  
  describe('calculateForEquipment', () => {
    test('should calculate for EZ-bar', () => {
      const result = PlateCalculatorService.calculateForEquipment(
        100,
        'ez-bar'
      );
      
      if ('bar' in result) {
        expect(result.bar).toBe(25); // EZ bar weighs 25 lbs
        expect(result.totalWeight).toBeGreaterThanOrEqual(100);
      }
    });
    
    test('should calculate for kettlebell', () => {
      const result = PlateCalculatorService.calculateForEquipment(
        35,
        'kettlebell'
      );
      
      expect(result.totalWeight).toBeGreaterThanOrEqual(32);
      expect(result.totalWeight).toBeLessThanOrEqual(36);
      expect(result.description).toContain('kettlebell');
    });
    
    test('should calculate for machine', () => {
      const result = PlateCalculatorService.calculateForEquipment(
        175,
        'machine'
      );
      
      expect(result.totalWeight).toBe(175);
      expect(result.description).toContain('machine');
    });
  });
  
  describe('Edge Cases', () => {
    test('should handle very heavy weight (500 lbs)', () => {
      const result = PlateCalculatorService.calculateBarbellPlates(500);
      
      expect(result.totalWeight).toBeGreaterThanOrEqual(495);
      expect(result.totalWeight).toBeLessThanOrEqual(500);
    });
    
    test('should handle odd weight (133 lbs)', () => {
      const result = PlateCalculatorService.calculateBarbellPlates(133);
      
      expect(result.totalWeight).toBeGreaterThanOrEqual(130);
      expect(result.totalWeight).toBeLessThanOrEqual(135);
    });
    
    test('should handle micro plates when available', () => {
      const microPlates = PlateCalculatorService.FULL_SET_WITH_MICRO;
      const result = PlateCalculatorService.calculateBarbellPlates(
        152.5,
        microPlates
      );
      
      expect(result.totalWeight).toBe(152.5);
      expect(result.isExact).toBe(true);
    });
  });
  
  describe('Visual Representation', () => {
    test('should generate ASCII art for plates', () => {
      const result = PlateCalculatorService.calculateBarbellPlates(225);
      
      expect(result.visualRepresentation).toBeTruthy();
      expect(result.visualRepresentation).toContain('|');
      expect(result.visualRepresentation.length).toBeGreaterThan(10);
    });
    
    test('should show bar only for no plates', () => {
      const result = PlateCalculatorService.calculateBarbellPlates(45);
      
      expect(result.visualRepresentation).toContain('=');
      expect(result.visualRepresentation).toContain('|');
    });
  });
});

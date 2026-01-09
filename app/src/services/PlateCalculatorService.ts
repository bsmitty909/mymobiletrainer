/**
 * Plate Calculator Service
 * 
 * Converts target weights into plate combinations for different equipment types.
 * Supports custom plate sets and provides visual loading instructions.
 */

export type EquipmentType = 'barbell' | 'dumbbell' | 'machine' | 'kettlebell' | 'ez-bar';

export interface PlateSet {
  name: string;
  availablePlates: number[];
  barWeight?: number;
}

export interface PlateLoadout {
  totalWeight: number;
  bar?: number;
  platesPerSide: PlateQuantity[];
  description: string;
  visualRepresentation: string;
  isExact: boolean;
  difference?: number;
}

export interface PlateQuantity {
  weight: number;
  quantity: number;
}

export interface DumbbellLoadout {
  totalWeight: number;
  perDumbbell: number;
  description: string;
  isAvailable: boolean;
}

export class PlateCalculatorService {
  
  // Standard gym plate sets
  static readonly STANDARD_PLATES: PlateSet = {
    name: 'Standard Gym',
    availablePlates: [45, 35, 25, 10, 5, 2.5],
    barWeight: 45
  };
  
  static readonly FULL_SET_WITH_MICRO: PlateSet = {
    name: 'Full Set with Micro Plates',
    availablePlates: [45, 35, 25, 10, 5, 2.5, 1.25],
    barWeight: 45
  };
  
  static readonly HOME_GYM_BASIC: PlateSet = {
    name: 'Basic Home Gym',
    availablePlates: [25, 10, 5, 2.5],
    barWeight: 45
  };
  
  static readonly EZ_BAR_SET: PlateSet = {
    name: 'EZ Bar Set',
    availablePlates: [25, 10, 5, 2.5],
    barWeight: 25
  };
  
  // Standard dumbbell increments (per dumbbell)
  static readonly STANDARD_DUMBBELLS = [
    5, 10, 15, 20, 25, 30, 35, 40, 45, 50,
    55, 60, 65, 70, 75, 80, 85, 90, 95, 100,
    105, 110, 115, 120
  ];
  
  /**
   * Calculate plate loadout for a barbell exercise
   */
  static calculateBarbellPlates(
    targetWeight: number,
    plateSet: PlateSet = this.STANDARD_PLATES
  ): PlateLoadout {
    
    const barWeight = plateSet.barWeight || 45;
    
    // Handle edge cases
    if (targetWeight <= barWeight) {
      return {
        totalWeight: barWeight,
        bar: barWeight,
        platesPerSide: [],
        description: 'Bar only (no plates)',
        visualRepresentation: '| ========== |',
        isExact: targetWeight === barWeight,
        difference: targetWeight === barWeight ? undefined : barWeight - targetWeight
      };
    }
    
    // Calculate weight needed per side
    const weightToLoad = targetWeight - barWeight;
    const weightPerSide = weightToLoad / 2;
    
    // Greedy algorithm to find plate combination
    const platesOneSide = this.findOptimalPlateCombo(
      weightPerSide,
      plateSet.availablePlates
    );
    
    const actualWeightPerSide = platesOneSide.reduce((sum, p) => sum + (p.weight * p.quantity), 0);
    const actualTotalWeight = barWeight + (actualWeightPerSide * 2);
    
    return {
      totalWeight: actualTotalWeight,
      bar: barWeight,
      platesPerSide: platesOneSide,
      description: this.generateDescription(barWeight, platesOneSide),
      visualRepresentation: this.generateVisualRepresentation(platesOneSide),
      isExact: actualTotalWeight === targetWeight,
      difference: actualTotalWeight !== targetWeight ? actualTotalWeight - targetWeight : undefined
    };
  }
  
  /**
   * Find optimal plate combination using greedy algorithm
   */
  private static findOptimalPlateCombo(
    targetWeight: number,
    availablePlates: number[]
  ): PlateQuantity[] {
    
    const sortedPlates = [...availablePlates].sort((a, b) => b - a);
    const result: PlateQuantity[] = [];
    let remaining = targetWeight;
    
    for (const plateWeight of sortedPlates) {
      if (remaining <= 0) break;
      
      const quantity = Math.floor(remaining / plateWeight);
      
      if (quantity > 0) {
        result.push({ weight: plateWeight, quantity });
        remaining -= plateWeight * quantity;
      }
    }
    
    // Round remaining to acceptable tolerance (0.5 lbs)
    if (remaining > 0.5) {
      // Couldn't load exact weight - this is noted in the result
    }
    
    return result;
  }
  
  /**
   * Generate human-readable description
   */
  private static generateDescription(barWeight: number, plates: PlateQuantity[]): string {
    if (plates.length === 0) {
      return `${barWeight} lb bar only`;
    }
    
    const plateDescription = plates
      .map(p => `(${p.quantity}×${p.weight})`)
      .join(' + ');
    
    return `${barWeight} lb bar + ${plateDescription} per side`;
  }
  
  /**
   * Generate ASCII visual representation
   */
  private static generateVisualRepresentation(plates: PlateQuantity[]): string {
    if (plates.length === 0) {
      return '| ========== |';
    }
    
    const leftSide = this.generatePlateSide(plates);
    const bar = '==========';
    const rightSide = this.generatePlateSide(plates);
    
    return `${leftSide}| ${bar} |${rightSide}`;
  }
  
  private static generatePlateSide(plates: PlateQuantity[]): string {
    let visual = '';
    
    for (const plate of plates) {
      const symbol = this.getPlateSymbol(plate.weight);
      visual += symbol.repeat(plate.quantity);
    }
    
    return visual;
  }
  
  private static getPlateSymbol(weight: number): string {
    if (weight >= 45) return '█';
    if (weight >= 25) return '▓';
    if (weight >= 10) return '▒';
    if (weight >= 5) return '░';
    return '·';
  }
  
  /**
   * Calculate dumbbell weight suggestion
   */
  static calculateDumbbellWeight(
    targetTotalWeight: number,
    availableDumbbells: number[] = this.STANDARD_DUMBBELLS
  ): DumbbellLoadout {
    
    const targetPerDumbbell = targetTotalWeight / 2;
    
    // Find closest available dumbbell
    let closest = availableDumbbells[0];
    let minDiff = Math.abs(targetPerDumbbell - closest);
    
    for (const db of availableDumbbells) {
      const diff = Math.abs(targetPerDumbbell - db);
      if (diff < minDiff) {
        minDiff = diff;
        closest = db;
      }
    }
    
    const actualTotal = closest * 2;
    
    return {
      totalWeight: actualTotal,
      perDumbbell: closest,
      description: `2×${closest} lb dumbbells`,
      isAvailable: true
    };
  }
  
  /**
   * Get equipment-specific weight calculation
   */
  static calculateForEquipment(
    targetWeight: number,
    equipmentType: EquipmentType,
    customPlateSet?: PlateSet
  ): PlateLoadout | DumbbellLoadout | { totalWeight: number; description: string } {
    
    switch (equipmentType) {
      case 'barbell':
        return this.calculateBarbellPlates(targetWeight, customPlateSet);
      
      case 'ez-bar':
        return this.calculateBarbellPlates(targetWeight, this.EZ_BAR_SET);
      
      case 'dumbbell':
        return this.calculateDumbbellWeight(targetWeight);
      
      case 'machine':
        return {
          totalWeight: targetWeight,
          description: `Set machine to ${targetWeight} lbs`
        };
      
      case 'kettlebell':
        // Kettlebells come in standard increments
        const kbWeights = [8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 53, 62, 70, 88, 106];
        const closest = kbWeights.reduce((prev, curr) =>
          Math.abs(curr - targetWeight) < Math.abs(prev - targetWeight) ? curr : prev
        );
        return {
          totalWeight: closest,
          description: `${closest} lb kettlebell`
        };
      
      default:
        return {
          totalWeight: targetWeight,
          description: `${targetWeight} lbs`
        };
    }
  }
  
  /**
   * Suggest increment size based on equipment
   */
  static getIncrementSize(equipmentType: EquipmentType, plateSet?: PlateSet): number {
    switch (equipmentType) {
      case 'barbell':
        const smallestPlate = plateSet?.availablePlates.slice().sort((a, b) => a - b)[0] || 2.5;
        return smallestPlate * 2; // Both sides
      
      case 'ez-bar':
        return 5; // Usually 2.5 lb plates
      
      case 'dumbbell':
        return 5; // Standard dumbbell increments
      
      case 'machine':
        return 5; // Most machines in 5 lb increments
      
      case 'kettlebell':
        return 4; // Typically 4 kg (~8-9 lbs) increments
      
      default:
        return 5;
    }
  }
  
  /**
   * Check if a weight is achievable with available plates
   */
  static isWeightAchievable(
    targetWeight: number,
    equipmentType: EquipmentType,
    plateSet: PlateSet = this.STANDARD_PLATES
  ): { achievable: boolean; closestWeight: number; message: string } {
    
    if (equipmentType === 'machine') {
      return {
        achievable: true,
        closestWeight: targetWeight,
        message: 'Machine weights are continuously adjustable'
      };
    }
    
    const loadout = this.calculateBarbellPlates(targetWeight, plateSet);
    
    if ('isExact' in loadout && loadout.isExact) {
      return {
        achievable: true,
        closestWeight: targetWeight,
        message: 'Exact weight achievable'
      };
    }
    
    return {
      achievable: false,
      closestWeight: loadout.totalWeight,
      message: `Closest achievable: ${loadout.totalWeight} lbs (${loadout.difference! > 0 ? '+' : ''}${loadout.difference} lbs difference)`
    };
  }
  
  /**
   * Generate loading instructions for UI
   */
  static generateLoadingInstructions(loadout: PlateLoadout): string[] {
    if (loadout.platesPerSide.length === 0) {
      return ['Use bar only (no plates needed)'];
    }
    
    const instructions: string[] = ['Load each side with:'];
    
    loadout.platesPerSide.forEach((plate, index) => {
      const step = `${index + 1}. Add ${plate.quantity}×${plate.weight} lb plate${plate.quantity > 1 ? 's' : ''}`;
      instructions.push(step);
    });
    
    instructions.push('💡 Start with largest plates closest to bar');
    
    return instructions;
  }
}

export default PlateCalculatorService;

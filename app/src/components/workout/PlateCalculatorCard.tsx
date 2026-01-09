/**
 * Plate Calculator Card Component
 * 
 * Displays plate breakdown and loading instructions for barbell exercises.
 * Helps users quickly understand which plates to load.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { IconButton, Chip } from 'react-native-paper';
import useThemeColors from '../../utils/useThemeColors';
import PlateCalculatorService, { 
  PlateLoadout, 
  EquipmentType,
  PlateSet 
} from '../../services/PlateCalculatorService';

interface PlateCalculatorCardProps {
  targetWeight: number;
  equipmentType?: EquipmentType;
  customPlateSet?: PlateSet;
  compact?: boolean;
}

export default function PlateCalculatorCard({
  targetWeight,
  equipmentType = 'barbell',
  customPlateSet,
  compact = false
}: PlateCalculatorCardProps) {
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: compact ? 12 : 16,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: colors.border || '#e0e0e0',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: expanded ? 12 : 0,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginRight: 8,
    },
    weight: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
    },
    visualContainer: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginVertical: 8,
      alignItems: 'center',
    },
    visualText: {
      fontSize: 16,
      fontFamily: 'monospace',
      color: colors.text,
      letterSpacing: 1,
    },
    description: {
      fontSize: 13,
      color: colors.textSecondary || '#666',
      marginTop: 4,
      textAlign: 'center',
    },
    instructionsList: {
      marginTop: 12,
    },
    instructionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
      paddingLeft: 8,
    },
    instructionText: {
      fontSize: 13,
      color: colors.text,
      marginLeft: 8,
      flex: 1,
    },
    plateBreakdown: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
      gap: 8,
    },
    plateChip: {
      marginRight: 4,
      marginBottom: 4,
    },
    warningContainer: {
      backgroundColor: colors.warning || '#fff3cd',
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
    },
    warningText: {
      fontSize: 12,
      color: colors.text,
    },
    compactView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    compactVisual: {
      fontSize: 12,
      fontFamily: 'monospace',
      color: colors.textSecondary || '#666',
      flex: 1,
      marginLeft: 8,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      width: '85%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    modalOption: {
      padding: 12,
      borderRadius: 8,
      marginVertical: 4,
      backgroundColor: colors.background,
    },
    modalOptionText: {
      fontSize: 14,
      color: colors.text,
    },
  });

  const plateSet = customPlateSet || PlateCalculatorService.STANDARD_PLATES;
  
  const result = equipmentType === 'barbell' 
    ? PlateCalculatorService.calculateBarbellPlates(targetWeight, plateSet)
    : PlateCalculatorService.calculateForEquipment(targetWeight, equipmentType, plateSet);
  
  // Type guard for PlateLoadout
  const isPlateLoadout = (r: any): r is PlateLoadout => {
    return 'platesPerSide' in r;
  };
  
  if (!isPlateLoadout(result)) {
    return (
      <View style={styles.container}>
        <Text style={styles.description}>{result.description}</Text>
      </View>
    );
  }
  
  const loadout = result as PlateLoadout;
  const instructions = PlateCalculatorService.generateLoadingInstructions(loadout);
  
  if (compact && !expanded) {
    return (
      <TouchableOpacity 
        style={[styles.container, styles.compactView]} 
        onPress={() => setExpanded(true)}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>Plates:</Text>
          <Text style={styles.compactVisual} numberOfLines={1}>
            {loadout.visualRepresentation}
          </Text>
        </View>
        <IconButton
          icon="chevron-down"
          size={20}
          onPress={() => setExpanded(true)}
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Plate Breakdown</Text>
          <Text style={styles.weight}>{loadout.totalWeight} lbs</Text>
        </View>
        <IconButton
          icon="cog"
          size={20}
          onPress={() => setShowSettings(true)}
        />
        {compact && (
          <IconButton
            icon="chevron-up"
            size={20}
            onPress={() => setExpanded(false)}
          />
        )}
      </View>

      {/* Visual Representation */}
      <View style={styles.visualContainer}>
        <Text style={styles.visualText}>{loadout.visualRepresentation}</Text>
        <Text style={styles.description}>{loadout.description}</Text>
      </View>

      {/* Plate Breakdown Chips */}
      {loadout.platesPerSide.length > 0 && (
        <View style={styles.plateBreakdown}>
          <Text style={styles.title}>Per Side:</Text>
          {loadout.platesPerSide.map((plate, index) => (
            <Chip
              key={index}
              style={styles.plateChip}
              textStyle={{ fontSize: 12, fontWeight: '600' }}
            >
              {plate.quantity}×{plate.weight} lb
            </Chip>
          ))}
        </View>
      )}

      {/* Loading Instructions */}
      <View style={styles.instructionsList}>
        {instructions.map((instruction, index) => (
          <View key={index} style={styles.instructionItem}>
            <Text style={styles.instructionText}>
              {instruction}
            </Text>
          </View>
        ))}
      </View>

      {/* Warning if not exact weight */}
      {!loadout.isExact && loadout.difference && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ Closest achievable: {loadout.totalWeight} lbs
            ({loadout.difference > 0 ? '+' : ''}{loadout.difference} lbs from target)
          </Text>
        </View>
      )}

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Plate Set Options</Text>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                // Would update plate set to standard
                setShowSettings(false);
              }}
            >
              <Text style={styles.modalOptionText}>
                Standard Gym (45, 35, 25, 10, 5, 2.5)
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                // Would update plate set to include micro plates
                setShowSettings(false);
              }}
            >
              <Text style={styles.modalOptionText}>
                With Micro Plates (+ 1.25 lb)
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                // Would update plate set to home gym
                setShowSettings(false);
              }}
            >
              <Text style={styles.modalOptionText}>
                Home Gym (25, 10, 5, 2.5)
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalOption, { marginTop: 16 }]}
              onPress={() => setShowSettings(false)}
            >
              <Text style={[styles.modalOptionText, { textAlign: 'center', fontWeight: '600' }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

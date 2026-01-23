/**
 * TrainerNotesModal
 * 
 * Interface for trainers to add and view notes about clients.
 * Supports categorization for better organization.
 * 
 * Categories:
 * - General: Overall observations
 * - Form: Technique notes
 * - Progression: Strength/progress notes
 * - Injury: Injury/recovery notes
 * - Motivation: Mental/motivational notes
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import TrainerService from '../../services/TrainerService';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';

type NoteCategory = 'general' | 'form' | 'progression' | 'injury' | 'motivation';

interface TrainerNotesModalProps {
  visible: boolean;
  clientId: string;
  trainerId: string;
  existingNotes?: any[];
  onClose: () => void;
  onNoteAdded: (note: any) => void;
}

export const TrainerNotesModal: React.FC<TrainerNotesModalProps> = ({
  visible,
  clientId,
  trainerId,
  existingNotes = [],
  onClose,
  onNoteAdded,
}) => {
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory>('general');

  const categoryInfo: Record<NoteCategory, { label: string; icon: string; color: string }> = {
    general: { label: 'General', icon: '📝', color: '#9E9E9E' },
    form: { label: 'Form & Technique', icon: '✓', color: '#2196F3' },
    progression: { label: 'Progression', icon: '📈', color: '#4CAF50' },
    injury: { label: 'Injury/Recovery', icon: '🏥', color: '#FF9800' },
    motivation: { label: 'Motivation', icon: '💪', color: '#9C27B0' },
  };

  const handleAddNote = () => {
    if (!noteText.trim()) {
      alert('Please enter a note');
      return;
    }

    const note = TrainerService.addTrainerNote(
      trainerId,
      clientId,
      noteText,
      selectedCategory
    );

    onNoteAdded(note);
    setNoteText('');
    setShowAddNote(false);
  };

  const handleCancel = () => {
    setNoteText('');
    setShowAddNote(false);
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕ Close</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trainer Notes</Text>
          <TouchableOpacity onPress={() => setShowAddNote(true)}>
            <Text style={styles.addButton}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Existing Notes */}
          {existingNotes.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes History</Text>
              {existingNotes.map(note => {
                const category = categoryInfo[note.category as NoteCategory] || categoryInfo.general;
                return (
                  <View key={note.id} style={[styles.noteCard, { borderLeftColor: category.color }]}>
                    <View style={styles.noteHeader}>
                      <View style={styles.noteCategoryBadge}>
                        <Text style={styles.categoryIcon}>{category.icon}</Text>
                        <Text style={[styles.categoryLabel, { color: category.color }]}>
                          {category.label}
                        </Text>
                      </View>
                      <Text style={styles.noteDate}>{formatDate(note.timestamp)}</Text>
                    </View>
                    <Text style={styles.noteText}>{note.note}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>No Notes Yet</Text>
              <Text style={styles.emptyText}>
                Add notes to track observations, progress, and coaching insights
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowAddNote(true)}
              >
                <Text style={styles.emptyButtonText}>Add First Note</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Add Note Modal */}
        <Modal
          visible={showAddNote}
          animationType="fade"
          transparent={true}
          onRequestClose={handleCancel}
        >
          <View style={styles.addNoteOverlay}>
            <View style={styles.addNoteCard}>
              <Text style={styles.addNoteTitle}>Add Trainer Note</Text>
              
              {/* Category Selection */}
              <Text style={styles.label}>Category:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {(Object.keys(categoryInfo) as NoteCategory[]).map(category => {
                  const info = categoryInfo[category];
                  const isSelected = selectedCategory === category;
                  
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        isSelected && { backgroundColor: info.color, borderColor: info.color }
                      ]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Text style={styles.chipIcon}>{info.icon}</Text>
                      <Text style={[
                        styles.chipLabel,
                        isSelected && styles.chipLabelSelected
                      ]}>
                        {info.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              
              {/* Note Input */}
              <Text style={styles.label}>Note:</Text>
              <TextInput
                style={styles.noteInput}
                value={noteText}
                onChangeText={setNoteText}
                placeholder="Enter your coaching note..."
                multiline
                numberOfLines={6}
                autoFocus
              />
              
              {/* Buttons */}
              <View style={styles.addNoteButtons}>
                <TouchableOpacity style={styles.cancelNoteButton} onPress={handleCancel}>
                  <Text style={styles.cancelNoteText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.saveNoteButton,
                    { backgroundColor: categoryInfo[selectedCategory].color },
                    !noteText.trim() && styles.saveNoteButtonDisabled
                  ]}
                  onPress={handleAddNote}
                  disabled={!noteText.trim()}
                >
                  <Text style={styles.saveNoteText}>Add Note</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    paddingTop: spacing.huge,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    ...typography.body,
    fontSize: 15,
    color: '#666666',
    fontWeight: '600',
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  addButton: {
    ...typography.body,
    fontSize: 15,
    color: '#2196F3',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  section: {
    margin: spacing.base,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.md,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  noteCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '700',
  },
  noteDate: {
    ...typography.labelSmall,
    fontSize: 11,
    color: '#999999',
  },
  noteText: {
    ...typography.body,
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.huge,
    marginTop: spacing.huge * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.base,
  },
  emptyTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  emptyButton: {
    backgroundColor: '#2196F3',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.generous,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  emptyButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  
  // Add Note Modal
  addNoteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: spacing.base,
  },
  addNoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.generous,
    ...shadows.xl,
  },
  addNoteTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.base,
  },
  label: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: spacing.sm,
  },
  categoryScroll: {
    marginBottom: spacing.base,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    marginRight: spacing.sm,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipLabel: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  chipLabelSelected: {
    color: '#FFFFFF',
  },
  noteInput: {
    backgroundColor: '#F5F5F5',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...typography.body,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: spacing.base,
  },
  addNoteButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelNoteButton: {
    flex: 1,
    paddingVertical: spacing.comfortable,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  cancelNoteText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
  },
  saveNoteButton: {
    flex: 2,
    paddingVertical: spacing.comfortable,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.md,
  },
  saveNoteButtonDisabled: {
    backgroundColor: '#BDBDBD',
    opacity: 0.5,
  },
  saveNoteText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default TrainerNotesModal;

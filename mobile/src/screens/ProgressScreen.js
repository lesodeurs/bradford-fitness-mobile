import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiService, StorageUtils } from '../services/api';

export default function ProgressScreen() {
  const [userId, setUserId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    bodyFatPercentage: '',
    muscleMass: '',
    notes: '',
  });

  React.useEffect(() => {
    const getUserId = async () => {
      const id = await StorageUtils.getUserId();
      setUserId(id);
    };
    getUserId();
  }, []);

  const { data: progressEntries, isLoading, refetch } = useQuery({
    queryKey: ['progress', userId],
    queryFn: () => apiService.getProgressEntries(userId),
    enabled: !!userId,
  });

  const addProgressMutation = useMutation({
    mutationFn: (progressData) => apiService.createProgressEntry(userId, progressData),
    onSuccess: () => {
      Alert.alert('Success', 'Progress entry added successfully!');
      setShowAddForm(false);
      setFormData({
        weight: '',
        bodyFatPercentage: '',
        muscleMass: '',
        notes: '',
      });
      refetch();
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to add progress entry. Please try again.');
    },
  });

  const handleSubmit = () => {
    if (!formData.weight) {
      Alert.alert('Missing Information', 'Please enter your weight');
      return;
    }

    const progressData = {
      weight: parseInt(formData.weight),
      bodyFatPercentage: formData.bodyFatPercentage ? parseInt(formData.bodyFatPercentage) : null,
      muscleMass: formData.muscleMass ? parseInt(formData.muscleMass) : null,
      notes: formData.notes || null,
    };

    addProgressMutation.mutate(progressData);
  };

  const renderAddForm = () => (
    <View style={styles.formCard}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Add Progress Entry</Text>
        <TouchableOpacity onPress={() => setShowAddForm(false)}>
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Weight (lbs) *</Text>
        <TextInput
          style={styles.input}
          value={formData.weight}
          onChangeText={(value) => setFormData(prev => ({ ...prev, weight: value }))}
          keyboardType="numeric"
          placeholder="Enter your current weight"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Body Fat Percentage (%)</Text>
        <TextInput
          style={styles.input}
          value={formData.bodyFatPercentage}
          onChangeText={(value) => setFormData(prev => ({ ...prev, bodyFatPercentage: value }))}
          keyboardType="numeric"
          placeholder="Optional"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Muscle Mass (lbs)</Text>
        <TextInput
          style={styles.input}
          value={formData.muscleMass}
          onChangeText={(value) => setFormData(prev => ({ ...prev, muscleMass: value }))}
          keyboardType="numeric"
          placeholder="Optional"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.notes}
          onChangeText={(value) => setFormData(prev => ({ ...prev, notes: value }))}
          placeholder="How are you feeling? Any observations?"
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={addProgressMutation.isPending}
      >
        {addProgressMutation.isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Add Entry</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderProgressList = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />;
    }

    if (!progressEntries || progressEntries.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="trending-up-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Progress Entries</Text>
          <Text style={styles.emptyText}>
            Start tracking your progress by adding your first entry.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.progressList}>
        {progressEntries.map((entry, index) => (
          <View key={entry.id || index} style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressDate}>
                {new Date(entry.entryDate).toLocaleDateString()}
              </Text>
              <View style={styles.progressStats}>
                <Text style={styles.progressWeight}>{entry.weight} lbs</Text>
              </View>
            </View>

            <View style={styles.progressDetails}>
              {entry.bodyFatPercentage && (
                <View style={styles.progressDetail}>
                  <Text style={styles.progressDetailLabel}>Body Fat</Text>
                  <Text style={styles.progressDetailValue}>{entry.bodyFatPercentage}%</Text>
                </View>
              )}
              {entry.muscleMass && (
                <View style={styles.progressDetail}>
                  <Text style={styles.progressDetailLabel}>Muscle Mass</Text>
                  <Text style={styles.progressDetailValue}>{entry.muscleMass} lbs</Text>
                </View>
              )}
            </View>

            {entry.notes && (
              <Text style={styles.progressNotes}>{entry.notes}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {!showAddForm && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Progress</Text>
        </TouchableOpacity>
      )}

      {showAddForm ? renderAddForm() : renderProgressList()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  formCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  progressList: {
    flex: 1,
    padding: 16,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressStats: {
    alignItems: 'flex-end',
  },
  progressWeight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  progressDetail: {
    alignItems: 'center',
  },
  progressDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  progressDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  progressNotes: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
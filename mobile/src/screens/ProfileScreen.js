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
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { apiService, StorageUtils } from '../services/api';

export default function ProfileScreen() {
  const [userId, setUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  React.useEffect(() => {
    const getUserId = async () => {
      const id = await StorageUtils.getUserId();
      setUserId(id);
    };
    getUserId();
  }, []);

  const { data: subscriptionData } = useQuery({
    queryKey: ['subscription', userId],
    queryFn: () => apiService.getSubscriptionStatus(userId),
    enabled: !!userId,
  });

  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiService.getUser(userId),
    enabled: !!userId,
    onSuccess: (data) => {
      setFormData(data);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (profileData) => apiService.updateUserProfile(userId, profileData),
    onSuccess: () => {
      Alert.alert('Success', 'Your profile has been updated successfully.');
      setIsEditing(false);
    },
    onError: (error) => {
      Alert.alert('Update Failed', error.message || 'Failed to update profile');
    },
  });

  const getNextUpdateDate = () => {
    if (!subscriptionData?.lastProfileUpdate) return null;
    const lastUpdate = new Date(subscriptionData.lastProfileUpdate);
    const nextUpdate = new Date(lastUpdate.getTime() + (3 * 30 * 24 * 60 * 60 * 1000));
    return nextUpdate.toLocaleDateString();
  };

  const handleSave = () => {
    const updatedData = {
      age: parseInt(formData.age),
      sex: formData.sex,
      weight: parseInt(formData.weight),
      activityLevel: formData.activityLevel,
    };

    updateProfileMutation.mutate(updatedData);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Update Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons name="settings-outline" size={24} color="#3B82F6" />
          <Text style={styles.statusTitle}>Profile Update Status</Text>
        </View>
        
        {!subscriptionData?.hasActiveSubscription ? (
          <View style={styles.statusAlert}>
            <Ionicons name="lock-closed" size={20} color="#F59E0B" />
            <Text style={styles.statusMessage}>
              An active subscription is required to update your health profile.
            </Text>
          </View>
        ) : subscriptionData.canUpdateProfile ? (
          <View style={[styles.statusAlert, styles.statusSuccess]}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={[styles.statusMessage, styles.statusMessageSuccess]}>
              You can update your health profile. Changes will generate new personalized plans.
            </Text>
          </View>
        ) : (
          <View style={[styles.statusAlert, styles.statusInfo]}>
            <Ionicons name="time" size={20} color="#3B82F6" />
            <Text style={[styles.statusMessage, styles.statusMessageInfo]}>
              Profile updates are limited to once every 3 months. Your next update will be available on {getNextUpdateDate()}.
            </Text>
          </View>
        )}
      </View>

      {/* Profile Information */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Text style={styles.profileTitle}>Health Information</Text>
          {subscriptionData?.hasActiveSubscription && subscriptionData.canUpdateProfile && (
            <TouchableOpacity
              style={[styles.editButton, isEditing && styles.editButtonActive]}
              onPress={() => setIsEditing(!isEditing)}
              disabled={updateProfileMutation.isPending}
            >
              <Text style={[styles.editButtonText, isEditing && styles.editButtonTextActive]}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={formData.age?.toString()}
                onChangeText={(value) => setFormData(prev => ({ ...prev, age: value }))}
                keyboardType="numeric"
                placeholder="Enter your age"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sex</Text>
              <Picker
                selectedValue={formData.sex}
                onValueChange={(value) => setFormData(prev => ({ ...prev, sex: value }))}
                style={styles.picker}
              >
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
              </Picker>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight (lbs)</Text>
              <TextInput
                style={styles.input}
                value={formData.weight?.toString()}
                onChangeText={(value) => setFormData(prev => ({ ...prev, weight: value }))}
                keyboardType="numeric"
                placeholder="Enter your weight"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Activity Level</Text>
              <Picker
                selectedValue={formData.activityLevel}
                onValueChange={(value) => setFormData(prev => ({ ...prev, activityLevel: value }))}
                style={styles.picker}
              >
                <Picker.Item label="Sedentary" value="sedentary" />
                <Picker.Item label="Lightly Active" value="lightly_active" />
                <Picker.Item label="Moderately Active" value="moderately_active" />
                <Picker.Item label="Very Active" value="very_active" />
                <Picker.Item label="Extremely Active" value="extremely_active" />
              </Picker>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Update Profile</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>{userData?.age} years</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Sex</Text>
                <Text style={styles.infoValue}>{userData?.sex}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Weight</Text>
                <Text style={styles.infoValue}>{userData?.weight} lbs</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Height</Text>
                <Text style={styles.infoValue}>
                  {userData?.heightFeet}'{userData?.heightInches}"
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Activity Level</Text>
                <Text style={styles.infoValue}>
                  {userData?.activityLevel?.replace('_', ' ')}
                </Text>
              </View>
            </View>

            {subscriptionData?.lastProfileUpdate && (
              <View style={styles.updateInfo}>
                <Text style={styles.updateInfoText}>
                  Last updated: {new Date(subscriptionData.lastProfileUpdate).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  statusAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  statusSuccess: {
    backgroundColor: '#D1FAE5',
    borderLeftColor: '#10B981',
  },
  statusInfo: {
    backgroundColor: '#DBEAFE',
    borderLeftColor: '#3B82F6',
  },
  statusMessage: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    marginLeft: 8,
    lineHeight: 20,
  },
  statusMessageSuccess: {
    color: '#065F46',
  },
  statusMessageInfo: {
    color: '#1E3A8A',
  },
  profileCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  editButtonActive: {
    backgroundColor: '#F3F4F6',
    borderColor: '#6B7280',
  },
  editButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
  editButtonTextActive: {
    color: '#6B7280',
  },
  form: {
    marginTop: 8,
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
  picker: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  profileInfo: {
    marginTop: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    textTransform: 'capitalize',
  },
  updateInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
  },
  updateInfoText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
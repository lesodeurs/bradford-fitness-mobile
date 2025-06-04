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
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { apiService, StorageUtils } from '../services/api';

const STEPS = [
  'Personal Info',
  'Exercise Preferences', 
  'Nutrition Preferences',
  'Complete Setup'
];

export default function OnboardingScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Info
    age: '',
    sex: '',
    weight: '',
    heightFeet: '',
    heightInches: '',
    fitnessGoals: [],
    healthConditions: [],
    
    // Exercise Preferences
    activityLevel: '',
    exercisePreferences: [],
    equipmentAccess: [],
    workoutDuration: '',
    workoutFrequency: '',
    
    // Nutrition Preferences
    dietaryRestrictions: [],
    foodAllergies: [],
    mealsPerDay: '',
    cookingTime: '',
    budgetRange: '',
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return formData.age && formData.sex && formData.weight && 
               formData.heightFeet && formData.heightInches;
      case 1:
        return formData.activityLevel && formData.workoutDuration && 
               formData.workoutFrequency;
      case 2:
        return formData.mealsPerDay && formData.cookingTime && formData.budgetRange;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Convert string values to numbers where needed
      const userData = {
        ...formData,
        age: parseInt(formData.age),
        weight: parseInt(formData.weight),
        heightFeet: parseInt(formData.heightFeet),
        heightInches: parseInt(formData.heightInches),
        workoutDuration: parseInt(formData.workoutDuration),
        workoutFrequency: parseInt(formData.workoutFrequency),
        mealsPerDay: parseInt(formData.mealsPerDay),
      };

      const user = await apiService.createUser(userData);
      
      await StorageUtils.setUserId(user.id);
      await StorageUtils.setUserData(user);
      await StorageUtils.setOnboardingComplete(true);
      
      navigation.navigate('Main');
    } catch (error) {
      Alert.alert('Setup Failed', 'Please try again or check your connection');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPersonalInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Age *</Text>
        <TextInput
          style={styles.input}
          value={formData.age}
          onChangeText={(value) => updateFormData('age', value)}
          keyboardType="numeric"
          placeholder="Enter your age"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Sex *</Text>
        <Picker
          selectedValue={formData.sex}
          onValueChange={(value) => updateFormData('sex', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select sex" value="" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Weight (lbs) *</Text>
        <TextInput
          style={styles.input}
          value={formData.weight}
          onChangeText={(value) => updateFormData('weight', value)}
          keyboardType="numeric"
          placeholder="Enter your weight"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Height (feet) *</Text>
          <TextInput
            style={styles.input}
            value={formData.heightFeet}
            onChangeText={(value) => updateFormData('heightFeet', value)}
            keyboardType="numeric"
            placeholder="5"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Height (inches) *</Text>
          <TextInput
            style={styles.input}
            value={formData.heightInches}
            onChangeText={(value) => updateFormData('heightInches', value)}
            keyboardType="numeric"
            placeholder="8"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Fitness Goals</Text>
        {['Weight Loss', 'Muscle Gain', 'Endurance', 'General Health'].map(goal => (
          <TouchableOpacity
            key={goal}
            style={[styles.checkboxItem, formData.fitnessGoals.includes(goal) && styles.checkboxSelected]}
            onPress={() => toggleArrayItem('fitnessGoals', goal)}
          >
            <Text style={[styles.checkboxText, formData.fitnessGoals.includes(goal) && styles.checkboxTextSelected]}>
              {goal}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderExercisePreferences = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Exercise Preferences</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Activity Level *</Text>
        <Picker
          selectedValue={formData.activityLevel}
          onValueChange={(value) => updateFormData('activityLevel', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select activity level" value="" />
          <Picker.Item label="Sedentary" value="sedentary" />
          <Picker.Item label="Lightly Active" value="lightly_active" />
          <Picker.Item label="Moderately Active" value="moderately_active" />
          <Picker.Item label="Very Active" value="very_active" />
          <Picker.Item label="Extremely Active" value="extremely_active" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Workout Duration (minutes) *</Text>
        <TextInput
          style={styles.input}
          value={formData.workoutDuration}
          onChangeText={(value) => updateFormData('workoutDuration', value)}
          keyboardType="numeric"
          placeholder="30"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Workout Frequency (days per week) *</Text>
        <TextInput
          style={styles.input}
          value={formData.workoutFrequency}
          onChangeText={(value) => updateFormData('workoutFrequency', value)}
          keyboardType="numeric"
          placeholder="3"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Exercise Preferences</Text>
        {['Cardio', 'Strength Training', 'Yoga', 'Swimming', 'Running'].map(pref => (
          <TouchableOpacity
            key={pref}
            style={[styles.checkboxItem, formData.exercisePreferences.includes(pref) && styles.checkboxSelected]}
            onPress={() => toggleArrayItem('exercisePreferences', pref)}
          >
            <Text style={[styles.checkboxText, formData.exercisePreferences.includes(pref) && styles.checkboxTextSelected]}>
              {pref}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderNutritionPreferences = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Nutrition Preferences</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Meals Per Day *</Text>
        <TextInput
          style={styles.input}
          value={formData.mealsPerDay}
          onChangeText={(value) => updateFormData('mealsPerDay', value)}
          keyboardType="numeric"
          placeholder="3"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cooking Time Available *</Text>
        <Picker
          selectedValue={formData.cookingTime}
          onValueChange={(value) => updateFormData('cookingTime', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select cooking time" value="" />
          <Picker.Item label="15 minutes or less" value="quick" />
          <Picker.Item label="30 minutes" value="moderate" />
          <Picker.Item label="1 hour or more" value="extended" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Budget Range *</Text>
        <Picker
          selectedValue={formData.budgetRange}
          onValueChange={(value) => updateFormData('budgetRange', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select budget range" value="" />
          <Picker.Item label="Budget-friendly" value="low" />
          <Picker.Item label="Moderate" value="medium" />
          <Picker.Item label="Premium" value="high" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Dietary Restrictions</Text>
        {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto'].map(restriction => (
          <TouchableOpacity
            key={restriction}
            style={[styles.checkboxItem, formData.dietaryRestrictions.includes(restriction) && styles.checkboxSelected]}
            onPress={() => toggleArrayItem('dietaryRestrictions', restriction)}
          >
            <Text style={[styles.checkboxText, formData.dietaryRestrictions.includes(restriction) && styles.checkboxTextSelected]}>
              {restriction}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderComplete = () => (
    <View style={styles.stepContent}>
      <View style={styles.completeContainer}>
        <Ionicons name="checkmark-circle" size={80} color="#10B981" />
        <Text style={styles.completeTitle}>Setup Complete!</Text>
        <Text style={styles.completeText}>
          Your health profile is ready. We'll generate personalized fitness and nutrition plans based on your information.
        </Text>
        <Text style={styles.completeSubtext}>
          Start your 7-day free trial and experience evidence-based health planning.
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderPersonalInfo();
      case 1: return renderExercisePreferences();
      case 2: return renderNutritionPreferences();
      case 3: return renderComplete();
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bradford Fitness AI</Text>
        <Text style={styles.headerSubtitle}>Health Profile Setup</Text>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {STEPS.map((step, index) => (
          <View key={index} style={styles.progressStep}>
            <View style={[
              styles.progressCircle,
              index <= currentStep && styles.progressCircleActive
            ]}>
              <Text style={[
                styles.progressNumber,
                index <= currentStep && styles.progressNumberActive
              ]}>
                {index + 1}
              </Text>
            </View>
            <Text style={[
              styles.progressLabel,
              index <= currentStep && styles.progressLabelActive
            ]}>
              {step}
            </Text>
          </View>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.nextButton, !validateCurrentStep() && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.nextButtonText}>
              {currentStep === STEPS.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressCircleActive: {
    backgroundColor: '#3B82F6',
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  progressNumberActive: {
    color: 'white',
  },
  progressLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  progressLabelActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
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
  row: {
    flexDirection: 'row',
  },
  checkboxItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  checkboxSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF4FF',
  },
  checkboxText: {
    fontSize: 14,
    color: '#374151',
  },
  checkboxTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  completeContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 20,
    marginBottom: 12,
  },
  completeText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  completeSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  backButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  nextButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});
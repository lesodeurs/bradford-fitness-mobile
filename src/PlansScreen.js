import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiService, StorageUtils } from '../services/api';

export default function PlansScreen() {
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('workout');

  React.useEffect(() => {
    const getUserId = async () => {
      const id = await StorageUtils.getUserId();
      setUserId(id);
    };
    getUserId();
  }, []);

  const { data: workoutPlan, isLoading: workoutLoading } = useQuery({
    queryKey: ['workoutPlan', userId],
    queryFn: () => apiService.getWorkoutPlan(userId),
    enabled: !!userId,
  });

  const { data: nutritionPlan, isLoading: nutritionLoading } = useQuery({
    queryKey: ['nutritionPlan', userId],
    queryFn: () => apiService.getNutritionPlan(userId),
    enabled: !!userId,
  });

  const generateWorkoutMutation = useMutation({
    mutationFn: () => apiService.generateWorkoutPlan(userId),
    onSuccess: () => {
      Alert.alert('Success', 'Your workout plan has been generated!');
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to generate workout plan. Please try again.');
    },
  });

  const generateNutritionMutation = useMutation({
    mutationFn: () => apiService.generateNutritionPlan(userId),
    onSuccess: () => {
      Alert.alert('Success', 'Your nutrition plan has been generated!');
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to generate nutrition plan. Please try again.');
    },
  });

  const renderWorkoutPlan = () => {
    if (workoutLoading) {
      return <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />;
    }

    if (!workoutPlan) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="fitness-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Workout Plan Yet</Text>
          <Text style={styles.emptyText}>
            Generate your personalized workout plan based on your health profile.
          </Text>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={() => generateWorkoutMutation.mutate()}
            disabled={generateWorkoutMutation.isPending}
          >
            {generateWorkoutMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.generateButtonText}>Generate Workout Plan</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView style={styles.planContent}>
        {workoutPlan.planData?.weeklySchedule?.map((day, index) => (
          <View key={index} style={styles.dayCard}>
            <Text style={styles.dayTitle}>{day.day}</Text>
            <Text style={styles.dayDuration}>Duration: {day.totalDuration} minutes</Text>
            
            {day.exercises.map((exercise, exerciseIndex) => (
              <View key={exerciseIndex} style={styles.exerciseCard}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <View style={styles.exerciseDetails}>
                  {exercise.sets && (
                    <Text style={styles.exerciseDetail}>Sets: {exercise.sets}</Text>
                  )}
                  {exercise.reps && (
                    <Text style={styles.exerciseDetail}>Reps: {exercise.reps}</Text>
                  )}
                  {exercise.duration && (
                    <Text style={styles.exerciseDetail}>Duration: {exercise.duration}</Text>
                  )}
                </View>
                <Text style={styles.exerciseInstructions}>{exercise.instructions}</Text>
                {exercise.modifications && (
                  <Text style={styles.exerciseModifications}>
                    Modifications: {exercise.modifications}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}

        {workoutPlan.planData?.guidelines && (
          <View style={styles.guidelinesCard}>
            <Text style={styles.guidelinesTitle}>Guidelines</Text>
            {workoutPlan.planData.guidelines.map((guideline, index) => (
              <Text key={index} style={styles.guidelineItem}>• {guideline}</Text>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderNutritionPlan = () => {
    if (nutritionLoading) {
      return <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />;
    }

    if (!nutritionPlan) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="restaurant-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Nutrition Plan Yet</Text>
          <Text style={styles.emptyText}>
            Generate your personalized nutrition plan based on your dietary preferences.
          </Text>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={() => generateNutritionMutation.mutate()}
            disabled={generateNutritionMutation.isPending}
          >
            {generateNutritionMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.generateButtonText}>Generate Nutrition Plan</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView style={styles.planContent}>
        {nutritionPlan.planData?.dailyCalories && (
          <View style={styles.macroCard}>
            <Text style={styles.macroTitle}>Daily Targets</Text>
            <Text style={styles.caloriesText}>
              {nutritionPlan.planData.dailyCalories} calories
            </Text>
            {nutritionPlan.planData.macronutrients && (
              <View style={styles.macroGrid}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Protein</Text>
                  <Text style={styles.macroValue}>
                    {nutritionPlan.planData.macronutrients.protein}g
                  </Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Carbs</Text>
                  <Text style={styles.macroValue}>
                    {nutritionPlan.planData.macronutrients.carbs}g
                  </Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Fat</Text>
                  <Text style={styles.macroValue}>
                    {nutritionPlan.planData.macronutrients.fat}g
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {nutritionPlan.planData?.mealPlan?.map((day, index) => (
          <View key={index} style={styles.dayCard}>
            <Text style={styles.dayTitle}>{day.day}</Text>
            
            {day.meals.map((meal, mealIndex) => (
              <View key={mealIndex} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealCalories}>{meal.calories} cal</Text>
                </View>
                
                <Text style={styles.mealSubtitle}>
                  Prep time: {meal.prepTime} minutes
                </Text>
                
                <Text style={styles.mealSectionTitle}>Ingredients:</Text>
                {meal.ingredients.map((ingredient, i) => (
                  <Text key={i} style={styles.mealIngredient}>• {ingredient}</Text>
                ))}
                
                <Text style={styles.mealSectionTitle}>Instructions:</Text>
                {meal.instructions.map((instruction, i) => (
                  <Text key={i} style={styles.mealInstruction}>
                    {i + 1}. {instruction}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'workout' && styles.activeTab]}
          onPress={() => setActiveTab('workout')}
        >
          <Ionicons 
            name="fitness" 
            size={20} 
            color={activeTab === 'workout' ? '#3B82F6' : '#9CA3AF'} 
          />
          <Text style={[styles.tabText, activeTab === 'workout' && styles.activeTabText]}>
            Workout
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'nutrition' && styles.activeTab]}
          onPress={() => setActiveTab('nutrition')}
        >
          <Ionicons 
            name="restaurant" 
            size={20} 
            color={activeTab === 'nutrition' ? '#3B82F6' : '#9CA3AF'} 
          />
          <Text style={[styles.tabText, activeTab === 'nutrition' && styles.activeTabText]}>
            Nutrition
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'workout' ? renderWorkoutPlan() : renderNutritionPlan()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginLeft: 8,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
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
    marginBottom: 24,
  },
  generateButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  planContent: {
    flex: 1,
    padding: 16,
  },
  dayCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  dayDuration: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  exerciseDetail: {
    fontSize: 14,
    color: '#3B82F6',
    marginRight: 16,
    marginBottom: 4,
  },
  exerciseInstructions: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  exerciseModifications: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  guidelinesCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  guidelinesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  guidelineItem: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  macroCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  macroTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  caloriesText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    textAlign: 'center',
    marginBottom: 16,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  mealCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  mealCalories: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  mealSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  mealSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    marginBottom: 4,
  },
  mealIngredient: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 2,
  },
  mealInstruction: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 2,
    lineHeight: 16,
  },
});

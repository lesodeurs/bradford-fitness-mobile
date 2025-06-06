import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiService, StorageUtils } from '../services/api';

export default function DashboardScreen({ navigation }) {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const id = await StorageUtils.getUserId();
      const onboardingComplete = await StorageUtils.isOnboardingComplete();
      
      if (!id || !onboardingComplete) {
        navigation.navigate('Onboarding');
      } else {
        setUserId(id);
      }
    };
    
    checkUser();
  }, []);

  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription', userId],
    queryFn: () => apiService.getSubscriptionStatus(userId),
    enabled: !!userId,
  });

  const { data: workoutPlan } = useQuery({
    queryKey: ['workoutPlan', userId],
    queryFn: () => apiService.getWorkoutPlan(userId),
    enabled: !!userId,
  });

  const { data: nutritionPlan } = useQuery({
    queryKey: ['nutritionPlan', userId],
    queryFn: () => apiService.getNutritionPlan(userId),
    enabled: !!userId,
  });

  const getSubscriptionStatus = () => {
    if (!subscriptionData) return null;

    const daysRemaining = subscriptionData.trialEndsAt 
      ? Math.max(0, Math.ceil((new Date(subscriptionData.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    if (subscriptionData.hasActiveSubscription) {
      return {
        type: 'active',
        title: 'Subscription Active',
        message: 'Enjoy unlimited access to personalized plans!',
        color: '#10B981',
      };
    } else if (subscriptionData.isTrialExpired) {
      return {
        type: 'expired',
        title: 'Trial Expired',
        message: 'Subscribe to continue accessing your plans',
        color: '#EF4444',
      };
    } else if (daysRemaining <= 3) {
      return {
        type: 'warning',
        title: `${daysRemaining} Days Left`,
        message: 'Your trial ends soon. Subscribe to continue!',
        color: '#F59E0B',
      };
    } else {
      return {
        type: 'trial',
        title: `${daysRemaining} Days Remaining`,
        message: 'Explore all features during your free trial',
        color: '#3B82F6',
      };
    }
  };

  const subscriptionStatus = getSubscriptionStatus();

  if (!userId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        style={styles.heroSection}
      >
        <Text style={styles.heroTitle}>Welcome to Bradford Fitness AI</Text>
        <Text style={styles.heroSubtitle}>
          Evidence-based fitness and nutrition plans tailored for you
        </Text>
      </LinearGradient>

      {/* Subscription Status */}
      {subscriptionStatus && (
        <View style={[styles.statusCard, { borderLeftColor: subscriptionStatus.color }]}>
          <View style={styles.statusContent}>
            <Ionicons 
              name={subscriptionStatus.type === 'active' ? 'checkmark-circle' : 
                    subscriptionStatus.type === 'expired' ? 'warning' : 'time'} 
              size={24} 
              color={subscriptionStatus.color} 
            />
            <View style={styles.statusText}>
              <Text style={styles.statusTitle}>{subscriptionStatus.title}</Text>
              <Text style={styles.statusMessage}>{subscriptionStatus.message}</Text>
            </View>
          </View>
          {(subscriptionStatus.type === 'expired' || subscriptionStatus.type === 'warning') && (
            <TouchableOpacity 
              style={[styles.subscribeButton, { backgroundColor: subscriptionStatus.color }]}
              onPress={() => navigation.navigate('Subscription')}
            >
              <Text style={styles.subscribeButtonText}>Subscribe</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Plans')}
          >
            <Ionicons name="fitness-outline" size={32} color="#3B82F6" />
            <Text style={styles.actionTitle}>View Plans</Text>
            <Text style={styles.actionSubtitle}>
              {workoutPlan && nutritionPlan ? 'Your plans are ready' : 'Generate your plans'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Progress')}
          >
            <Ionicons name="trending-up-outline" size={32} color="#10B981" />
            <Text style={styles.actionTitle}>Track Progress</Text>
            <Text style={styles.actionSubtitle}>Log your achievements</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-outline" size={32} color="#F59E0B" />
            <Text style={styles.actionTitle}>Update Profile</Text>
            <Text style={styles.actionSubtitle}>Modify health info</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Subscription')}
          >
            <Ionicons name="card-outline" size={32} color="#8B5CF6" />
            <Text style={styles.actionTitle}>Subscription</Text>
            <Text style={styles.actionSubtitle}>Manage your plan</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Features Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What You Get</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>AI-powered workout plans based on ACSM guidelines</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>Personalized nutrition plans following USDA recommendations</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>Progress tracking and plan adjustments</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>Evidence-based recommendations from health organizations</Text>
          </View>
        </View>
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
  heroSection: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    lineHeight: 24,
  },
  statusCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  subscribeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  subscribeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  featuresList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

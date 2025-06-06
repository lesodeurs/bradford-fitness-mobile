import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { apiService, StorageUtils } from '../services/api';

export default function SubscriptionScreen() {
  const [userId, setUserId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  React.useEffect(() => {
    const getUserId = async () => {
      const id = await StorageUtils.getUserId();
      setUserId(id);
    };
    getUserId();
  }, []);

  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ['subscription', userId],
    queryFn: () => apiService.getSubscriptionStatus(userId),
    enabled: !!userId,
  });

  const handlePaymentSelection = (method) => {
    setSelectedPayment(method);
    Alert.alert(
      'Payment Method Selected',
      `You selected ${method}. This would integrate with the ${method} payment system in a production app.`,
      [
        {
          text: 'Continue',
          onPress: () => {
            Alert.alert(
              'Demo Mode',
              'This is a demo of the mobile app. In production, this would process the payment and activate your subscription.',
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getTrialStatus = () => {
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
        icon: 'checkmark-circle',
      };
    } else if (subscriptionData.isTrialExpired) {
      return {
        type: 'expired',
        title: 'Trial Expired',
        message: 'Subscribe to continue accessing your plans',
        color: '#EF4444',
        icon: 'warning',
      };
    } else if (daysRemaining <= 3) {
      return {
        type: 'warning',
        title: `${daysRemaining} Days Left`,
        message: 'Your trial ends soon. Subscribe to continue!',
        color: '#F59E0B',
        icon: 'time',
      };
    } else {
      return {
        type: 'trial',
        title: `${daysRemaining} Days Remaining`,
        message: 'Explore all features during your free trial',
        color: '#3B82F6',
        icon: 'gift',
      };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const trialStatus = getTrialStatus();

  return (
    <ScrollView style={styles.container}>
      {/* Subscription Status */}
      {trialStatus && (
        <View style={[styles.statusCard, { borderLeftColor: trialStatus.color }]}>
          <View style={styles.statusContent}>
            <Ionicons name={trialStatus.icon} size={32} color={trialStatus.color} />
            <View style={styles.statusText}>
              <Text style={[styles.statusTitle, { color: trialStatus.color }]}>
                {trialStatus.title}
              </Text>
              <Text style={styles.statusMessage}>{trialStatus.message}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Subscription Plan */}
      <View style={styles.planCard}>
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>Bradford Fitness AI Pro</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>$30</Text>
            <Text style={styles.pricePeriod}>/month</Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What's Included:</Text>
          
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
            <Text style={styles.featureText}>Profile updates every 3 months</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>Evidence-based recommendations from health organizations</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>Mobile app access</Text>
          </View>
        </View>

        <View style={styles.trialInfo}>
          <Text style={styles.trialText}>7-day free trial • Cancel anytime</Text>
        </View>
      </View>

      {/* Payment Methods */}
      {(!subscriptionData?.hasActiveSubscription) && (
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Choose Payment Method</Text>
          
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              selectedPayment === 'stripe' && styles.paymentMethodSelected
            ]}
            onPress={() => handlePaymentSelection('Stripe')}
          >
            <View style={styles.paymentMethodContent}>
              <Ionicons name="card-outline" size={24} color="#3B82F6" />
              <View style={styles.paymentMethodText}>
                <Text style={styles.paymentMethodTitle}>Credit Card</Text>
                <Text style={styles.paymentMethodSubtitle}>Visa, Mastercard, American Express</Text>
              </View>
            </View>
            <Ionicons 
              name={selectedPayment === 'stripe' ? 'radio-button-on' : 'radio-button-off'} 
              size={24} 
              color="#3B82F6" 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethod,
              selectedPayment === 'paypal' && styles.paymentMethodSelected
            ]}
            onPress={() => handlePaymentSelection('PayPal')}
          >
            <View style={styles.paymentMethodContent}>
              <Ionicons name="logo-paypal" size={24} color="#0070BA" />
              <View style={styles.paymentMethodText}>
                <Text style={styles.paymentMethodTitle}>PayPal</Text>
                <Text style={styles.paymentMethodSubtitle}>Pay with your PayPal account</Text>
              </View>
            </View>
            <Ionicons 
              name={selectedPayment === 'paypal' ? 'radio-button-on' : 'radio-button-off'} 
              size={24} 
              color="#3B82F6" 
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Terms and Privacy */}
      <View style={styles.legalSection}>
        <Text style={styles.legalText}>
          By subscribing, you agree to our Terms of Service and Privacy Policy. 
          Your subscription will automatically renew monthly at $30.00 unless cancelled.
        </Text>
        
        <View style={styles.legalLinks}>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalLinkText}>Terms of Service</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalLinkText}>Privacy Policy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalLinkText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Health Disclaimer */}
      <View style={styles.disclaimerSection}>
        <View style={styles.disclaimerHeader}>
          <Ionicons name="medical" size={20} color="#F59E0B" />
          <Text style={styles.disclaimerTitle}>Health Disclaimer</Text>
        </View>
        <Text style={styles.disclaimerText}>
          Always consult with qualified healthcare providers before beginning any exercise program 
          or making dietary changes, especially if you have health conditions or concerns. 
          Our recommendations are for general informational purposes and are not medical advice.
        </Text>
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
    marginLeft: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusMessage: {
    fontSize: 14,
    color: '#6B7280',
  },
  planCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  pricePeriod: {
    fontSize: 18,
    color: '#6B7280',
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    lineHeight: 20,
  },
  trialInfo: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  trialText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  paymentSection: {
    margin: 16,
    marginTop: 0,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  paymentMethod: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentMethodSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF4FF',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodText: {
    marginLeft: 12,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  paymentMethodSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  legalSection: {
    margin: 16,
    marginTop: 0,
  },
  legalText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  legalLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  legalLinkText: {
    fontSize: 12,
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  disclaimerSection: {
    backgroundColor: '#FEF3C7',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
});

import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this URL to match your deployed backend
const API_BASE_URL = 'http://localhost:5000';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // User management
  async createUser(userData) {
    return this.request('/api/users', {
      method: 'POST',
      body: userData,
    });
  }

  async getUser(userId) {
    return this.request(`/api/users/${userId}`);
  }

  async updateUserProfile(userId, profileData) {
    return this.request(`/api/users/${userId}/profile`, {
      method: 'PUT',
      body: profileData,
    });
  }

  // Subscription management
  async getSubscriptionStatus(userId) {
    return this.request(`/api/users/${userId}/subscription`);
  }

  async createSubscription(subscriptionData) {
    return this.request('/api/create-subscription', {
      method: 'POST',
      body: subscriptionData,
    });
  }

  // Plan generation
  async generateWorkoutPlan(userId) {
    return this.request(`/api/users/${userId}/workout-plan`, {
      method: 'POST',
    });
  }

  async generateNutritionPlan(userId) {
    return this.request(`/api/users/${userId}/nutrition-plan`, {
      method: 'POST',
    });
  }

  async getWorkoutPlan(userId) {
    return this.request(`/api/users/${userId}/workout-plan`);
  }

  async getNutritionPlan(userId) {
    return this.request(`/api/users/${userId}/nutrition-plan`);
  }

  // Progress tracking
  async getProgressEntries(userId) {
    return this.request(`/api/users/${userId}/progress`);
  }

  async createProgressEntry(userId, progressData) {
    return this.request(`/api/users/${userId}/progress`, {
      method: 'POST',
      body: progressData,
    });
  }
}

export const apiService = new ApiService();

// Storage utilities for user session
export const StorageKeys = {
  USER_ID: 'userId',
  USER_DATA: 'userData',
  ONBOARDING_COMPLETE: 'onboardingComplete',
};

export const StorageUtils = {
  async getUserId() {
    return await AsyncStorage.getItem(StorageKeys.USER_ID);
  },

  async setUserId(userId) {
    await AsyncStorage.setItem(StorageKeys.USER_ID, userId.toString());
  },

  async getUserData() {
    const data = await AsyncStorage.getItem(StorageKeys.USER_DATA);
    return data ? JSON.parse(data) : null;
  },

  async setUserData(userData) {
    await AsyncStorage.setItem(StorageKeys.USER_DATA, JSON.stringify(userData));
  },

  async isOnboardingComplete() {
    const complete = await AsyncStorage.getItem(StorageKeys.ONBOARDING_COMPLETE);
    return complete === 'true';
  },

  async setOnboardingComplete(complete = true) {
    await AsyncStorage.setItem(StorageKeys.ONBOARDING_COMPLETE, complete.toString());
  },

  async clearUserSession() {
    await AsyncStorage.multiRemove([
      StorageKeys.USER_ID,
      StorageKeys.USER_DATA,
      StorageKeys.ONBOARDING_COMPLETE,
    ]);
  },
};

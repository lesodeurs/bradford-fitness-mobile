# Bradford Fitness AI - Cloud Deployment Guide

## Step-by-Step App Store Deployment (No Software Downloads Required)

### Prerequisites
1. **Apple Developer Account** ($99/year) - developer.apple.com
2. **Google Play Developer Account** ($25 one-time) - play.google.com/console
3. **Expo Account** (free) - expo.dev
4. **GitHub Account** (free) - github.com

### Phase 1: Prepare Your Code Repository

1. **Upload to GitHub**:
   - Create new repository: "bradford-fitness-mobile"
   - Upload entire `/mobile` folder contents
   - Ensure `app.json` and `eas.json` are included

### Phase 2: Expo EAS Setup (Cloud Building)

1. **Create Expo Project**:
   - Visit expo.dev and sign in
   - Click "New Project"
   - Connect your GitHub repository
   - Select the mobile folder as root

2. **Configure Build Settings**:
   - Project Name: "Bradford Fitness AI"
   - Bundle ID (iOS): com.bradfordfitness.app
   - Package Name (Android): com.bradfordfitness.app
   - Version: 1.0.0

3. **Upload Required Assets**:
   - App Icon (1024x1024px)
   - Splash Screen (1284x2778px)
   - Adaptive Icon for Android (1024x1024px)

### Phase 3: iOS App Store Submission

1. **Apple Developer Portal Setup**:
   - Visit developer.apple.com
   - Create App ID: com.bradfordfitness.app
   - Generate provisioning profiles
   - Create certificates (Expo can handle this automatically)

2. **App Store Connect**:
   - Visit appstoreconnect.apple.com
   - Create new app: "Bradford Fitness AI"
   - Fill app information using store-listing.md
   - Upload screenshots (6.5" iPhone format)

3. **EAS Build for iOS**:
   - In Expo dashboard, click "Build for iOS"
   - EAS builds .ipa file in cloud
   - Download and upload to App Store Connect
   - Submit for review

### Phase 4: Google Play Store Submission

1. **Google Play Console Setup**:
   - Visit play.google.com/console
   - Create new app: "Bradford Fitness AI"
   - Fill app details using store-listing.md
   - Set up content rating and privacy policy

2. **EAS Build for Android**:
   - In Expo dashboard, click "Build for Android"
   - EAS builds .aab file in cloud
   - Download Android App Bundle

3. **Upload to Play Store**:
   - In Play Console, go to Release Management
   - Upload .aab file
   - Fill release notes and submit for review

### Phase 5: Required App Store Assets

**Create these images using online tools (Canva, Figma, etc.):**

1. **App Icons**:
   - 1024x1024px with Bradford Fitness branding
   - Heart symbol + "BF" text
   - Clean, professional design

2. **Screenshots** (5-6 per platform):
   - Dashboard showing personalized plans
   - Exercise library with video thumbnails
   - Progress tracking charts
   - Community features
   - Profile and settings

3. **App Store Previews** (optional but recommended):
   - 15-30 second video showing app in action
   - Screen recording of key features

### Phase 6: Compliance and Legal

1. **Privacy Policy**: Required for both stores
2. **Terms of Service**: Required for subscription apps
3. **Content Rating**: 
   - iOS: 4+ (no restrictions)
   - Android: Everyone
4. **Health Data Permissions**: Clearly explain in app descriptions

### Phase 7: Subscription Setup

1. **Apple In-App Purchases**:
   - Create subscription product in App Store Connect
   - Product ID: premium_monthly
   - Price: $29.99/month

2. **Google Play Billing**:
   - Set up subscription in Play Console
   - Configure 7-day free trial
   - Set recurring billing

### Phase 8: Review and Launch

**iOS Review Process**:
- Typically 24-48 hours
- Common rejection reasons: incomplete app info, missing privacy policy
- Use App Store Connect to track status

**Android Review Process**:
- Usually within 24 hours
- Faster approval than iOS
- Monitor Play Console for any issues

### Estimated Timeline
- **Setup Phase**: 2-3 hours
- **Asset Creation**: 4-6 hours
- **Store Submission**: 1-2 hours
- **Review Process**: 1-3 days per platform
- **Total**: 1-2 weeks from start to app store availability

### Support Resources
- **Expo Documentation**: docs.expo.dev
- **Apple Developer Support**: developer.apple.com/support
- **Google Play Support**: support.google.com/googleplay/android-developer

### Post-Launch Checklist
1. Monitor app store reviews and ratings
2. Track download analytics
3. Update app regularly with new features
4. Respond to user feedback promptly
5. Optimize app store listings based on performance

Your mobile app is now configured and ready for cloud-based deployment to both app stores without requiring any software downloads on your computer.
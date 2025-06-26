import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Scan, Car, MapPin, CircleAlert as AlertCircle, CircleCheck as CheckCircle, RefreshCw, ExternalLink } from 'lucide-react-native';
import { router } from 'expo-router';
import { VINScanner } from '@/components/VINScanner';
import { PaywallModal } from '@/components/PaywallModal';
import { UsageBanner } from '@/components/UsageBanner';
import { LinearGradient } from 'expo-linear-gradient';
import { VINApiService } from '@/services/vinApi';
import { useSubscription } from '@/hooks/useSubscription';
import { useTheme } from '@/contexts/ThemeContext';

export default function VINLookup() {
  const { theme } = useTheme();
  const [vin, setVin] = useState('');
  const [mileage, setMileage] = useState('');
  const [condition, setCondition] = useState('Good');
  const [accidentHistory, setAccidentHistory] = useState('None');
  const [zipCode, setZipCode] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vinValidation, setVinValidation] = useState<{
    isValid: boolean;
    message?: string;
  }>({ isValid: false });
  const [showPaywall, setShowPaywall] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'validation' | 'api' | 'network' | null>(null);

  const { 
    subscriptionStatus, 
    usageStats, 
    isPro, 
    canPerformAction, 
    recordUsage, 
    subscribe 
  } = useSubscription();

  const conditions = ['Excellent', 'Good', 'Fair', 'Poor'];
  const accidentOptions = ['None', 'Minor', 'Moderate', 'Severe'];

  // Sample VINs for testing
  const sampleVINs = [
    { vin: '1HGBH41JXMN109186', label: 'Honda Civic' },
    { vin: '1FTFW1ET5DFC10312', label: 'Ford F-150' },
    { vin: '5NPE34AF4HH012345', label: 'Hyundai Elantra' }
  ];

  const validateVIN = (vinCode: string) => {
    if (!vinCode) {
      setVinValidation({ isValid: false });
      return false;
    }

    if (vinCode.length !== 17) {
      setVinValidation({ 
        isValid: false, 
        message: 'VIN must be exactly 17 characters' 
      });
      return false;
    }

    if (!/^[A-HJ-NPR-Z0-9]+$/i.test(vinCode)) {
      setVinValidation({ 
        isValid: false, 
        message: 'VIN contains invalid characters (I, O, Q not allowed)' 
      });
      return false;
    }

    setVinValidation({ isValid: true });
    return true;
  };

  const handleVINChange = (text: string) => {
    const cleanVin = text.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
    setVin(cleanVin);
    validateVIN(cleanVin);
    // Clear any previous error when user starts typing
    if (errorMessage) {
      setErrorMessage(null);
      setErrorType(null);
    }
  };

  const handleVINScan = (scannedVIN: string) => {
    setVin(scannedVIN.toUpperCase());
    validateVIN(scannedVIN.toUpperCase());
    setShowScanner(false);
    // Clear any previous error
    if (errorMessage) {
      setErrorMessage(null);
      setErrorType(null);
    }
  };

  const useSampleVIN = (sampleVin: string) => {
    setVin(sampleVin);
    validateVIN(sampleVin);
    if (errorMessage) {
      setErrorMessage(null);
      setErrorType(null);
    }
  };

  const clearError = () => {
    setErrorMessage(null);
    setErrorType(null);
  };

  const retryLookup = () => {
    clearError();
    handleLookup();
  };

  const getErrorIcon = () => {
    switch (errorType) {
      case 'validation':
        return <AlertCircle size={20} color={theme.colors.warning} />;
      case 'api':
        return <AlertCircle size={20} color={theme.colors.error} />;
      case 'network':
        return <RefreshCw size={20} color={theme.colors.error} />;
      default:
        return <AlertCircle size={20} color={theme.colors.error} />;
    }
  };

  const getErrorStyle = () => {
    switch (errorType) {
      case 'validation':
        return {
          backgroundColor: theme.colors.warning + '15',
          borderColor: theme.colors.warning + '30',
        };
      case 'api':
        return {
          backgroundColor: theme.colors.error + '15',
          borderColor: theme.colors.error + '30',
        };
      case 'network':
        return {
          backgroundColor: theme.colors.error + '15',
          borderColor: theme.colors.error + '30',
        };
      default:
        return {
          backgroundColor: theme.colors.error + '15',
          borderColor: theme.colors.error + '30',
        };
    }
  };

  const handleLookup = async () => {
    console.log('Starting VIN lookup process...');
    setErrorMessage(null);
    setErrorType(null);
    
    // Check if user can perform VIN lookup
    const permission = await canPerformAction('vin_lookup');
    if (!permission.allowed) {
      Alert.alert(
        'Lookup Required',
        permission.reason,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Get Access', onPress: () => setShowPaywall(true) }
        ]
      );
      return;
    }

    if (!validateVIN(vin)) {
      setErrorMessage(vinValidation.message || 'Please enter a valid 17-character VIN');
      setErrorType('validation');
      return;
    }

    if (!mileage || isNaN(Number(mileage)) || Number(mileage) < 0) {
      setErrorMessage('Please enter a valid mileage');
      setErrorType('validation');
      return;
    }

    if (Number(mileage) > 500000) {
      setErrorMessage('Mileage seems unusually high. Please verify the entered value.');
      setErrorType('validation');
      return;
    }

    setLoading(true);

    try {
      console.log('Decoding VIN:', vin);
      
      // First, decode the VIN to get vehicle data
      const vinResult = await VINApiService.decodeVIN(vin);
      
      console.log('VIN decode result:', vinResult);
      
      if (!vinResult.success) {
        console.error('VIN decode failed:', vinResult.error, vinResult.message);
        
        // Provide more specific error messages based on the error type
        let userMessage = vinResult.message || 'Unable to decode VIN. Please verify the VIN is correct.';
        let errorCategory: 'validation' | 'api' | 'network' = 'api';
        
        if (vinResult.error?.includes('401') || vinResult.error?.includes('403')) {
          userMessage = `🔑 **API Authentication Failed**

The VIN Data API credentials are invalid or incorrect. This typically means:

• **Secret Key** is wrong or expired
• **Username** is incorrect  
• **Password** is incorrect
• Account may be suspended or inactive

**Next Steps:**
1. Check your VIN Data dashboard at vindata.com
2. Verify all three credentials in your .env file:
   - EXPO_PUBLIC_VDP_API_KEY (secret key)
   - EXPO_PUBLIC_VDP_USERNAME (username)
   - EXPO_PUBLIC_VDP_PASSWORD (password)
3. Restart the development server after updating credentials

**Test with sample VINs below to verify the fix.**`;
          errorCategory = 'api';
        } else if (vinResult.error?.includes('404')) {
          userMessage = `🔍 **VIN Not Found**

This VIN was not found in the database. This could mean:

• The VIN may contain a typo - please double-check each character
• The vehicle may be too old or not in the VIN database
• The VIN may be from a manufacturer not covered by the service

**Try:**
• Double-check the VIN for accuracy
• Use one of the sample VINs below to test the connection
• Contact VIN Data support if you believe this VIN should be found`;
          errorCategory = 'validation';
        } else if (vinResult.error?.includes('429')) {
          userMessage = `⏱️ **Rate Limit Exceeded**

Too many requests have been made. Please wait a moment before trying again.

**VIN Data API Limits:**
• Maximum 100 requests per minute
• Current usage shown in response headers

**Try again in a few minutes.**`;
          errorCategory = 'api';
        } else if (vinResult.error?.includes('Network error') || vinResult.error?.includes('fetch')) {
          userMessage = `🌐 **Network Connection Error**

Unable to connect to the VIN service. This could be due to:

• Internet connection issues
• VIN Data API service temporarily unavailable
• Firewall or proxy blocking the request

**Try:**
• Check your internet connection
• Wait a moment and try again
• Use sample VINs to test connectivity`;
          errorCategory = 'network';
        } else if (vinResult.error?.includes('500')) {
          userMessage = `🔧 **Service Temporarily Unavailable**

The VIN Data service is experiencing technical difficulties.

**This is usually temporary. Please:**
• Wait a few minutes and try again
• Use sample VINs to test when service is restored
• Check VIN Data status page for updates`;
          errorCategory = 'api';
        }
        
        setErrorMessage(userMessage);
        setErrorType(errorCategory);
        return;
      }

      if (!vinResult.data) {
        console.error('No vehicle data returned');
        setErrorMessage(`🚗 **No Vehicle Data Found**

The VIN was processed but no vehicle information was returned.

**This could mean:**
• The VIN is valid but not in the database
• The vehicle data is incomplete or unavailable
• There was an issue processing the response

**Try:**
• Verify the VIN is correct
• Use a sample VIN to test the service
• Contact support if this persists`);
        setErrorType('api');
        return;
      }

      console.log('Vehicle data retrieved:', vinResult.data);

      // Record usage (this will handle pay-per-request credits and free tier limits)
      await recordUsage('vin_lookup');

      console.log('Navigating to valuation page...');

      // Navigate to valuation results with the decoded vehicle data
      router.push({
        pathname: '/valuation',
        params: {
          vin,
          mileage,
          condition,
          accidentHistory,
          zipCode,
          vehicleData: JSON.stringify(vinResult.data),
        },
      });
    } catch (error) {
      console.error('Lookup error:', error);
      setErrorMessage(`💥 **Unexpected Error**

An unexpected error occurred while processing your request.

**Error Details:**
${error instanceof Error ? error.message : 'Unknown error occurred'}

**Try:**
• Check your internet connection
• Wait a moment and try again
• Use a sample VIN to test the service
• Contact support if this continues`);
      setErrorType('network');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    return await subscribe(planId);
  };

  if (showScanner) {
    return (
      <VINScanner
        onVINScanned={handleVINScan}
        onClose={() => setShowScanner(false)}
      />
    );
  }

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>SmartVIN</Text>
        <Text style={styles.headerSubtitle}>AI-Powered Vehicle Valuation</Text>
      </LinearGradient>

      {/* Centered Usage Banner */}
      <View style={styles.bannerContainer}>
        {usageStats && (
          <UsageBanner
            vinLookupsUsed={usageStats.vinLookupsUsed}
            vinLookupsLimit={usageStats.vinLookupsLimit}
            payPerRequestCredits={usageStats.payPerRequestCredits}
            isPro={isPro}
            onUpgrade={() => setShowPaywall(true)}
          />
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Enhanced Error Message Display */}
        {errorMessage && (
          <View style={[styles.errorBanner, getErrorStyle()]}>
            <View style={styles.errorHeader}>
              {getErrorIcon()}
              <Text style={styles.errorTitle}>
                {errorType === 'validation' ? 'Input Error' :
                 errorType === 'api' ? 'API Error' :
                 errorType === 'network' ? 'Connection Error' : 'Error'}
              </Text>
              <TouchableOpacity style={styles.closeErrorButton} onPress={clearError}>
                <AlertCircle size={16} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
            {(errorType === 'network' || errorType === 'api') && (
              <View style={styles.errorActions}>
                <TouchableOpacity style={styles.retryButton} onPress={retryLookup}>
                  <RefreshCw size={16} color={theme.colors.primary} />
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
                {errorType === 'api' && (
                  <TouchableOpacity 
                    style={styles.helpButton}
                    onPress={() => {
                      // In a real app, this could open documentation or support
                      Alert.alert(
                        'Need Help?',
                        'Check the README.md file for detailed setup instructions, or contact support for assistance with API configuration.',
                        [{ text: 'OK' }]
                      );
                    }}
                  >
                    <ExternalLink size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.helpButtonText}>Get Help</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>VIN Number</Text>
            <View style={styles.vinInputContainer}>
              <TextInput
                style={[
                  styles.vinInput,
                  vin.length > 0 && !vinValidation.isValid && styles.inputError
                ]}
                value={vin}
                onChangeText={handleVINChange}
                placeholder="Enter 17-digit VIN"
                placeholderTextColor={theme.colors.textTertiary}
                maxLength={17}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => setShowScanner(true)}
              >
                <Scan size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            {vin.length > 0 && !vinValidation.isValid && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={theme.colors.error} />
                <Text style={styles.errorText}>
                  {vinValidation.message || 'Invalid VIN format'}
                </Text>
              </View>
            )}
            {vinValidation.isValid && (
              <View style={styles.successContainer}>
                <CheckCircle size={16} color={theme.colors.success} />
                <Text style={styles.successText}>Valid VIN format</Text>
              </View>
            )}
            
            {/* Enhanced Sample VINs for testing */}
            <View style={styles.sampleVinsContainer}>
              <Text style={styles.sampleVinsLabel}>Try a sample VIN:</Text>
              <View style={styles.sampleVinsGrid}>
                {sampleVINs.map((sample, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.sampleVinButton}
                    onPress={() => useSampleVIN(sample.vin)}
                  >
                    <Text style={styles.sampleVinLabel}>{sample.label}</Text>
                    <Text style={styles.sampleVinText}>
                      {sample.vin.substring(0, 8)}...
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mileage</Text>
            <TextInput
              style={styles.input}
              value={mileage}
              onChangeText={setMileage}
              placeholder="Enter current mileage"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Condition</Text>
            <View style={styles.optionContainer}>
              {conditions.map((cond) => (
                <TouchableOpacity
                  key={cond}
                  style={[
                    styles.optionButton,
                    condition === cond && styles.optionButtonActive,
                  ]}
                  onPress={() => setCondition(cond)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      condition === cond && styles.optionTextActive,
                    ]}
                  >
                    {cond}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Accident History</Text>
            <View style={styles.optionContainer}>
              {accidentOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    accidentHistory === option && styles.optionButtonActive,
                  ]}
                  onPress={() => setAccidentHistory(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      accidentHistory === option && styles.optionTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ZIP Code (Optional)</Text>
            <View style={styles.zipInputContainer}>
              <MapPin size={20} color={theme.colors.textTertiary} />
              <TextInput
                style={styles.zipInput}
                value={zipCode}
                onChangeText={setZipCode}
                placeholder="Enter ZIP for local pricing"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <Text style={styles.helperText}>
              Helps provide more accurate regional market pricing
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.lookupButton, 
            (loading || !vinValidation.isValid || !mileage) && styles.lookupButtonDisabled
          ]}
          onPress={handleLookup}
          disabled={loading || !vinValidation.isValid || !mileage}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#ffffff" />
              <Text style={styles.lookupButtonText}>Processing VIN...</Text>
            </>
          ) : (
            <>
              <Car size={20} color="#ffffff" />
              <Text style={styles.lookupButtonText}>Get AI Valuation</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Valuations are estimates based on market data and AI analysis. 
            Actual values may vary based on local market conditions and vehicle specifics.
          </Text>
        </View>
      </ScrollView>

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={handleSubscribe}
        feature="unlimited_lookups"
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#e0e7ff',
    textAlign: 'center',
    marginTop: 4,
  },
  bannerContainer: {
    paddingTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  errorBanner: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  errorTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.error,
  },
  closeErrorButton: {
    padding: 4,
  },
  errorBannerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.error,
    lineHeight: 20,
    marginBottom: 16,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.primary,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  helpButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  inputError: {
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
  vinInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vinInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    backgroundColor: theme.colors.surface,
    marginRight: 12,
    letterSpacing: 1,
    color: theme.colors.text,
  },
  scanButton: {
    backgroundColor: theme.colors.primary + '20',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.error,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  successText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.success,
  },
  sampleVinsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  sampleVinsLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  sampleVinsGrid: {
    gap: 8,
  },
  sampleVinButton: {
    backgroundColor: theme.colors.primary + '10',
    borderColor: theme.colors.primary + '30',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sampleVinLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.primary,
  },
  sampleVinText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
    opacity: 0.7,
  },
  zipInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
  },
  zipInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
    color: theme.colors.text,
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginTop: 6,
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  optionButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
  },
  optionTextActive: {
    color: '#ffffff',
  },
  lookupButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 8,
    marginTop: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lookupButtonDisabled: {
    backgroundColor: theme.colors.textTertiary,
    shadowOpacity: 0,
    elevation: 0,
  },
  lookupButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  disclaimer: {
    backgroundColor: theme.colors.borderLight,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
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
import { Camera, Scan, Car, MapPin, CircleAlert as AlertCircle } from 'lucide-react-native';
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
    '1HGBH41JXMN109186', // Honda Civic
    '1FTFW1ET5DFC10312', // Ford F-150
    '5NPE34AF4HH012345'  // Hyundai Elantra
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
    }
  };

  const handleVINScan = (scannedVIN: string) => {
    setVin(scannedVIN.toUpperCase());
    validateVIN(scannedVIN.toUpperCase());
    setShowScanner(false);
    // Clear any previous error
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const useSampleVIN = (sampleVin: string) => {
    setVin(sampleVin);
    validateVIN(sampleVin);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleLookup = async () => {
    console.log('Starting VIN lookup process...');
    setErrorMessage(null);
    
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
      return;
    }

    if (!mileage || isNaN(Number(mileage)) || Number(mileage) < 0) {
      setErrorMessage('Please enter a valid mileage');
      return;
    }

    if (Number(mileage) > 500000) {
      setErrorMessage('Mileage seems unusually high. Please verify the entered value.');
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
        
        if (vinResult.error?.includes('404')) {
          userMessage = `VIN not found in database. This could mean:
• The VIN may contain a typo - please double-check each character
• The vehicle may be too old or not in the VIN database
• Try one of the sample VINs below to test the connection`;
        } else if (vinResult.error?.includes('401') || vinResult.error?.includes('403')) {
          userMessage = 'API authentication failed. Please check your API key configuration.';
        } else if (vinResult.error?.includes('429')) {
          userMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (vinResult.error?.includes('Network error')) {
          userMessage = 'Network connection error. Please check your internet connection and try again.';
        }
        
        setErrorMessage(userMessage);
        return;
      }

      if (!vinResult.data) {
        console.error('No vehicle data returned');
        setErrorMessage('No vehicle information found for this VIN. Please verify the VIN is correct or try a sample VIN.');
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
      setErrorMessage('Failed to process VIN lookup. Please check your internet connection and try again.');
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
        {/* Error Message Display */}
        {errorMessage && (
          <View style={styles.errorBanner}>
            <AlertCircle size={20} color={theme.colors.error} />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
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
                <Text style={styles.successText}>✓ Valid VIN format</Text>
              </View>
            )}
            
            {/* Sample VINs for testing */}
            <View style={styles.sampleVinsContainer}>
              <Text style={styles.sampleVinsLabel}>Try a sample VIN:</Text>
              <View style={styles.sampleVinsRow}>
                {sampleVINs.map((sampleVin, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.sampleVinButton}
                    onPress={() => useSampleVIN(sampleVin)}
                  >
                    <Text style={styles.sampleVinText}>
                      {sampleVin.substring(0, 8)}...
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
    backgroundColor: theme.colors.error + '15',
    borderColor: theme.colors.error,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.error,
    lineHeight: 20,
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
    marginTop: 8,
  },
  successText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.success,
  },
  sampleVinsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  sampleVinsLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  sampleVinsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  sampleVinButton: {
    backgroundColor: theme.colors.primary + '10',
    borderColor: theme.colors.primary + '30',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sampleVinText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
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
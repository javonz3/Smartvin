import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, Crown, Check, Zap, TrendingUp, Shield, Star, CreditCard } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: (planId: string) => Promise<boolean>;
  feature?: string; // What feature triggered the paywall
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  savings?: string;
  description?: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'pay_per_request',
    name: 'Pay Per Request',
    price: '$9.99',
    period: 'per lookup',
    description: 'Perfect for occasional use',
    features: [
      'Single VIN lookup',
      'AI-powered valuation',
      'Basic market analysis',
      'Standard report format'
    ]
  },
  {
    id: 'monthly',
    name: 'Monthly Pro',
    price: '$29.99',
    period: 'per month',
    description: 'Great for regular dealers',
    features: [
      'Unlimited VIN lookups',
      'AI-powered valuations',
      'Market trend analysis',
      'Export PDF reports',
      'Priority support',
      'Advanced analytics'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly Pro',
    price: '$299.99',
    period: 'per year',
    description: 'Best value for professionals',
    features: [
      'Everything in Monthly',
      'Advanced analytics dashboard',
      'Bulk VIN processing',
      'API access',
      'White-label reports',
      'Dedicated account manager',
      'Custom integrations'
    ],
    popular: true,
    savings: 'Save 17%'
  }
];

export function PaywallModal({ visible, onClose, onSubscribe, feature }: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const success = await onSubscribe(selectedPlan);
      if (success) {
        onClose();
      }
    } catch (error) {
      Alert.alert('Purchase Error', 'Failed to process purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFeatureMessage = () => {
    switch (feature) {
      case 'unlimited_lookups':
        return 'You\'ve reached your free lookup limit';
      case 'pdf_export':
        return 'PDF export is a Pro feature';
      case 'analytics':
        return 'Advanced analytics require Pro';
      case 'bulk_processing':
        return 'Bulk VIN processing is Pro only';
      default:
        return 'Unlock the full power of SmartVIN';
    }
  };

  const getButtonText = () => {
    const plan = subscriptionPlans.find(p => p.id === selectedPlan);
    if (!plan) return 'Continue';
    
    switch (selectedPlan) {
      case 'pay_per_request':
        return 'Purchase Lookup';
      case 'monthly':
        return 'Start 7-Day Free Trial';
      case 'yearly':
        return 'Start 7-Day Free Trial';
      default:
        return 'Continue';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#3b82f6', '#1d4ed8']}
          style={styles.header}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Crown size={48} color="#fbbf24" />
            <Text style={styles.headerTitle}>Choose Your Plan</Text>
            <Text style={styles.headerSubtitle}>{getFeatureMessage()}</Text>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>Why Choose SmartVIN?</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Zap size={24} color="#3b82f6" />
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>AI-Powered Accuracy</Text>
                  <Text style={styles.benefitDescription}>
                    Advanced algorithms analyze market data for precise valuations
                  </Text>
                </View>
              </View>
              
              <View style={styles.benefitItem}>
                <TrendingUp size={24} color="#059669" />
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>Real-Time Market Data</Text>
                  <Text style={styles.benefitDescription}>
                    Live market trends and pricing insights for better decisions
                  </Text>
                </View>
              </View>
              
              <View style={styles.benefitItem}>
                <Shield size={24} color="#7c3aed" />
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>Professional Reports</Text>
                  <Text style={styles.benefitDescription}>
                    Export branded PDF reports for customers and records
                  </Text>
                </View>
              </View>
              
              <View style={styles.benefitItem}>
                <Star size={24} color="#f59e0b" />
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>Expert Support</Text>
                  <Text style={styles.benefitDescription}>
                    Get help from automotive valuation professionals
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Pricing Plans */}
          <View style={styles.plansSection}>
            <Text style={styles.sectionTitle}>Select Your Option</Text>
            
            {subscriptionPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.planCardSelected,
                  plan.popular && styles.planCardPopular
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                  </View>
                )}
                
                {plan.savings && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsBadgeText}>{plan.savings}</Text>
                  </View>
                )}
                
                <View style={styles.planHeader}>
                  <View style={styles.planTitleRow}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    {plan.id === 'pay_per_request' && (
                      <CreditCard size={20} color="#3b82f6" />
                    )}
                  </View>
                  {plan.description && (
                    <Text style={styles.planDescription}>{plan.description}</Text>
                  )}
                  <View style={styles.planPricing}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  </View>
                </View>
                
                <View style={styles.planFeatures}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Check size={16} color="#059669" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.planSelector}>
                  <View style={[
                    styles.radioButton,
                    selectedPlan === plan.id && styles.radioButtonSelected
                  ]}>
                    {selectedPlan === plan.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Value Proposition */}
          <View style={styles.valueSection}>
            <Text style={styles.valueTitle}>Compare Options</Text>
            <View style={styles.comparisonTable}>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonFeature}>Cost per lookup</Text>
                <Text style={styles.comparisonPayPer}>$9.99</Text>
                <Text style={styles.comparisonPro}>$1.00*</Text>
              </View>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonFeature}>PDF exports</Text>
                <Text style={styles.comparisonPayPer}>❌</Text>
                <Text style={styles.comparisonPro}>✅</Text>
              </View>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonFeature}>Analytics</Text>
                <Text style={styles.comparisonPayPer}>❌</Text>
                <Text style={styles.comparisonPro}>✅</Text>
              </View>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonFeature}>Bulk processing</Text>
                <Text style={styles.comparisonPayPer}>❌</Text>
                <Text style={styles.comparisonPro}>✅</Text>
              </View>
            </View>
            <Text style={styles.comparisonNote}>*Based on 30 lookups per month</Text>
          </View>

          {/* Trust Indicators */}
          <View style={styles.trustSection}>
            <Text style={styles.trustText}>
              {selectedPlan === 'pay_per_request' 
                ? '✓ Secure payment • ✓ Instant access • ✓ No commitment'
                : '✓ Cancel anytime • ✓ 7-day free trial • ✓ Secure payments'
              }
            </Text>
          </View>
        </ScrollView>

        {/* Purchase Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]}
            onPress={handleSubscribe}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                {selectedPlan === 'pay_per_request' ? (
                  <CreditCard size={20} color="#ffffff" />
                ) : (
                  <Crown size={20} color="#ffffff" />
                )}
                <Text style={styles.subscribeButtonText}>
                  {getButtonText()}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={styles.footerText}>
            {selectedPlan === 'pay_per_request'
              ? 'One-time purchase for single VIN lookup'
              : 'By subscribing, you agree to our Terms of Service and Privacy Policy'
            }
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#e0e7ff',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  benefitsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    lineHeight: 20,
  },
  plansSection: {
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  planCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  planCardPopular: {
    borderColor: '#059669',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  planHeader: {
    marginBottom: 16,
    marginTop: 8,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  planName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  planDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginBottom: 8,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  planPrice: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#3b82f6',
  },
  planPeriod: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  planFeatures: {
    gap: 8,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    flex: 1,
  },
  planSelector: {
    alignItems: 'flex-end',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#3b82f6',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
  valueSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  valueTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  comparisonTable: {
    gap: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  comparisonFeature: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  comparisonPayPer: {
    width: 60,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
    textAlign: 'center',
  },
  comparisonPro: {
    width: 60,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
    textAlign: 'center',
  },
  comparisonNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  trustSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  trustText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  subscribeButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginBottom: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  subscribeButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
});
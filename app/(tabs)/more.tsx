import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingCart, Bell, GitCompare, Calculator, TrendingUp, Gavel, Users, ChartBar as BarChart3, FileText, Settings, CircleHelp as HelpCircle, Star, ChevronRight, Crown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { PaywallModal } from '@/components/PaywallModal';
import { useSubscription } from '@/hooks/useSubscription';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route?: string;
  isPro?: boolean;
  comingSoon?: boolean;
  category: 'marketplace' | 'tools' | 'insights' | 'support';
}

const categories = [
  { id: 'marketplace', title: 'Marketplace' },
  { id: 'tools', title: 'Tools' },
  { id: 'insights', title: 'Market Insights' },
  { id: 'support', title: 'Support' }
];

export default function More() {
  const { theme } = useTheme();
  const { isPro, subscribe } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  const features: FeatureItem[] = [
    // Marketplace
    {
      id: 'marketplace',
      title: 'Vehicle Marketplace',
      description: 'Browse vehicles with AI-powered deal detection',
      icon: <ShoppingCart size={24} color={theme.colors.primary} />,
      route: '/marketplace',
      category: 'marketplace'
    },
    {
      id: 'alerts',
      title: 'Price Alerts',
      description: 'Get notified when vehicles match your criteria',
      icon: <Bell size={24} color={theme.colors.warning} />,
      route: '/alerts',
      category: 'marketplace'
    },
    
    // Tools
    {
      id: 'compare',
      title: 'Vehicle Comparison',
      description: 'Compare up to 3 vehicles side by side',
      icon: <GitCompare size={24} color={theme.colors.success} />,
      route: '/compare',
      category: 'tools'
    },
    {
      id: 'calculator',
      title: 'Financing Calculator',
      description: 'Calculate monthly payments and loan terms',
      icon: <Calculator size={24} color={theme.colors.warning} />,
      comingSoon: true,
      category: 'tools'
    },
    {
      id: 'bulk-processing',
      title: 'Bulk VIN Processing',
      description: 'Process multiple VINs at once',
      icon: <FileText size={24} color={theme.colors.error} />,
      isPro: true,
      comingSoon: true,
      category: 'tools'
    },
    
    // Market Insights
    {
      id: 'market-trends',
      title: 'Market Trends',
      description: 'Regional price trends and market analysis',
      icon: <TrendingUp size={24} color={theme.colors.success} />,
      comingSoon: true,
      category: 'insights'
    },
    {
      id: 'auction-data',
      title: 'Auction Integration',
      description: 'Live auction feeds and historical data',
      icon: <Gavel size={24} color={theme.colors.warning} />,
      isPro: true,
      comingSoon: true,
      category: 'insights'
    },
    {
      id: 'portfolio',
      title: 'Portfolio Tracking',
      description: 'Track your inventory performance',
      icon: <BarChart3 size={24} color={theme.colors.primary} />,
      isPro: true,
      comingSoon: true,
      category: 'insights'
    },
    
    // Support
    {
      id: 'help',
      title: 'Help & Support',
      description: 'Get help and contact support',
      icon: <HelpCircle size={24} color={theme.colors.textTertiary} />,
      category: 'support'
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      description: 'Help us improve SmartVIN',
      icon: <Star size={24} color={theme.colors.warning} />,
      category: 'support'
    }
  ];

  const handleFeaturePress = (feature: FeatureItem) => {
    if (feature.comingSoon) {
      // Show coming soon message
      return;
    }
    
    if (feature.route) {
      router.push(feature.route as any);
    }
  };

  const handleSubscribe = async (planId: string) => {
    return await subscribe(planId);
  };

  const handleUpgradePress = () => {
    setShowPaywall(true);
  };

  const renderFeature = (feature: FeatureItem) => (
    <TouchableOpacity
      key={feature.id}
      style={[
        styles.featureItem,
        feature.comingSoon && styles.featureItemDisabled
      ]}
      onPress={() => handleFeaturePress(feature)}
      disabled={feature.comingSoon}
    >
      <View style={styles.featureIcon}>
        {feature.icon}
      </View>
      <View style={styles.featureContent}>
        <View style={styles.featureHeader}>
          <Text style={[
            styles.featureTitle,
            feature.comingSoon && styles.featureTitleDisabled
          ]}>
            {feature.title}
          </Text>
          {feature.isPro && (
            <View style={styles.proBadge}>
              <Crown size={12} color="#ffffff" />
              <Text style={styles.proText}>PRO</Text>
            </View>
          )}
          {feature.comingSoon && (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Soon</Text>
            </View>
          )}
        </View>
        <Text style={[
          styles.featureDescription,
          feature.comingSoon && styles.featureDescriptionDisabled
        ]}>
          {feature.description}
        </Text>
      </View>
      {!feature.comingSoon && (
        <ChevronRight size={20} color={theme.colors.textTertiary} />
      )}
    </TouchableOpacity>
  );

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>More Features</Text>
        <Text style={styles.headerSubtitle}>
          Discover powerful tools for vehicle professionals
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Features Available</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>6</Text>
            <Text style={styles.statLabel}>Coming Soon</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>Pro Features</Text>
          </View>
        </View>

        {/* Feature Categories */}
        {categories.map((category) => {
          const categoryFeatures = features.filter(f => f.category === category.id);
          
          return (
            <View key={category.id} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </View>
              
              <View style={styles.featuresGrid}>
                {categoryFeatures.map(renderFeature)}
              </View>
            </View>
          );
        })}

        {/* Upgrade Prompt - Only show if not Pro */}
        {!isPro && (
          <View style={styles.upgradeSection}>
            <LinearGradient
              colors={['#7c3aed', '#5b21b6']}
              style={styles.upgradeCard}
            >
              <Crown size={32} color="#fbbf24" />
              <Text style={styles.upgradeTitle}>Unlock Pro Features</Text>
              <Text style={styles.upgradeDescription}>
                Get access to advanced tools, bulk processing, and premium insights
              </Text>
              <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradePress}>
                <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Pro Status - Show if user is Pro */}
        {isPro && (
          <View style={styles.upgradeSection}>
            <LinearGradient
              colors={['#059669', '#10b981']}
              style={styles.upgradeCard}
            >
              <Crown size={32} color="#fbbf24" />
              <Text style={styles.upgradeTitle}>SmartVIN Pro Active</Text>
              <Text style={styles.upgradeDescription}>
                You have access to all premium features and unlimited lookups
              </Text>
              <View style={styles.proStatusBadge}>
                <Text style={styles.proStatusText}>✓ Pro Member</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>SmartVIN v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2024 SmartVIN. All rights reserved.</Text>
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
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#e0e7ff',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  featuresGrid: {
    gap: 12,
  },
  featureItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureItemDisabled: {
    opacity: 0.6,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    flex: 1,
  },
  featureTitleDisabled: {
    color: theme.colors.textTertiary,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  featureDescriptionDisabled: {
    color: theme.colors.textTertiary,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  proText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  comingSoonBadge: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  upgradeSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  upgradeCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  upgradeTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginTop: 12,
  },
  upgradeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#e0e7ff',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  upgradeButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#7c3aed',
  },
  proStatusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  proStatusText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appInfoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
});
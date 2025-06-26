import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Crown, TriangleAlert as AlertTriangle, CreditCard, Zap, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface UsageBannerProps {
  vinLookupsUsed: number;
  vinLookupsLimit: number;
  payPerRequestCredits?: number;
  isPro: boolean;
  onUpgrade: () => void;
}

export function UsageBanner({ 
  vinLookupsUsed, 
  vinLookupsLimit, 
  payPerRequestCredits = 0,
  isPro, 
  onUpgrade 
}: UsageBannerProps) {
  const { theme } = useTheme();

  if (isPro) {
    return (
      <View style={styles.container}>
        <View style={[styles.proBanner, { backgroundColor: theme.colors.success + '15' }]}>
          <View style={styles.proContent}>
            <View style={[styles.proIconContainer, { backgroundColor: theme.colors.success + '20' }]}>
              <Crown size={14} color={theme.colors.success} />
            </View>
            <Text style={[styles.proText, { color: theme.colors.success }]}>
              SmartVIN Pro Active
            </Text>
            <View style={styles.proSparkles}>
              <Sparkles size={12} color={theme.colors.success} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  const remaining = Math.max(0, vinLookupsLimit - vinLookupsUsed);
  const totalAvailable = remaining + payPerRequestCredits;
  const isOutOfLookups = totalAvailable === 0;
  const isLowOnLookups = totalAvailable <= 1 && totalAvailable > 0;
  
  const progressPercentage = vinLookupsLimit > 0 ? (vinLookupsUsed / vinLookupsLimit) * 100 : 0;

  const getBannerText = () => {
    if (isOutOfLookups) {
      return 'No lookups remaining';
    }
    if (payPerRequestCredits > 0 && remaining > 0) {
      return `${remaining} free + ${payPerRequestCredits} paid`;
    } else if (payPerRequestCredits > 0) {
      return `${payPerRequestCredits} paid lookup${payPerRequestCredits === 1 ? '' : 's'}`;
    } else {
      return `${remaining}/${vinLookupsLimit} free lookups`;
    }
  };

  const getBannerStyle = () => {
    if (isOutOfLookups) {
      return {
        backgroundColor: theme.colors.error + '10',
        borderColor: theme.colors.error + '20',
      };
    }
    if (isLowOnLookups) {
      return {
        backgroundColor: theme.colors.warning + '10',
        borderColor: theme.colors.warning + '20',
      };
    }
    if (payPerRequestCredits > 0) {
      return {
        backgroundColor: '#7c3aed15',
        borderColor: '#7c3aed20',
      };
    }
    return {
      backgroundColor: theme.colors.primary + '10',
      borderColor: theme.colors.primary + '20',
    };
  };

  const getIcon = () => {
    if (isOutOfLookups) {
      return <AlertTriangle size={14} color={theme.colors.error} />;
    }
    if (payPerRequestCredits > 0) {
      return <CreditCard size={14} color="#7c3aed" />;
    }
    return <Zap size={14} color={theme.colors.primary} />;
  };

  const getIconColor = () => {
    if (isOutOfLookups) return theme.colors.error;
    if (isLowOnLookups) return theme.colors.warning;
    if (payPerRequestCredits > 0) return '#7c3aed';
    return theme.colors.primary;
  };

  const getTextColor = () => {
    if (isOutOfLookups) return theme.colors.error;
    if (isLowOnLookups) return theme.colors.warning;
    if (payPerRequestCredits > 0) return '#7c3aed';
    return theme.colors.primary;
  };

  const getProgressColor = () => {
    if (progressPercentage >= 80) return theme.colors.error;
    if (progressPercentage >= 60) return theme.colors.warning;
    return theme.colors.primary;
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={[styles.banner, getBannerStyle()]}>
        <View style={styles.bannerContent}>
          <View style={styles.leftContent}>
            <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '15' }]}>
              {getIcon()}
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.bannerText, { color: getTextColor() }]}>
                {getBannerText()}
              </Text>
              {!isOutOfLookups && vinLookupsLimit > 0 && (
                <View style={styles.progressContainer}>
                  <View style={[styles.progressTrack, { backgroundColor: getIconColor() + '15' }]}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${Math.min(progressPercentage, 100)}%`,
                          backgroundColor: getProgressColor(),
                        }
                      ]} 
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.upgradeButton, { backgroundColor: getIconColor() + '15' }]} 
            onPress={onUpgrade}
          >
            <Crown size={12} color={getIconColor()} />
            <Text style={[styles.upgradeButtonText, { color: getIconColor() }]}>
              {isOutOfLookups ? 'Buy' : 'Pro'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    width: '92%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  banner: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  bannerText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 6,
  },
  progressContainer: {
    width: '100%',
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  upgradeButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  proBanner: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  proContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  proIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  proSparkles: {
    opacity: 0.7,
  },
});
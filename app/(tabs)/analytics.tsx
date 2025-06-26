import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, DollarSign, Car, Calendar, ChartBar as BarChart3, ChartPie as PieChart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface StatCard {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

const topMakes = [
  { make: 'Honda', count: 45, percentage: 18.2 },
  { make: 'Toyota', count: 38, percentage: 15.4 },
  { make: 'Ford', count: 32, percentage: 13.0 },
  { make: 'Chevrolet', count: 28, percentage: 11.3 },
  { make: 'Nissan', count: 24, percentage: 9.7 },
];

const monthlyData = [
  { month: 'Jan', valuations: 65, avgValue: 18500 },
  { month: 'Feb', valuations: 72, avgValue: 19200 },
  { month: 'Mar', valuations: 58, avgValue: 17800 },
  { month: 'Apr', valuations: 89, avgValue: 20100 },
  { month: 'May', valuations: 76, avgValue: 18900 },
  { month: 'Jun', valuations: 94, avgValue: 21300 },
];

export default function Analytics() {
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const stats: StatCard[] = [
    {
      title: 'Total Valuations',
      value: '247',
      change: '+12%',
      isPositive: true,
      icon: <Car size={24} color={theme.colors.primary} />,
    },
    {
      title: 'Avg. Wholesale',
      value: '$16,450',
      change: '+5.2%',
      isPositive: true,
      icon: <DollarSign size={24} color={theme.colors.success} />,
    },
    {
      title: 'Avg. Retail',
      value: '$21,200',
      change: '+3.8%',
      isPositive: true,
      icon: <TrendingUp size={24} color={theme.colors.error} />,
    },
    {
      title: 'Monthly Volume',
      value: '89',
      change: '-2.1%',
      isPositive: false,
      icon: <BarChart3 size={24} color={theme.colors.warning} />,
    },
  ];

  const periods = [
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: '1Y', value: '1y' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const maxValuations = Math.max(...monthlyData.map(d => d.valuations));

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Business insights & trends</Text>
      </LinearGradient>

      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.value}
            style={[
              styles.periodButton,
              selectedPeriod === period.value && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period.value)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period.value && styles.periodButtonTextActive,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statHeader}>
                {stat.icon}
                <View style={styles.statChange}>
                  {stat.isPositive ? (
                    <TrendingUp size={16} color={theme.colors.success} />
                  ) : (
                    <TrendingDown size={16} color={theme.colors.error} />
                  )}
                  <Text
                    style={[
                      styles.statChangeText,
                      { color: stat.isPositive ? theme.colors.success : theme.colors.error },
                    ]}
                  >
                    {stat.change}
                  </Text>
                </View>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>

        {/* Monthly Trend Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Monthly Valuations</Text>
            <BarChart3 size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.chart}>
            {monthlyData.map((data, index) => (
              <View key={index} style={styles.chartBar}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (data.valuations / maxValuations) * 120,
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                />
                <Text style={styles.chartLabel}>{data.month}</Text>
                <Text style={styles.chartValue}>{data.valuations}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Makes */}
        <View style={styles.topMakesCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Top Makes</Text>
            <PieChart size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.makesList}>
            {topMakes.map((make, index) => (
              <View key={index} style={styles.makeItem}>
                <View style={styles.makeInfo}>
                  <Text style={styles.makeName}>{make.make}</Text>
                  <Text style={styles.makeCount}>{make.count} valuations</Text>
                </View>
                <View style={styles.makePercentage}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { 
                          width: `${make.percentage * 5}%`,
                          backgroundColor: theme.colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.percentageText}>{make.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Insights */}
        <View style={styles.insightsCard}>
          <Text style={styles.chartTitle}>Key Insights</Text>
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <View style={styles.insightIcon}>
                <TrendingUp size={16} color={theme.colors.success} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Strong Performance</Text>
                <Text style={styles.insightDescription}>
                  Wholesale values increased 5.2% this month
                </Text>
              </View>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightIcon}>
                <Car size={16} color={theme.colors.primary} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Popular Brands</Text>
                <Text style={styles.insightDescription}>
                  Honda and Toyota dominate your valuations
                </Text>
              </View>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightIcon}>
                <Calendar size={16} color={theme.colors.warning} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Peak Season</Text>
                <Text style={styles.insightDescription}>
                  June showed highest valuation volume
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
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
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 60) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statChangeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  chartCard: {
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
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingHorizontal: 8,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 24,
    borderRadius: 4,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  chartValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  topMakesCard: {
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
  makesList: {
    gap: 16,
  },
  makeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  makeInfo: {
    flex: 1,
  },
  makeName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  makeCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  makePercentage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: 100,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    width: 35,
    textAlign: 'right',
  },
  insightsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightsList: {
    gap: 16,
    marginTop: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  insightDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
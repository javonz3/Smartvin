import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Calendar, DollarSign, Car, Filter } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface HistoryItem {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  condition: string;
  date: string;
  wholesale: number;
  retail: number;
  tradeIn: number;
  bhph: number;
}

const mockHistory: HistoryItem[] = [
  {
    id: '1',
    vin: '1HGBH41JXMN109186',
    year: 2021,
    make: 'Honda',
    model: 'Civic',
    trim: 'LX',
    mileage: 45000,
    condition: 'Good',
    date: '2024-01-15',
    wholesale: 18500,
    retail: 22000,
    tradeIn: 17000,
    bhph: 24500,
  },
  {
    id: '2',
    vin: '1FTFW1ET5DFC10312',
    year: 2013,
    make: 'Ford',
    model: 'F-150',
    trim: 'XLT',
    mileage: 89000,
    condition: 'Fair',
    date: '2024-01-14',
    wholesale: 15200,
    retail: 19500,
    tradeIn: 14000,
    bhph: 21000,
  },
  {
    id: '3',
    vin: '5NPE34AF4HH012345',
    year: 2017,
    make: 'Hyundai',
    model: 'Elantra',
    trim: 'SE',
    mileage: 62000,
    condition: 'Excellent',
    date: '2024-01-13',
    wholesale: 12800,
    retail: 16200,
    tradeIn: 11500,
    bhph: 17800,
  },
];

export default function History() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState(mockHistory);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredHistory(mockHistory);
    } else {
      const filtered = mockHistory.filter(
        (item) =>
          item.vin.toLowerCase().includes(query.toLowerCase()) ||
          item.make.toLowerCase().includes(query.toLowerCase()) ||
          item.model.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredHistory(filtered);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleItemPress = (item: HistoryItem) => {
    router.push({
      pathname: '/valuation',
      params: {
        vin: item.vin,
        mileage: item.mileage.toString(),
        condition: item.condition,
        accidentHistory: 'None',
        zipCode: '',
        fromHistory: 'true',
      },
    });
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Lookup History</Text>
        <Text style={styles.headerSubtitle}>
          {filteredHistory.length} valuations
        </Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={theme.colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by VIN, make, or model"
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredHistory.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.historyItem}
            onPress={() => handleItemPress(item)}
          >
            <View style={styles.itemHeader}>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleTitle}>
                  {item.year} {item.make} {item.model}
                </Text>
                <Text style={styles.vehicleSubtitle}>
                  {item.trim} • {item.mileage.toLocaleString()} mi • {item.condition}
                </Text>
              </View>
              <View style={styles.dateContainer}>
                <Calendar size={16} color={theme.colors.textTertiary} />
                <Text style={styles.dateText}>{formatDate(item.date)}</Text>
              </View>
            </View>

            <View style={styles.vinContainer}>
              <Car size={16} color={theme.colors.textTertiary} />
              <Text style={styles.vinText}>{item.vin}</Text>
            </View>

            <View style={styles.valuationGrid}>
              <View style={styles.valuationItem}>
                <Text style={styles.valuationLabel}>Wholesale</Text>
                <Text style={styles.valuationValue}>
                  {formatCurrency(item.wholesale)}
                </Text>
              </View>
              <View style={styles.valuationItem}>
                <Text style={styles.valuationLabel}>Trade-In</Text>
                <Text style={styles.valuationValue}>
                  {formatCurrency(item.tradeIn)}
                </Text>
              </View>
              <View style={styles.valuationItem}>
                <Text style={styles.valuationLabel}>Retail</Text>
                <Text style={styles.valuationValue}>
                  {formatCurrency(item.retail)}
                </Text>
              </View>
              <View style={styles.valuationItem}>
                <Text style={styles.valuationLabel}>BHPH</Text>
                <Text style={[styles.valuationValue, styles.bhphValue]}>
                  {formatCurrency(item.bhph)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredHistory.length === 0 && (
          <View style={styles.emptyState}>
            <Car size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No results found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try adjusting your search terms
            </Text>
          </View>
        )}
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.borderLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
  },
  filterButton: {
    backgroundColor: theme.colors.primary + '20',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  historyItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  vehicleSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textTertiary,
  },
  vinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.borderLight,
    borderRadius: 8,
  },
  vinText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
  },
  valuationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  valuationItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: theme.colors.borderLight,
    borderRadius: 8,
  },
  valuationLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  valuationValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  bhphValue: {
    color: theme.colors.success,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
});
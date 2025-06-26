import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, MapPin, Calendar, Fuel, Settings, TrendingUp, Eye, Heart, Share2, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

interface MarketplaceListing {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  price: number;
  estimatedValue: number;
  location: string;
  dealer: string;
  images: string[];
  daysOnMarket: number;
  priceChange?: {
    amount: number;
    direction: 'up' | 'down';
    daysAgo: number;
  };
  features: string[];
  condition: string;
  fuelType: string;
}

const mockListings: MarketplaceListing[] = [
  {
    id: '1',
    vin: '1HGBH41JXMN109186',
    year: 2021,
    make: 'Honda',
    model: 'Civic',
    trim: 'LX',
    mileage: 45000,
    price: 21500,
    estimatedValue: 22000,
    location: 'Dallas, TX',
    dealer: 'Metro Honda',
    images: [
      'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    daysOnMarket: 12,
    priceChange: {
      amount: 1000,
      direction: 'down',
      daysAgo: 3
    },
    features: ['Backup Camera', 'Bluetooth', 'Cruise Control'],
    condition: 'Good',
    fuelType: 'Gasoline'
  },
  {
    id: '2',
    vin: '1FTFW1ET5DFC10312',
    year: 2020,
    make: 'Ford',
    model: 'F-150',
    trim: 'XLT',
    mileage: 62000,
    price: 28900,
    estimatedValue: 27500,
    location: 'Austin, TX',
    dealer: 'Lone Star Ford',
    images: [
      'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    daysOnMarket: 8,
    features: ['4WD', 'Tow Package', 'Navigation'],
    condition: 'Excellent',
    fuelType: 'Gasoline'
  }
];

export default function Marketplace() {
  const [listings, setListings] = useState(mockListings);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getValueIndicator = (price: number, estimatedValue: number) => {
    const difference = ((estimatedValue - price) / price) * 100;
    if (difference > 5) return { label: 'Great Deal', color: '#059669' };
    if (difference > 0) return { label: 'Good Value', color: '#3b82f6' };
    if (difference > -5) return { label: 'Fair Price', color: '#f59e0b' };
    return { label: 'Above Market', color: '#dc2626' };
  };

  const toggleFavorite = (listingId: string) => {
    setFavorites(prev => 
      prev.includes(listingId) 
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Marketplace</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by make, model, or VIN"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterVisible(!filterVisible)}
        >
          <Filter size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {listings.map((listing) => {
          const valueIndicator = getValueIndicator(listing.price, listing.estimatedValue);
          const isFavorite = favorites.includes(listing.id);
          
          return (
            <View key={listing.id} style={styles.listingCard}>
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: listing.images[0] }} 
                  style={styles.vehicleImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <View style={[styles.valueBadge, { backgroundColor: valueIndicator.color }]}>
                    <Text style={styles.valueBadgeText}>{valueIndicator.label}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(listing.id)}
                  >
                    <Heart 
                      size={20} 
                      color={isFavorite ? "#dc2626" : "#ffffff"} 
                      fill={isFavorite ? "#dc2626" : "transparent"}
                    />
                  </TouchableOpacity>
                </View>
                {listing.priceChange && (
                  <View style={styles.priceChangeIndicator}>
                    <TrendingUp 
                      size={16} 
                      color={listing.priceChange.direction === 'down' ? '#059669' : '#dc2626'} 
                    />
                    <Text style={[
                      styles.priceChangeText,
                      { color: listing.priceChange.direction === 'down' ? '#059669' : '#dc2626' }
                    ]}>
                      {listing.priceChange.direction === 'down' ? '-' : '+'}
                      {formatCurrency(listing.priceChange.amount)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.listingContent}>
                <View style={styles.listingHeader}>
                  <Text style={styles.vehicleTitle}>
                    {listing.year} {listing.make} {listing.model}
                  </Text>
                  <Text style={styles.vehiclePrice}>{formatCurrency(listing.price)}</Text>
                </View>

                <Text style={styles.vehicleSubtitle}>
                  {listing.trim} • {listing.mileage.toLocaleString()} mi • {listing.condition}
                </Text>

                <View style={styles.locationRow}>
                  <MapPin size={16} color="#6b7280" />
                  <Text style={styles.locationText}>{listing.location}</Text>
                  <Text style={styles.dealerText}>• {listing.dealer}</Text>
                </View>

                <View style={styles.marketInsights}>
                  <View style={styles.insightItem}>
                    <Text style={styles.insightLabel}>Est. Value</Text>
                    <Text style={styles.insightValue}>{formatCurrency(listing.estimatedValue)}</Text>
                  </View>
                  <View style={styles.insightItem}>
                    <Text style={styles.insightLabel}>Days on Market</Text>
                    <Text style={styles.insightValue}>{listing.daysOnMarket}</Text>
                  </View>
                  <View style={styles.insightItem}>
                    <Text style={styles.insightLabel}>Market Position</Text>
                    <Text style={[styles.insightValue, { color: valueIndicator.color }]}>
                      {valueIndicator.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.features}>
                  {listing.features.slice(0, 3).map((feature, index) => (
                    <View key={index} style={styles.featureTag}>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                  {listing.features.length > 3 && (
                    <Text style={styles.moreFeatures}>+{listing.features.length - 3} more</Text>
                  )}
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => router.push(`/vehicle-details/${listing.id}` as any)}
                  >
                    <Eye size={16} color="#3b82f6" />
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.shareButton}>
                    <Share2 size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
  },
  filterButton: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  listingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  valueBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  valueBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceChangeIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  priceChangeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  listingContent: {
    padding: 16,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  vehicleTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    flex: 1,
  },
  vehiclePrice: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#059669',
  },
  vehicleSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  dealerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  marketInsights: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  insightItem: {
    alignItems: 'center',
  },
  insightLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  featureTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featureText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3b82f6',
  },
  moreFeatures: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    alignSelf: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    flex: 1,
    marginRight: 12,
  },
  viewButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#3b82f6',
  },
  shareButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
});
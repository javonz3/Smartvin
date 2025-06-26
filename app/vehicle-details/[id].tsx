import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings,
  DollarSign,
  TrendingUp,
  Phone,
  Mail,
  Star
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface VehicleDetails {
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
  dealer: {
    name: string;
    phone: string;
    email: string;
    rating: number;
    reviews: number;
  };
  images: string[];
  condition: string;
  daysOnMarket: number;
  features: string[];
  specs: {
    engine: string;
    transmission: string;
    drivetrain: string;
    fuelType: string;
    mpg: string;
    horsepower: number;
    torque: number;
  };
  history: {
    accidents: number;
    owners: number;
    serviceRecords: number;
  };
  valuations: {
    wholesale: number;
    tradeIn: number;
    retail: number;
    bhph: number;
  };
}

const mockVehicle: VehicleDetails = {
  id: '1',
  vin: '1HGBH41JXMN109186',
  year: 2021,
  make: 'Honda',
  model: 'Civic',
  trim: 'LX Sedan',
  mileage: 45000,
  price: 21500,
  estimatedValue: 22000,
  location: 'Dallas, TX',
  dealer: {
    name: 'Metro Honda',
    phone: '(214) 555-0123',
    email: 'sales@metrohonda.com',
    rating: 4.5,
    reviews: 127
  },
  images: [
    'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  condition: 'Good',
  daysOnMarket: 12,
  features: [
    'Backup Camera',
    'Bluetooth Connectivity',
    'Cruise Control',
    'Power Windows',
    'Air Conditioning',
    'Keyless Entry',
    'USB Ports',
    'Steering Wheel Controls'
  ],
  specs: {
    engine: '2.0L 4-Cylinder',
    transmission: 'CVT Automatic',
    drivetrain: 'Front-Wheel Drive',
    fuelType: 'Gasoline',
    mpg: '32/42 City/Highway',
    horsepower: 158,
    torque: 138
  },
  history: {
    accidents: 0,
    owners: 2,
    serviceRecords: 8
  },
  valuations: {
    wholesale: 18500,
    tradeIn: 17000,
    retail: 22000,
    bhph: 24500
  }
};

export default function VehicleDetails() {
  const { id } = useLocalSearchParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const vehicle = mockVehicle; // In real app, fetch by id

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getValueIndicator = () => {
    const difference = ((vehicle.estimatedValue - vehicle.price) / vehicle.price) * 100;
    if (difference > 5) return { label: 'Great Deal', color: '#059669' };
    if (difference > 0) return { label: 'Good Value', color: '#3b82f6' };
    if (difference > -5) return { label: 'Fair Price', color: '#f59e0b' };
    return { label: 'Above Market', color: '#dc2626' };
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${vehicle.year} ${vehicle.make} ${vehicle.model} for ${formatCurrency(vehicle.price)}`,
        title: 'Vehicle Listing',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const valueIndicator = getValueIndicator();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.actionButton, isFavorite && styles.favoriteActive]}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Heart 
              size={20} 
              color={isFavorite ? "#ffffff" : "#3b82f6"} 
              fill={isFavorite ? "#ffffff" : "transparent"}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share2 size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {vehicle.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.vehicleImage} />
            ))}
          </ScrollView>
          
          <View style={styles.imageIndicators}>
            {vehicle.images.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.indicator, 
                  currentImageIndex === index && styles.activeIndicator
                ]} 
              />
            ))}
          </View>

          <View style={styles.imageOverlay}>
            <View style={[styles.valueBadge, { backgroundColor: valueIndicator.color }]}>
              <Text style={styles.valueBadgeText}>{valueIndicator.label}</Text>
            </View>
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.vehicleInfo}>
          <View style={styles.priceHeader}>
            <View>
              <Text style={styles.vehicleTitle}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </Text>
              <Text style={styles.vehicleSubtitle}>{vehicle.trim}</Text>
            </View>
            <Text style={styles.price}>{formatCurrency(vehicle.price)}</Text>
          </View>

          <View style={styles.basicInfo}>
            <View style={styles.infoItem}>
              <Gauge size={16} color="#6b7280" />
              <Text style={styles.infoText}>{vehicle.mileage.toLocaleString()} mi</Text>
            </View>
            <View style={styles.infoItem}>
              <MapPin size={16} color="#6b7280" />
              <Text style={styles.infoText}>{vehicle.location}</Text>
            </View>
            <View style={styles.infoItem}>
              <Calendar size={16} color="#6b7280" />
              <Text style={styles.infoText}>{vehicle.daysOnMarket} days on market</Text>
            </View>
          </View>
        </View>

        {/* Market Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market Analysis</Text>
          <View style={styles.valuationGrid}>
            <View style={styles.valuationItem}>
              <Text style={styles.valuationLabel}>Wholesale</Text>
              <Text style={styles.valuationValue}>{formatCurrency(vehicle.valuations.wholesale)}</Text>
            </View>
            <View style={styles.valuationItem}>
              <Text style={styles.valuationLabel}>Trade-In</Text>
              <Text style={styles.valuationValue}>{formatCurrency(vehicle.valuations.tradeIn)}</Text>
            </View>
            <View style={styles.valuationItem}>
              <Text style={styles.valuationLabel}>Retail</Text>
              <Text style={styles.valuationValue}>{formatCurrency(vehicle.valuations.retail)}</Text>
            </View>
            <View style={styles.valuationItem}>
              <Text style={styles.valuationLabel}>BHPH</Text>
              <Text style={[styles.valuationValue, styles.bhphValue]}>{formatCurrency(vehicle.valuations.bhph)}</Text>
            </View>
          </View>
        </View>

        {/* Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specsList}>
            <View style={styles.specItem}>
              <Settings size={20} color="#3b82f6" />
              <View style={styles.specContent}>
                <Text style={styles.specLabel}>Engine</Text>
                <Text style={styles.specValue}>{vehicle.specs.engine}</Text>
              </View>
            </View>
            <View style={styles.specItem}>
              <Gauge size={20} color="#3b82f6" />
              <View style={styles.specContent}>
                <Text style={styles.specLabel}>Transmission</Text>
                <Text style={styles.specValue}>{vehicle.specs.transmission}</Text>
              </View>
            </View>
            <View style={styles.specItem}>
              <Fuel size={20} color="#3b82f6" />
              <View style={styles.specContent}>
                <Text style={styles.specLabel}>Fuel Economy</Text>
                <Text style={styles.specValue}>{vehicle.specs.mpg}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features & Equipment</Text>
          <View style={styles.featuresList}>
            {vehicle.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Vehicle History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle History</Text>
          <View style={styles.historyGrid}>
            <View style={styles.historyItem}>
              <Text style={styles.historyValue}>{vehicle.history.accidents}</Text>
              <Text style={styles.historyLabel}>Accidents</Text>
            </View>
            <View style={styles.historyItem}>
              <Text style={styles.historyValue}>{vehicle.history.owners}</Text>
              <Text style={styles.historyLabel}>Previous Owners</Text>
            </View>
            <View style={styles.historyItem}>
              <Text style={styles.historyValue}>{vehicle.history.serviceRecords}</Text>
              <Text style={styles.historyLabel}>Service Records</Text>
            </View>
          </View>
        </View>

        {/* Dealer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dealer Information</Text>
          <View style={styles.dealerCard}>
            <View style={styles.dealerHeader}>
              <Text style={styles.dealerName}>{vehicle.dealer.name}</Text>
              <View style={styles.dealerRating}>
                <Star size={16} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.ratingText}>{vehicle.dealer.rating}</Text>
                <Text style={styles.reviewsText}>({vehicle.dealer.reviews} reviews)</Text>
              </View>
            </View>
            <View style={styles.dealerActions}>
              <TouchableOpacity style={styles.contactButton}>
                <Phone size={16} color="#ffffff" />
                <Text style={styles.contactButtonText}>Call Dealer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.emailButton}>
                <Mail size={16} color="#3b82f6" />
                <Text style={styles.emailButtonText}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.inquireButton}>
          <Text style={styles.inquireButtonText}>Inquire About This Vehicle</Text>
        </TouchableOpacity>
      </View>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  favoriteActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  content: {
    flex: 1,
  },
  imageGallery: {
    height: 250,
    position: 'relative',
  },
  vehicleImage: {
    width: width,
    height: 250,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: '#ffffff',
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
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
  vehicleInfo: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  vehicleTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
  },
  vehicleSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginTop: 4,
  },
  price: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#059669',
  },
  basicInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 16,
  },
  valuationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  valuationItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  valuationLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    marginBottom: 4,
  },
  valuationValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  bhphValue: {
    color: '#059669',
  },
  specsList: {
    gap: 16,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  specContent: {
    flex: 1,
  },
  specLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  specValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginTop: 2,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureItem: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3b82f6',
  },
  historyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  historyItem: {
    alignItems: 'center',
  },
  historyValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
  },
  historyLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    marginTop: 4,
  },
  dealerCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  dealerHeader: {
    marginBottom: 16,
  },
  dealerName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 8,
  },
  dealerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  reviewsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  dealerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  contactButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  emailButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    gap: 6,
  },
  emailButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#3b82f6',
  },
  bottomAction: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  inquireButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  inquireButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});
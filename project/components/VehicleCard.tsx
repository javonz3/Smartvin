import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MapPin, Calendar, Gauge, TrendingUp, Heart, Share2 } from 'lucide-react-native';

interface VehicleCardProps {
  vehicle: {
    id: string;
    year: number;
    make: string;
    model: string;
    trim: string;
    mileage: number;
    price: number;
    estimatedValue: number;
    location: string;
    dealer: string;
    image: string;
    condition: string;
    daysOnMarket: number;
  };
  onPress?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
  isFavorite?: boolean;
}

export function VehicleCard({ 
  vehicle, 
  onPress, 
  onFavorite, 
  onShare, 
  isFavorite = false 
}: VehicleCardProps) {
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

  const valueIndicator = getValueIndicator();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: vehicle.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.imageOverlay}>
          <View style={[styles.valueBadge, { backgroundColor: valueIndicator.color }]}>
            <Text style={styles.valueBadgeText}>{valueIndicator.label}</Text>
          </View>
          <TouchableOpacity style={styles.favoriteButton} onPress={onFavorite}>
            <Heart 
              size={20} 
              color={isFavorite ? "#dc2626" : "#ffffff"} 
              fill={isFavorite ? "#dc2626" : "transparent"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </Text>
          <Text style={styles.price}>{formatCurrency(vehicle.price)}</Text>
        </View>

        <Text style={styles.subtitle}>
          {vehicle.trim} • {vehicle.mileage.toLocaleString()} mi • {vehicle.condition}
        </Text>

        <View style={styles.locationRow}>
          <MapPin size={14} color="#6b7280" />
          <Text style={styles.locationText}>{vehicle.location}</Text>
          <Text style={styles.dealerText}>• {vehicle.dealer}</Text>
        </View>

        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Calendar size={14} color="#6b7280" />
            <Text style={styles.metricText}>{vehicle.daysOnMarket} days</Text>
          </View>
          <View style={styles.metric}>
            <TrendingUp size={14} color={valueIndicator.color} />
            <Text style={[styles.metricText, { color: valueIndicator.color }]}>
              {valueIndicator.label}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.viewButton} onPress={onPress}>
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={onShare}>
            <Share2 size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  valueBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#059669',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  dealerText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 12,
  },
  viewButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#3b82f6',
    textAlign: 'center',
  },
  shareButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
});
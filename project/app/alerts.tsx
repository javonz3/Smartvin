import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Plus, TrendingDown, TrendingUp, Car, DollarSign, MapPin, X, Settings, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

interface PriceAlert {
  id: string;
  make: string;
  model: string;
  yearRange: {
    min: number;
    max: number;
  };
  mileageMax: number;
  priceMax: number;
  location: string;
  radius: number;
  isActive: boolean;
  createdAt: Date;
  triggeredCount: number;
}

interface MarketAlert {
  id: string;
  type: 'price_drop' | 'new_listing' | 'market_trend';
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  data?: any;
}

const mockPriceAlerts: PriceAlert[] = [
  {
    id: '1',
    make: 'Honda',
    model: 'Civic',
    yearRange: { min: 2018, max: 2022 },
    mileageMax: 60000,
    priceMax: 20000,
    location: 'Dallas, TX',
    radius: 50,
    isActive: true,
    createdAt: new Date('2024-01-10'),
    triggeredCount: 3
  },
  {
    id: '2',
    make: 'Toyota',
    model: 'Camry',
    yearRange: { min: 2019, max: 2023 },
    mileageMax: 50000,
    priceMax: 25000,
    location: 'Austin, TX',
    radius: 25,
    isActive: false,
    createdAt: new Date('2024-01-08'),
    triggeredCount: 1
  }
];

const mockMarketAlerts: MarketAlert[] = [
  {
    id: '1',
    type: 'price_drop',
    title: 'Price Drop Alert',
    description: '2021 Honda Civic LX dropped $1,500 to $21,500',
    timestamp: new Date('2024-01-15T10:30:00'),
    isRead: false
  },
  {
    id: '2',
    type: 'new_listing',
    title: 'New Listing Match',
    description: '2020 Toyota Camry LE matches your criteria',
    timestamp: new Date('2024-01-15T08:15:00'),
    isRead: false
  },
  {
    id: '3',
    type: 'market_trend',
    title: 'Market Trend Update',
    description: 'Honda Civic prices trending down 3% this week',
    timestamp: new Date('2024-01-14T16:45:00'),
    isRead: true
  }
];

export default function Alerts() {
  const [priceAlerts, setPriceAlerts] = useState(mockPriceAlerts);
  const [marketAlerts, setMarketAlerts] = useState(mockMarketAlerts);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    make: '',
    model: '',
    yearMin: '',
    yearMax: '',
    mileageMax: '',
    priceMax: '',
    location: '',
    radius: '25'
  });

  const toggleAlert = (alertId: string) => {
    setPriceAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, isActive: !alert.isActive }
          : alert
      )
    );
  };

  const deleteAlert = (alertId: string) => {
    Alert.alert(
      'Delete Alert',
      'Are you sure you want to delete this price alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setPriceAlerts(prev => prev.filter(alert => alert.id !== alertId))
        }
      ]
    );
  };

  const markAsRead = (alertId: string) => {
    setMarketAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  const createAlert = () => {
    if (!newAlert.make || !newAlert.model || !newAlert.priceMax) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    const alert: PriceAlert = {
      id: Date.now().toString(),
      make: newAlert.make,
      model: newAlert.model,
      yearRange: {
        min: parseInt(newAlert.yearMin) || 2015,
        max: parseInt(newAlert.yearMax) || 2024
      },
      mileageMax: parseInt(newAlert.mileageMax) || 100000,
      priceMax: parseInt(newAlert.priceMax),
      location: newAlert.location || 'Nationwide',
      radius: parseInt(newAlert.radius),
      isActive: true,
      createdAt: new Date(),
      triggeredCount: 0
    };

    setPriceAlerts(prev => [alert, ...prev]);
    setNewAlert({
      make: '',
      model: '',
      yearMin: '',
      yearMax: '',
      mileageMax: '',
      priceMax: '',
      location: '',
      radius: '25'
    });
    setShowCreateAlert(false);
    Alert.alert('Success', 'Price alert created successfully!');
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_drop':
        return <TrendingDown size={20} color="#059669" />;
      case 'new_listing':
        return <Car size={20} color="#3b82f6" />;
      case 'market_trend':
        return <TrendingUp size={20} color="#f59e0b" />;
      default:
        return <Bell size={20} color="#6b7280" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const unreadCount = marketAlerts.filter(alert => !alert.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smart Alerts</Text>
        <View style={styles.headerSpacer} />
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recent Market Alerts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={20} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {marketAlerts.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={[styles.marketAlertCard, !alert.isRead && styles.unreadAlert]}
              onPress={() => markAsRead(alert.id)}
            >
              <View style={styles.alertIcon}>
                {getAlertIcon(alert.type)}
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertDescription}>{alert.description}</Text>
                <Text style={styles.alertTime}>
                  {alert.timestamp.toLocaleDateString()} at {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              {!alert.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Alerts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Price Alerts</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCreateAlert(true)}
            >
              <Plus size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {priceAlerts.map((alert) => (
            <View key={alert.id} style={styles.priceAlertCard}>
              <View style={styles.alertHeader}>
                <View style={styles.alertInfo}>
                  <Text style={styles.vehicleTitle}>
                    {alert.make} {alert.model}
                  </Text>
                  <Text style={styles.alertCriteria}>
                    {alert.yearRange.min}-{alert.yearRange.max} • 
                    Under {alert.mileageMax.toLocaleString()} mi • 
                    Max {formatCurrency(alert.priceMax)}
                  </Text>
                </View>
                <Switch
                  value={alert.isActive}
                  onValueChange={() => toggleAlert(alert.id)}
                  trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
                  thumbColor="#ffffff"
                />
              </View>

              <View style={styles.alertDetails}>
                <View style={styles.detailItem}>
                  <MapPin size={16} color="#6b7280" />
                  <Text style={styles.detailText}>
                    {alert.location} ({alert.radius} mi radius)
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Bell size={16} color="#6b7280" />
                  <Text style={styles.detailText}>
                    {alert.triggeredCount} matches found
                  </Text>
                </View>
              </View>

              <View style={styles.alertActions}>
                <Text style={styles.createdDate}>
                  Created {alert.createdAt.toLocaleDateString()}
                </Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteAlert(alert.id)}
                >
                  <X size={16} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {priceAlerts.length === 0 && (
            <View style={styles.emptyState}>
              <Bell size={48} color="#9ca3af" />
              <Text style={styles.emptyStateTitle}>No Price Alerts</Text>
              <Text style={styles.emptyStateSubtitle}>
                Create alerts to get notified when vehicles matching your criteria become available
              </Text>
            </View>
          )}
        </View>

        {/* Create Alert Form */}
        {showCreateAlert && (
          <View style={styles.createAlertForm}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Create Price Alert</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCreateAlert(false)}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContent}>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Make *</Text>
                  <TextInput
                    style={styles.input}
                    value={newAlert.make}
                    onChangeText={(text) => setNewAlert(prev => ({ ...prev, make: text }))}
                    placeholder="Honda"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Model *</Text>
                  <TextInput
                    style={styles.input}
                    value={newAlert.model}
                    onChangeText={(text) => setNewAlert(prev => ({ ...prev, model: text }))}
                    placeholder="Civic"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Year From</Text>
                  <TextInput
                    style={styles.input}
                    value={newAlert.yearMin}
                    onChangeText={(text) => setNewAlert(prev => ({ ...prev, yearMin: text }))}
                    placeholder="2018"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Year To</Text>
                  <TextInput
                    style={styles.input}
                    value={newAlert.yearMax}
                    onChangeText={(text) => setNewAlert(prev => ({ ...prev, yearMax: text }))}
                    placeholder="2024"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Max Mileage</Text>
                  <TextInput
                    style={styles.input}
                    value={newAlert.mileageMax}
                    onChangeText={(text) => setNewAlert(prev => ({ ...prev, mileageMax: text }))}
                    placeholder="60000"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Max Price *</Text>
                  <TextInput
                    style={styles.input}
                    value={newAlert.priceMax}
                    onChangeText={(text) => setNewAlert(prev => ({ ...prev, priceMax: text }))}
                    placeholder="25000"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                  style={styles.input}
                  value={newAlert.location}
                  onChangeText={(text) => setNewAlert(prev => ({ ...prev, location: text }))}
                  placeholder="Dallas, TX"
                />
              </View>

              <TouchableOpacity style={styles.createButton} onPress={createAlert}>
                <Text style={styles.createButtonText}>Create Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    position: 'relative',
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
  unreadBadge: {
    position: 'absolute',
    top: 16,
    right: 20,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    padding: 8,
  },
  marketAlertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadAlert: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginBottom: 8,
  },
  alertTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginTop: 8,
  },
  priceAlertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  alertCriteria: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  alertDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  createdDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  createAlertForm: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  formContent: {
    gap: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#ffffff',
  },
  createButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});
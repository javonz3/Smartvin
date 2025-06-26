import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, X, AArrowDown as Vs, TrendingUp, TrendingDown, DollarSign, Gauge, Fuel, Calendar, Award, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

interface ComparisonVehicle {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  condition: string;
  valuations: {
    wholesale: number;
    tradeIn: number;
    retail: number;
    bhph: number;
  };
  specs: {
    engine: string;
    transmission: string;
    mpg: string;
    horsepower: number;
  };
  marketScore: number;
  pricePerMile: number;
  depreciationRate: number;
}

const mockVehicles: ComparisonVehicle[] = [
  {
    id: '1',
    vin: '1HGBH41JXMN109186',
    year: 2021,
    make: 'Honda',
    model: 'Civic',
    trim: 'LX',
    mileage: 45000,
    condition: 'Good',
    valuations: {
      wholesale: 18500,
      tradeIn: 17000,
      retail: 22000,
      bhph: 24500
    },
    specs: {
      engine: '2.0L 4-Cylinder',
      transmission: 'CVT',
      mpg: '32/42',
      horsepower: 158
    },
    marketScore: 85,
    pricePerMile: 0.49,
    depreciationRate: 12.5
  },
  {
    id: '2',
    vin: '1FTFW1ET5DFC10312',
    year: 2020,
    make: 'Ford',
    model: 'F-150',
    trim: 'XLT',
    mileage: 62000,
    condition: 'Good',
    valuations: {
      wholesale: 25200,
      tradeIn: 24000,
      retail: 29500,
      bhph: 32000
    },
    specs: {
      engine: '3.5L V6',
      transmission: '10-Speed Auto',
      mpg: '20/26',
      horsepower: 290
    },
    marketScore: 78,
    pricePerMile: 0.48,
    depreciationRate: 15.2
  }
];

export default function Compare() {
  const [selectedVehicles, setSelectedVehicles] = useState<ComparisonVehicle[]>([]);
  const [searchVin, setSearchVin] = useState('');
  const [availableVehicles] = useState(mockVehicles);

  const addVehicle = (vehicle: ComparisonVehicle) => {
    if (selectedVehicles.length >= 3) {
      Alert.alert('Limit Reached', 'You can compare up to 3 vehicles at once');
      return;
    }
    
    if (selectedVehicles.find(v => v.id === vehicle.id)) {
      Alert.alert('Already Added', 'This vehicle is already in your comparison');
      return;
    }

    setSelectedVehicles(prev => [...prev, vehicle]);
  };

  const removeVehicle = (vehicleId: string) => {
    setSelectedVehicles(prev => prev.filter(v => v.id !== vehicleId));
  };

  const addByVin = () => {
    if (!searchVin) return;
    
    const vehicle = availableVehicles.find(v => 
      v.vin.toLowerCase().includes(searchVin.toLowerCase())
    );
    
    if (vehicle) {
      addVehicle(vehicle);
      setSearchVin('');
    } else {
      Alert.alert('Not Found', 'Vehicle not found in your history. Please perform a VIN lookup first.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getBestValue = (vehicles: ComparisonVehicle[], key: keyof ComparisonVehicle['valuations']) => {
    if (vehicles.length === 0) return null;
    return Math.max(...vehicles.map(v => v.valuations[key]));
  };

  const getWorstValue = (vehicles: ComparisonVehicle[], key: keyof ComparisonVehicle['valuations']) => {
    if (vehicles.length === 0) return null;
    return Math.min(...vehicles.map(v => v.valuations[key]));
  };

  const getValueIndicator = (value: number, best: number | null, worst: number | null) => {
    if (!best || !worst || best === worst) return 'neutral';
    if (value === best) return 'best';
    if (value === worst) return 'worst';
    return 'neutral';
  };

  const renderComparisonMetric = (
    title: string,
    getValue: (vehicle: ComparisonVehicle) => number | string,
    format: (value: any) => string = (v) => v.toString(),
    higherIsBetter: boolean = true
  ) => {
    const values = selectedVehicles.map(getValue);
    const numericValues = values.filter(v => typeof v === 'number') as number[];
    const best = numericValues.length > 0 ? (higherIsBetter ? Math.max(...numericValues) : Math.min(...numericValues)) : null;
    const worst = numericValues.length > 0 ? (higherIsBetter ? Math.min(...numericValues) : Math.max(...numericValues)) : null;

    return (
      <View style={styles.metricRow}>
        <Text style={styles.metricTitle}>{title}</Text>
        {selectedVehicles.map((vehicle, index) => {
          const value = getValue(vehicle);
          const numValue = typeof value === 'number' ? value : 0;
          const indicator = getValueIndicator(numValue, best, worst);
          
          return (
            <View key={vehicle.id} style={[styles.metricValue, styles[`metric${indicator}`]]}>
              <Text style={[styles.metricText, styles[`metricText${indicator}`]]}>
                {format(value)}
              </Text>
              {indicator === 'best' && <Award size={16} color="#059669" />}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Comparison</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter VIN to add vehicle"
          value={searchVin}
          onChangeText={setSearchVin}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.addButton} onPress={addByVin}>
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedVehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <Vs size={64} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>No Vehicles Selected</Text>
            <Text style={styles.emptyStateSubtitle}>
              Add vehicles from your lookup history or enter a VIN to start comparing
            </Text>
            
            <View style={styles.quickAddSection}>
              <Text style={styles.quickAddTitle}>Quick Add from History</Text>
              {availableVehicles.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={styles.quickAddItem}
                  onPress={() => addVehicle(vehicle)}
                >
                  <Text style={styles.quickAddText}>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </Text>
                  <Plus size={20} color="#3b82f6" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.comparisonTable}>
            {/* Vehicle Headers */}
            <View style={styles.headerRow}>
              <View style={styles.metricLabelColumn} />
              {selectedVehicles.map((vehicle) => (
                <View key={vehicle.id} style={styles.vehicleColumn}>
                  <View style={styles.vehicleHeader}>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeVehicle(vehicle.id)}
                    >
                      <X size={16} color="#dc2626" />
                    </TouchableOpacity>
                    <Text style={styles.vehicleTitle}>
                      {vehicle.year} {vehicle.make}
                    </Text>
                    <Text style={styles.vehicleSubtitle}>
                      {vehicle.model} {vehicle.trim}
                    </Text>
                    <Text style={styles.vehicleMileage}>
                      {vehicle.mileage.toLocaleString()} mi
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Valuation Metrics */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Market Valuations</Text>
            </View>

            {renderComparisonMetric(
              'Wholesale Value',
              (v) => v.valuations.wholesale,
              formatCurrency
            )}

            {renderComparisonMetric(
              'Trade-In Value',
              (v) => v.valuations.tradeIn,
              formatCurrency
            )}

            {renderComparisonMetric(
              'Retail Value',
              (v) => v.valuations.retail,
              formatCurrency
            )}

            {renderComparisonMetric(
              'BHPH Value',
              (v) => v.valuations.bhph,
              formatCurrency
            )}

            {/* Performance Metrics */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Performance & Efficiency</Text>
            </View>

            {renderComparisonMetric(
              'Horsepower',
              (v) => v.specs.horsepower,
              (v) => `${v} HP`
            )}

            {renderComparisonMetric(
              'Fuel Economy',
              (v) => v.specs.mpg,
              (v) => `${v} MPG`
            )}

            {renderComparisonMetric(
              'Engine',
              (v) => v.specs.engine,
              (v) => v
            )}

            {renderComparisonMetric(
              'Transmission',
              (v) => v.specs.transmission,
              (v) => v
            )}

            {/* Market Analysis */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Market Analysis</Text>
            </View>

            {renderComparisonMetric(
              'Market Score',
              (v) => v.marketScore,
              (v) => `${v}/100`
            )}

            {renderComparisonMetric(
              'Price per Mile',
              (v) => v.pricePerMile,
              (v) => `$${v.toFixed(2)}/mi`,
              false
            )}

            {renderComparisonMetric(
              'Depreciation Rate',
              (v) => v.depreciationRate,
              (v) => `${v}%/year`,
              false
            )}

            {/* Summary */}
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Comparison Summary</Text>
              {selectedVehicles.map((vehicle, index) => {
                const bestRetail = getBestValue(selectedVehicles, 'retail');
                const isHighestValue = vehicle.valuations.retail === bestRetail;
                
                return (
                  <View key={vehicle.id} style={styles.summaryCard}>
                    <Text style={styles.summaryVehicle}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </Text>
                    <View style={styles.summaryMetrics}>
                      <View style={styles.summaryMetric}>
                        <DollarSign size={16} color="#059669" />
                        <Text style={styles.summaryMetricText}>
                          {formatCurrency(vehicle.valuations.retail)} retail
                        </Text>
                      </View>
                      <View style={styles.summaryMetric}>
                        <Gauge size={16} color="#3b82f6" />
                        <Text style={styles.summaryMetricText}>
                          {vehicle.marketScore}/100 score
                        </Text>
                      </View>
                      <View style={styles.summaryMetric}>
                        <Fuel size={16} color="#f59e0b" />
                        <Text style={styles.summaryMetricText}>
                          {vehicle.specs.mpg} MPG
                        </Text>
                      </View>
                    </View>
                    {isHighestValue && (
                      <View style={styles.bestValueBadge}>
                        <Award size={16} color="#ffffff" />
                        <Text style={styles.bestValueText}>Highest Value</Text>
                      </View>
                    )}
                  </View>
                );
              })}
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
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#ffffff',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginTop: 20,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  quickAddSection: {
    width: '100%',
    marginTop: 40,
  },
  quickAddTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  quickAddItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickAddText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1e293b',
  },
  comparisonTable: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  metricLabelColumn: {
    width: 120,
  },
  vehicleColumn: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleHeader: {
    alignItems: 'center',
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 4,
  },
  vehicleTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    textAlign: 'center',
  },
  vehicleSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
  vehicleMileage: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  sectionHeader: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  metricTitle: {
    width: 120,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  metricValue: {
    flex: 1,
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  metricbest: {
    backgroundColor: '#ecfdf5',
  },
  metricworst: {
    backgroundColor: '#fef2f2',
  },
  metricneutral: {
    backgroundColor: '#f8fafc',
  },
  metricText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  metricTextbest: {
    color: '#059669',
  },
  metricTextworst: {
    color: '#dc2626',
  },
  metricTextneutral: {
    color: '#374151',
  },
  summarySection: {
    marginTop: 32,
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  summaryVehicle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 12,
  },
  summaryMetrics: {
    gap: 8,
  },
  summaryMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryMetricText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  bestValueBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  bestValueText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});
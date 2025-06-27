import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Database, Wifi, WifiOff, Settings, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Info } from 'lucide-react-native';
import { VinApiConfig } from '@/services/vinApiConfig';
import { MockVinDataService } from '@/services/mockVinData';

interface VinServiceToggleProps {
  onServiceChange?: (useMockData: boolean) => void;
}

export function VinServiceToggle({ onServiceChange }: VinServiceToggleProps) {
  const [useMockData, setUseMockData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<{
    service: 'mock' | 'real';
    status: 'active' | 'error';
    message: string;
    statistics?: any;
  } | null>(null);

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    const config = VinApiConfig.getConfig();
    setUseMockData(config.useMockData);
    
    // Get service status
    const status = await VinApiConfig.getServiceStatus();
    setServiceStatus(status);
  };

  const handleToggle = async (value: boolean) => {
    setLoading(true);
    
    try {
      if (value) {
        // Switch to mock API
        const result = VinApiConfig.switchToMockAPI();
        if (result.success) {
          setUseMockData(true);
          onServiceChange?.(true);
          Alert.alert('Success', result.message);
        } else {
          Alert.alert('Error', result.message);
        }
      } else {
        // Switch to real API
        const result = await VinApiConfig.switchToRealAPI();
        if (result.success) {
          setUseMockData(false);
          onServiceChange?.(false);
          Alert.alert('Success', result.message);
        } else {
          Alert.alert('Error', result.message);
          return; // Don't update state if switch failed
        }
      }
      
      // Reload status after switch
      await loadCurrentConfig();
      
    } catch (error) {
      Alert.alert('Error', 'Failed to switch VIN service');
      console.error('Service toggle error:', error);
    } finally {
      setLoading(false);
    }
  };

  const showServiceInfo = () => {
    if (!serviceStatus) return;

    let message = serviceStatus.message;
    
    if (serviceStatus.service === 'mock' && serviceStatus.statistics) {
      const stats = serviceStatus.statistics;
      message += `\n\nAvailable test data:`;
      message += `\n• ${stats.totalVINs} test vehicles`;
      message += `\n• Years: ${stats.yearRange.min}-${stats.yearRange.max}`;
      message += `\n• Makes: ${Object.keys(stats.makeBreakdown).join(', ')}`;
      message += `\n• Requests made: ${stats.requestCount}`;
    }

    Alert.alert(
      `${serviceStatus.service === 'mock' ? 'Mock' : 'Real'} VIN Service`,
      message,
      [{ text: 'OK' }]
    );
  };

  const showTestVINs = () => {
    const testData = VinApiConfig.getTestData();
    if (!testData) {
      Alert.alert('Info', 'Test VINs are only available when using mock data');
      return;
    }

    const vinList = testData.availableVINs
      .slice(0, 5) // Show first 5
      .map(item => `• ${item.vin} - ${item.description}`)
      .join('\n');

    Alert.alert(
      'Available Test VINs',
      `Here are some test VINs you can use:\n\n${vinList}\n\n...and ${testData.availableVINs.length - 5} more`,
      [{ text: 'OK' }]
    );
  };

  const getStatusIcon = () => {
    if (!serviceStatus) return <Settings size={20} color="#6b7280" />;
    
    if (serviceStatus.status === 'active') {
      return serviceStatus.service === 'mock' 
        ? <Database size={20} color="#059669" />
        : <Wifi size={20} color="#059669" />;
    } else {
      return serviceStatus.service === 'mock'
        ? <AlertCircle size={20} color="#dc2626" />
        : <WifiOff size={20} color="#dc2626" />;
    }
  };

  const getStatusColor = () => {
    if (!serviceStatus) return '#6b7280';
    return serviceStatus.status === 'active' ? '#059669' : '#dc2626';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {getStatusIcon()}
          <Text style={styles.title}>VIN Data Service</Text>
          <TouchableOpacity onPress={showServiceInfo} style={styles.infoButton}>
            <Info size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>
            {useMockData ? 'Mock Data' : 'Real API'}
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <Switch
              value={useMockData}
              onValueChange={handleToggle}
              trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
              thumbColor="#ffffff"
            />
          )}
        </View>
      </View>

      {serviceStatus && (
        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {serviceStatus.status === 'active' ? '● Active' : '● Error'}
            </Text>
            <Text style={styles.serviceType}>
              {serviceStatus.service === 'mock' ? 'Mock Service' : 'VinData API'}
            </Text>
          </View>
          
          <Text style={styles.statusMessage} numberOfLines={2}>
            {serviceStatus.message}
          </Text>
        </View>
      )}

      {useMockData && (
        <View style={styles.mockInfo}>
          <Text style={styles.mockInfoTitle}>Development Mode</Text>
          <Text style={styles.mockInfoText}>
            Using mock data for testing. No API credits will be consumed.
          </Text>
          
          <TouchableOpacity style={styles.testVinsButton} onPress={showTestVINs}>
            <Text style={styles.testVinsButtonText}>View Test VINs</Text>
          </TouchableOpacity>
        </View>
      )}

      {!useMockData && serviceStatus?.status === 'error' && (
        <View style={styles.errorInfo}>
          <AlertCircle size={16} color="#dc2626" />
          <Text style={styles.errorText}>
            Real API unavailable. Consider using mock data for development.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    flex: 1,
  },
  infoButton: {
    padding: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  statusContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  serviceType: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  statusMessage: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    lineHeight: 16,
  },
  mockInfo: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  mockInfoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1e40af',
    marginBottom: 4,
  },
  mockInfoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1e40af',
    lineHeight: 16,
    marginBottom: 8,
  },
  testVinsButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  testVinsButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  errorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#dc2626',
    flex: 1,
    lineHeight: 16,
  },
});
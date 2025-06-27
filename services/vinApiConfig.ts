import { VINApiService } from './vinApi';
import { MockVinDataService } from './mockVinData';
import { VDPApiResponse } from './vinApi';

// Environment configuration
interface VinApiConfig {
  useMockData: boolean;
  environment: 'development' | 'staging' | 'production';
  enableLogging: boolean;
}

// Default configuration based on environment
const getDefaultConfig = (): VinApiConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const hasApiCredentials = !!(
    process.env.EXPO_PUBLIC_VDP_API_KEY &&
    process.env.EXPO_PUBLIC_VDP_USERNAME &&
    process.env.EXPO_PUBLIC_VDP_PASSWORD
  );

  return {
    // Use mock data in development if no API credentials are provided
    useMockData: isDevelopment && !hasApiCredentials,
    environment: (process.env.NODE_ENV as any) || 'development',
    enableLogging: isDevelopment,
  };
};

class VinApiConfigService {
  private static instance: VinApiConfigService;
  private config: VinApiConfig;

  private constructor() {
    this.config = getDefaultConfig();
    this.logConfiguration();
  }

  static getInstance(): VinApiConfigService {
    if (!VinApiConfigService.instance) {
      VinApiConfigService.instance = new VinApiConfigService();
    }
    return VinApiConfigService.instance;
  }

  /**
   * Get current configuration
   */
  getConfig(): VinApiConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<VinApiConfig>): void {
    this.config = { ...this.config, ...updates };
    this.logConfiguration();
  }

  /**
   * Force enable mock data (useful for testing)
   */
  enableMockData(): void {
    this.config.useMockData = true;
    this.log('Mock data enabled');
  }

  /**
   * Force disable mock data (use real API)
   */
  disableMockData(): void {
    this.config.useMockData = false;
    this.log('Mock data disabled - using real API');
  }

  /**
   * Check if mock data should be used
   */
  shouldUseMockData(): boolean {
    return this.config.useMockData;
  }

  /**
   * Main VIN decoding method that routes to appropriate service
   */
  async decodeVIN(vin: string): Promise<VDPApiResponse> {
    if (this.config.useMockData) {
      this.log(`Using mock data for VIN: ${vin}`);
      return await MockVinDataService.decodeVIN(vin);
    } else {
      this.log(`Using real API for VIN: ${vin}`);
      return await VINApiService.decodeVIN(vin);
    }
  }

  /**
   * Validate API configuration
   */
  async validateConfiguration(): Promise<{
    isValid: boolean;
    service: 'mock' | 'real';
    message: string;
    details?: any;
  }> {
    if (this.config.useMockData) {
      const stats = MockVinDataService.getDatabaseStats();
      return {
        isValid: true,
        service: 'mock',
        message: `Mock service ready with ${stats.totalVINs} test vehicles`,
        details: stats
      };
    } else {
      const validation = await VINApiService.validateApiKey();
      return {
        isValid: validation.valid,
        service: 'real',
        message: validation.message,
        details: validation
      };
    }
  }

  /**
   * Get available test data (only for mock service)
   */
  getTestData(): {
    availableVINs: Array<{ vin: string; description: string }>;
    errorTestVINs: Array<{ vin: string; description: string; expectedError: string }>;
  } | null {
    if (!this.config.useMockData) {
      return null;
    }

    return {
      availableVINs: MockVinDataService.getAvailableTestVINs(),
      errorTestVINs: MockVinDataService.getErrorTestVINs()
    };
  }

  /**
   * Switch between mock and real API with validation
   */
  async switchToRealAPI(): Promise<{ success: boolean; message: string }> {
    // Check if real API credentials are available
    const hasCredentials = !!(
      process.env.EXPO_PUBLIC_VDP_API_KEY &&
      process.env.EXPO_PUBLIC_VDP_USERNAME &&
      process.env.EXPO_PUBLIC_VDP_PASSWORD
    );

    if (!hasCredentials) {
      return {
        success: false,
        message: 'Cannot switch to real API: Missing VinData API credentials. Please check your environment variables.'
      };
    }

    // Validate real API connection
    try {
      const validation = await VINApiService.validateApiKey();
      if (validation.valid) {
        this.disableMockData();
        return {
          success: true,
          message: 'Successfully switched to real VinData API'
        };
      } else {
        return {
          success: false,
          message: `Cannot switch to real API: ${validation.message}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Cannot switch to real API: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Switch to mock API
   */
  switchToMockAPI(): { success: boolean; message: string } {
    this.enableMockData();
    const stats = MockVinDataService.getDatabaseStats();
    return {
      success: true,
      message: `Switched to mock API with ${stats.totalVINs} test vehicles available`
    };
  }

  /**
   * Get service status and statistics
   */
  async getServiceStatus(): Promise<{
    service: 'mock' | 'real';
    status: 'active' | 'error';
    message: string;
    statistics?: any;
  }> {
    if (this.config.useMockData) {
      const stats = MockVinDataService.getDatabaseStats();
      return {
        service: 'mock',
        status: 'active',
        message: 'Mock service is active',
        statistics: stats
      };
    } else {
      try {
        const validation = await VINApiService.validateApiKey();
        return {
          service: 'real',
          status: validation.valid ? 'active' : 'error',
          message: validation.message
        };
      } catch (error) {
        return {
          service: 'real',
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  }

  // Private helper methods

  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[VinApiConfig] ${message}`);
    }
  }

  private logConfiguration(): void {
    if (this.config.enableLogging) {
      console.log('[VinApiConfig] Configuration:', {
        useMockData: this.config.useMockData,
        environment: this.config.environment,
        hasApiCredentials: !!(
          process.env.EXPO_PUBLIC_VDP_API_KEY &&
          process.env.EXPO_PUBLIC_VDP_USERNAME &&
          process.env.EXPO_PUBLIC_VDP_PASSWORD
        )
      });
    }
  }
}

// Export singleton instance
export const VinApiConfig = VinApiConfigService.getInstance();

// Export types for use in other files
export type { VinApiConfig as VinApiConfigType };
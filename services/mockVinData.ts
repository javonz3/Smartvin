import { VDPVehicleData, VDPApiResponse } from './vinApi';

// Mock VIN database with realistic vehicle data
const MOCK_VIN_DATABASE: Record<string, VDPVehicleData> = {
  // 2021 Honda Civic LX
  '1HGBH41JXMN109186': {
    vin: '1HGBH41JXMN109186',
    year: 2021,
    make: 'Honda',
    model: 'Civic',
    trim: 'LX',
    engine: '2.0L 4-Cylinder',
    transmission: 'CVT Automatic',
    drivetrain: 'Front-Wheel Drive',
    bodyStyle: 'Sedan',
    fuelType: 'Gasoline',
    doors: 4,
    cylinders: 4,
    displacement: '2.0L',
    horsepower: 158,
    torque: 138,
    cityMpg: 32,
    highwayMpg: 42,
    combinedMpg: 36,
    msrp: 22350,
    category: 'Compact Car',
    manufacturerCode: 'HONDA',
    plantCountry: 'USA',
    plantCompany: 'Honda Manufacturing of Indiana',
    plantState: 'IN',
    plantCity: 'Greensburg',
    htmlLink: 'https://mock-reports.vindata.com/report/1HGBH41JXMN109186',
    reportId: 'mock_report_001',
    reportDate: '2024-01-15T10:30:00Z'
  },

  // 2020 Ford F-150 XLT
  '1FTFW1ET5DFC10312': {
    vin: '1FTFW1ET5DFC10312',
    year: 2020,
    make: 'Ford',
    model: 'F-150',
    trim: 'XLT SuperCrew',
    engine: '3.5L V6 EcoBoost',
    transmission: '10-Speed Automatic',
    drivetrain: '4WD',
    bodyStyle: 'Pickup Truck',
    fuelType: 'Gasoline',
    doors: 4,
    cylinders: 6,
    displacement: '3.5L',
    horsepower: 375,
    torque: 470,
    cityMpg: 20,
    highwayMpg: 26,
    combinedMpg: 22,
    msrp: 45920,
    category: 'Full-Size Pickup',
    manufacturerCode: 'FORD',
    plantCountry: 'USA',
    plantCompany: 'Ford Motor Company',
    plantState: 'MI',
    plantCity: 'Dearborn',
    htmlLink: 'https://mock-reports.vindata.com/report/1FTFW1ET5DFC10312',
    reportId: 'mock_report_002',
    reportDate: '2024-01-15T11:15:00Z'
  },

  // 2019 Toyota Camry LE
  '4T1B11HK5KU123456': {
    vin: '4T1B11HK5KU123456',
    year: 2019,
    make: 'Toyota',
    model: 'Camry',
    trim: 'LE',
    engine: '2.5L 4-Cylinder',
    transmission: '8-Speed Automatic',
    drivetrain: 'Front-Wheel Drive',
    bodyStyle: 'Sedan',
    fuelType: 'Gasoline',
    doors: 4,
    cylinders: 4,
    displacement: '2.5L',
    horsepower: 203,
    torque: 184,
    cityMpg: 28,
    highwayMpg: 39,
    combinedMpg: 32,
    msrp: 24350,
    category: 'Mid-Size Car',
    manufacturerCode: 'TOYOTA',
    plantCountry: 'USA',
    plantCompany: 'Toyota Motor Manufacturing',
    plantState: 'KY',
    plantCity: 'Georgetown',
    htmlLink: 'https://mock-reports.vindata.com/report/4T1B11HK5KU123456',
    reportId: 'mock_report_003',
    reportDate: '2024-01-15T12:00:00Z'
  },

  // 2022 Tesla Model 3 Long Range
  '5YJ3E1EA5NF123789': {
    vin: '5YJ3E1EA5NF123789',
    year: 2022,
    make: 'Tesla',
    model: 'Model 3',
    trim: 'Long Range',
    engine: 'Electric Motor',
    transmission: 'Single-Speed Direct Drive',
    drivetrain: 'All-Wheel Drive',
    bodyStyle: 'Sedan',
    fuelType: 'Electric',
    doors: 4,
    cylinders: 0,
    displacement: 'N/A',
    horsepower: 358,
    torque: 317,
    cityMpg: 134, // MPGe equivalent
    highwayMpg: 126,
    combinedMpg: 130,
    msrp: 54490,
    category: 'Luxury Electric Vehicle',
    manufacturerCode: 'TESLA',
    plantCountry: 'USA',
    plantCompany: 'Tesla, Inc.',
    plantState: 'CA',
    plantCity: 'Fremont',
    htmlLink: 'https://mock-reports.vindata.com/report/5YJ3E1EA5NF123789',
    reportId: 'mock_report_004',
    reportDate: '2024-01-15T13:30:00Z'
  },

  // 2018 BMW X5 xDrive35i
  '5UXKR0C58J0123456': {
    vin: '5UXKR0C58J0123456',
    year: 2018,
    make: 'BMW',
    model: 'X5',
    trim: 'xDrive35i',
    engine: '3.0L 6-Cylinder Turbo',
    transmission: '8-Speed Automatic',
    drivetrain: 'All-Wheel Drive',
    bodyStyle: 'SUV',
    fuelType: 'Gasoline',
    doors: 4,
    cylinders: 6,
    displacement: '3.0L',
    horsepower: 300,
    torque: 300,
    cityMpg: 20,
    highwayMpg: 27,
    combinedMpg: 23,
    msrp: 60700,
    category: 'Luxury SUV',
    manufacturerCode: 'BMW',
    plantCountry: 'USA',
    plantCompany: 'BMW Manufacturing Co.',
    plantState: 'SC',
    plantCity: 'Spartanburg',
    htmlLink: 'https://mock-reports.vindata.com/report/5UXKR0C58J0123456',
    reportId: 'mock_report_005',
    reportDate: '2024-01-15T14:45:00Z'
  },

  // 2017 Hyundai Elantra SE
  '5NPE34AF4HH012345': {
    vin: '5NPE34AF4HH012345',
    year: 2017,
    make: 'Hyundai',
    model: 'Elantra',
    trim: 'SE',
    engine: '2.0L 4-Cylinder',
    transmission: '6-Speed Automatic',
    drivetrain: 'Front-Wheel Drive',
    bodyStyle: 'Sedan',
    fuelType: 'Gasoline',
    doors: 4,
    cylinders: 4,
    displacement: '2.0L',
    horsepower: 147,
    torque: 132,
    cityMpg: 29,
    highwayMpg: 38,
    combinedMpg: 33,
    msrp: 17985,
    category: 'Compact Car',
    manufacturerCode: 'HYUNDAI',
    plantCountry: 'USA',
    plantCompany: 'Hyundai Motor Manufacturing Alabama',
    plantState: 'AL',
    plantCity: 'Montgomery',
    htmlLink: 'https://mock-reports.vindata.com/report/5NPE34AF4HH012345',
    reportId: 'mock_report_006',
    reportDate: '2024-01-15T15:20:00Z'
  },

  // 2023 Chevrolet Silverado 1500 LT
  '1GCUYDED5PZ123456': {
    vin: '1GCUYDED5PZ123456',
    year: 2023,
    make: 'Chevrolet',
    model: 'Silverado 1500',
    trim: 'LT Crew Cab',
    engine: '5.3L V8',
    transmission: '10-Speed Automatic',
    drivetrain: '4WD',
    bodyStyle: 'Pickup Truck',
    fuelType: 'Gasoline',
    doors: 4,
    cylinders: 8,
    displacement: '5.3L',
    horsepower: 355,
    torque: 383,
    cityMpg: 16,
    highwayMpg: 22,
    combinedMpg: 18,
    msrp: 42300,
    category: 'Full-Size Pickup',
    manufacturerCode: 'CHEVROLET',
    plantCountry: 'USA',
    plantCompany: 'General Motors',
    plantState: 'IN',
    plantCity: 'Fort Wayne',
    htmlLink: 'https://mock-reports.vindata.com/report/1GCUYDED5PZ123456',
    reportId: 'mock_report_007',
    reportDate: '2024-01-15T16:10:00Z'
  },

  // 2020 Nissan Altima 2.5 S
  '1N4BL4BV4LC123456': {
    vin: '1N4BL4BV4LC123456',
    year: 2020,
    make: 'Nissan',
    model: 'Altima',
    trim: '2.5 S',
    engine: '2.5L 4-Cylinder',
    transmission: 'CVT Automatic',
    drivetrain: 'Front-Wheel Drive',
    bodyStyle: 'Sedan',
    fuelType: 'Gasoline',
    doors: 4,
    cylinders: 4,
    displacement: '2.5L',
    horsepower: 188,
    torque: 180,
    cityMpg: 28,
    highwayMpg: 39,
    combinedMpg: 32,
    msrp: 24300,
    category: 'Mid-Size Car',
    manufacturerCode: 'NISSAN',
    plantCountry: 'USA',
    plantCompany: 'Nissan North America',
    plantState: 'TN',
    plantCity: 'Smyrna',
    htmlLink: 'https://mock-reports.vindata.com/report/1N4BL4BV4LC123456',
    reportId: 'mock_report_008',
    reportDate: '2024-01-15T17:00:00Z'
  },

  // 2021 Jeep Wrangler Unlimited Sport
  '1C4HJXDG5MW123456': {
    vin: '1C4HJXDG5MW123456',
    year: 2021,
    make: 'Jeep',
    model: 'Wrangler',
    trim: 'Unlimited Sport',
    engine: '3.6L V6',
    transmission: '8-Speed Automatic',
    drivetrain: '4WD',
    bodyStyle: 'SUV',
    fuelType: 'Gasoline',
    doors: 4,
    cylinders: 6,
    displacement: '3.6L',
    horsepower: 285,
    torque: 260,
    cityMpg: 20,
    highwayMpg: 24,
    combinedMpg: 22,
    msrp: 34895,
    category: 'Compact SUV',
    manufacturerCode: 'JEEP',
    plantCountry: 'USA',
    plantCompany: 'Stellantis North America',
    plantState: 'OH',
    plantCity: 'Toledo',
    htmlLink: 'https://mock-reports.vindata.com/report/1C4HJXDG5MW123456',
    reportId: 'mock_report_009',
    reportDate: '2024-01-15T18:15:00Z'
  },

  // 2019 Subaru Outback 2.5i
  '4S4BSANC5K3123456': {
    vin: '4S4BSANC5K3123456',
    year: 2019,
    make: 'Subaru',
    model: 'Outback',
    trim: '2.5i',
    engine: '2.5L 4-Cylinder',
    transmission: 'CVT Automatic',
    drivetrain: 'All-Wheel Drive',
    bodyStyle: 'Wagon',
    fuelType: 'Gasoline',
    doors: 4,
    cylinders: 4,
    displacement: '2.5L',
    horsepower: 175,
    torque: 174,
    cityMpg: 26,
    highwayMpg: 33,
    combinedMpg: 29,
    msrp: 27195,
    category: 'Mid-Size Wagon',
    manufacturerCode: 'SUBARU',
    plantCountry: 'USA',
    plantCompany: 'Subaru of Indiana Automotive',
    plantState: 'IN',
    plantCity: 'Lafayette',
    htmlLink: 'https://mock-reports.vindata.com/report/4S4BSANC5K3123456',
    reportId: 'mock_report_010',
    reportDate: '2024-01-15T19:30:00Z'
  }
};

// Common error VINs for testing error scenarios
const ERROR_TEST_VINS = {
  'INVALID_VIN_FORMAT': 'INVALID123', // Too short
  'VIN_NOT_FOUND': '1HGBH41JXMN999999', // Valid format but not in database
  'NETWORK_ERROR_TEST': '1HGBH41JXMN000000', // Simulates network error
  'RATE_LIMIT_TEST': '1HGBH41JXMN111111', // Simulates rate limiting
  'SERVER_ERROR_TEST': '1HGBH41JXMN222222', // Simulates server error
};

export class MockVinDataService {
  private static readonly RESPONSE_DELAY_MS = 1500; // Simulate network delay
  private static requestCount = 0;
  private static readonly RATE_LIMIT_THRESHOLD = 10; // Requests per minute

  /**
   * Mock VIN decoding that simulates the real VinData API
   */
  static async decodeVIN(vin: string): Promise<VDPApiResponse> {
    // Increment request counter for rate limiting simulation
    this.requestCount++;

    // Simulate network delay
    await this.simulateNetworkDelay();

    // Validate VIN format
    if (!this.isValidVINFormat(vin)) {
      return {
        success: false,
        error: 'Invalid VIN format',
        message: 'VIN must be 17 characters long and contain only valid characters (no I, O, or Q)'
      };
    }

    // Handle special test cases
    const testResult = this.handleTestCases(vin);
    if (testResult) {
      return testResult;
    }

    // Check if VIN exists in mock database
    const vehicleData = MOCK_VIN_DATABASE[vin.toUpperCase()];
    if (!vehicleData) {
      return {
        success: false,
        error: 'VIN not found',
        message: `No vehicle data found for VIN: ${vin}. This VIN may not exist in our database or may be from a vehicle not yet supported.`
      };
    }

    // Simulate successful response
    console.log(`[MockVinDataService] Successfully decoded VIN: ${vin}`);
    return {
      success: true,
      data: vehicleData
    };
  }

  /**
   * Get all available mock VINs for testing
   */
  static getAvailableTestVINs(): Array<{ vin: string; description: string }> {
    return [
      { vin: '1HGBH41JXMN109186', description: '2021 Honda Civic LX' },
      { vin: '1FTFW1ET5DFC10312', description: '2020 Ford F-150 XLT' },
      { vin: '4T1B11HK5KU123456', description: '2019 Toyota Camry LE' },
      { vin: '5YJ3E1EA5NF123789', description: '2022 Tesla Model 3 Long Range' },
      { vin: '5UXKR0C58J0123456', description: '2018 BMW X5 xDrive35i' },
      { vin: '5NPE34AF4HH012345', description: '2017 Hyundai Elantra SE' },
      { vin: '1GCUYDED5PZ123456', description: '2023 Chevrolet Silverado 1500 LT' },
      { vin: '1N4BL4BV4LC123456', description: '2020 Nissan Altima 2.5 S' },
      { vin: '1C4HJXDG5MW123456', description: '2021 Jeep Wrangler Unlimited Sport' },
      { vin: '4S4BSANC5K3123456', description: '2019 Subaru Outback 2.5i' },
    ];
  }

  /**
   * Get test VINs for error scenarios
   */
  static getErrorTestVINs(): Array<{ vin: string; description: string; expectedError: string }> {
    return [
      { 
        vin: 'INVALID123', 
        description: 'Invalid VIN format (too short)', 
        expectedError: 'Invalid VIN format' 
      },
      { 
        vin: '1HGBH41JXMN999999', 
        description: 'Valid format but not found', 
        expectedError: 'VIN not found' 
      },
      { 
        vin: '1HGBH41JXMN000000', 
        description: 'Network error simulation', 
        expectedError: 'Network error' 
      },
      { 
        vin: '1HGBH41JXMN111111', 
        description: 'Rate limit simulation', 
        expectedError: 'Rate limit exceeded' 
      },
      { 
        vin: '1HGBH41JXMN222222', 
        description: 'Server error simulation', 
        expectedError: 'Server error' 
      },
    ];
  }

  /**
   * Reset request counter (useful for testing)
   */
  static resetRequestCounter(): void {
    this.requestCount = 0;
  }

  /**
   * Get current request count
   */
  static getRequestCount(): number {
    return this.requestCount;
  }

  /**
   * Add a custom VIN to the mock database (useful for testing)
   */
  static addMockVIN(vin: string, vehicleData: VDPVehicleData): void {
    MOCK_VIN_DATABASE[vin.toUpperCase()] = vehicleData;
    console.log(`[MockVinDataService] Added mock VIN: ${vin}`);
  }

  /**
   * Remove a VIN from the mock database
   */
  static removeMockVIN(vin: string): void {
    delete MOCK_VIN_DATABASE[vin.toUpperCase()];
    console.log(`[MockVinDataService] Removed mock VIN: ${vin}`);
  }

  /**
   * Get statistics about the mock database
   */
  static getDatabaseStats(): {
    totalVINs: number;
    makeBreakdown: Record<string, number>;
    yearRange: { min: number; max: number };
    requestCount: number;
  } {
    const vins = Object.values(MOCK_VIN_DATABASE);
    const makeBreakdown: Record<string, number> = {};
    let minYear = Infinity;
    let maxYear = -Infinity;

    vins.forEach(vehicle => {
      // Count by make
      makeBreakdown[vehicle.make] = (makeBreakdown[vehicle.make] || 0) + 1;
      
      // Track year range
      minYear = Math.min(minYear, vehicle.year);
      maxYear = Math.max(maxYear, vehicle.year);
    });

    return {
      totalVINs: vins.length,
      makeBreakdown,
      yearRange: { min: minYear, max: maxYear },
      requestCount: this.requestCount
    };
  }

  // Private helper methods

  private static async simulateNetworkDelay(): Promise<void> {
    const delay = Math.random() * this.RESPONSE_DELAY_MS + 500; // 500ms to 2000ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private static isValidVINFormat(vin: string): boolean {
    if (!vin || vin.length !== 17) {
      return false;
    }
    
    // VIN should not contain I, O, or Q
    const invalidChars = /[IOQ]/i;
    if (invalidChars.test(vin)) {
      return false;
    }
    
    // VIN should only contain alphanumeric characters
    const validChars = /^[A-HJ-NPR-Z0-9]+$/i;
    return validChars.test(vin);
  }

  private static handleTestCases(vin: string): VDPApiResponse | null {
    const upperVin = vin.toUpperCase();

    // Network error simulation
    if (upperVin === ERROR_TEST_VINS.NETWORK_ERROR_TEST) {
      return {
        success: false,
        error: 'Network error',
        message: 'Failed to connect to VIN service. Please check your internet connection and try again.'
      };
    }

    // Rate limiting simulation
    if (upperVin === ERROR_TEST_VINS.RATE_LIMIT_TEST || this.requestCount > this.RATE_LIMIT_THRESHOLD) {
      return {
        success: false,
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please wait a moment before trying again.'
      };
    }

    // Server error simulation
    if (upperVin === ERROR_TEST_VINS.SERVER_ERROR_TEST) {
      return {
        success: false,
        error: 'Server error',
        message: 'VIN service is temporarily unavailable. Please try again later.'
      };
    }

    return null;
  }
}

// Export for use in tests and development
export { MOCK_VIN_DATABASE, ERROR_TEST_VINS };
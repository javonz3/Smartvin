export interface VDPVehicleData {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  engine: string;
  transmission: string;
  drivetrain: string;
  bodyStyle: string;
  fuelType: string;
  doors: number;
  cylinders: number;
  displacement: string;
  horsepower: number;
  torque: number;
  cityMpg: number;
  highwayMpg: number;
  combinedMpg: number;
  msrp: number;
  category: string;
  manufacturerCode: string;
  plantCountry: string;
  plantCompany: string;
  plantState: string;
  plantCity: string;
  // Additional VIN Data API specific fields
  htmlLink?: string;
  reportId?: string;
  reportDate?: string;
}

export interface VDPApiResponse {
  success: boolean;
  data?: VDPVehicleData;
  error?: string;
  message?: string;
}

export class VINApiService {
  private static readonly BASE_URL = '/api/vin'; // Use local API route
  
  static async decodeVIN(vin: string): Promise<VDPApiResponse> {
    if (!this.isValidVIN(vin)) {
      return {
        success: false,
        error: 'Invalid VIN format',
        message: 'VIN must be 17 characters long and contain only valid characters (no I, O, or Q)'
      };
    }

    try {
      console.log(`[VINApiService] Making VIN API request for: ${vin}`);
      
      // Use the local API route which will proxy to the external service
      const response = await fetch(`${this.BASE_URL}/${vin}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log(`[VINApiService] VIN API response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error('[VINApiService] VIN API Error Response:', errorData);
        } catch {
          // If we can't parse error response, use status text
          errorMessage = `${response.status}: ${response.statusText}`;
        }

        return {
          success: false,
          error: `API Error: ${response.status}`,
          message: errorMessage
        };
      }

      const result = await response.json();
      console.log('[VINApiService] VIN API Success Response received');
      
      // Check if the response contains vehicle data
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'API Error',
          message: result.message || 'Failed to decode VIN'
        };
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('[VINApiService] VIN API Network Error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Network error',
          message: 'Unable to connect to VIN service. Please check your internet connection.'
        };
      }

      return {
        success: false,
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Failed to connect to VIN service'
      };
    }
  }

  private static isValidVIN(vin: string): boolean {
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

  static async getVehicleSpecs(vin: string): Promise<{
    success: boolean;
    specs?: {
      engine: string;
      transmission: string;
      drivetrain: string;
      fuelEconomy: string;
      performance: string;
    };
    error?: string;
  }> {
    const result = await this.decodeVIN(vin);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to get vehicle specifications'
      };
    }

    const data = result.data;
    
    // Build comprehensive specs
    const engineSpec = data.displacement && data.cylinders 
      ? `${data.displacement} ${data.cylinders}-Cylinder`
      : data.engine || 'Engine info not available';

    const fuelEconomySpec = data.cityMpg && data.highwayMpg
      ? `${data.cityMpg}/${data.highwayMpg} MPG (City/Highway)`
      : data.combinedMpg 
        ? `${data.combinedMpg} MPG Combined`
        : 'Fuel economy not available';

    const performanceSpec = data.horsepower && data.torque
      ? `${data.horsepower} HP, ${data.torque} lb-ft`
      : data.horsepower
        ? `${data.horsepower} HP`
        : 'Performance data not available';

    return {
      success: true,
      specs: {
        engine: engineSpec,
        transmission: data.transmission || 'Transmission info not available',
        drivetrain: data.drivetrain || 'Drivetrain info not available',
        fuelEconomy: fuelEconomySpec,
        performance: performanceSpec
      }
    };
  }

  // Additional utility method for batch VIN processing (Pro feature)
  static async decodeBatchVINs(vins: string[]): Promise<{
    success: boolean;
    results?: Array<{
      vin: string;
      success: boolean;
      data?: VDPVehicleData;
      error?: string;
    }>;
    error?: string;
  }> {
    try {
      const results = await Promise.allSettled(
        vins.map(async (vin) => {
          const result = await this.decodeVIN(vin);
          return {
            vin,
            success: result.success,
            data: result.data,
            error: result.error
          };
        })
      );

      return {
        success: true,
        results: results.map(result => 
          result.status === 'fulfilled' 
            ? result.value 
            : { vin: '', success: false, error: 'Processing failed' }
        )
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Batch processing failed'
      };
    }
  }

  // Method to validate API credentials
  static async validateApiKey(): Promise<{
    valid: boolean;
    message: string;
  }> {
    try {
      console.log('[VINApiService] Validating API credentials...');
      
      // Test with a simple VIN decode request
      const testVin = 'WBANE53577CZ89123'; // BMW test VIN
      const result = await this.decodeVIN(testVin);

      if (result.success) {
        return {
          valid: true,
          message: '✅ API credentials are valid and working correctly!'
        };
      } else {
        return {
          valid: false,
          message: `❌ API validation failed: ${result.message}`
        };
      }
    } catch (error) {
      console.error('[VINApiService] API validation error:', error);
      return {
        valid: false,
        message: '❌ Unable to validate API credentials - network error'
      };
    }
  }

  // Method to get detailed vehicle report (Pro feature)
  static async getDetailedReport(vin: string): Promise<{
    success: boolean;
    reportUrl?: string;
    reportId?: string;
    error?: string;
  }> {
    const result = await this.decodeVIN(vin);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to get vehicle report'
      };
    }

    return {
      success: true,
      reportUrl: result.data.htmlLink,
      reportId: result.data.reportId
    };
  }
}
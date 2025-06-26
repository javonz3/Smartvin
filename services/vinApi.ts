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
}

export interface VDPApiResponse {
  success: boolean;
  data?: VDPVehicleData;
  error?: string;
  message?: string;
}

export class VINApiService {
  private static readonly BASE_URL = '/api/vin'; // Use local API route instead of external URL
  private static readonly API_KEY = process.env.EXPO_PUBLIC_VDP_API_KEY;

  static async decodeVIN(vin: string): Promise<VDPApiResponse> {
    if (!this.isValidVIN(vin)) {
      return {
        success: false,
        error: 'Invalid VIN format',
        message: 'VIN must be 17 characters long and contain only valid characters'
      };
    }

    try {
      // Use the local API route which will proxy to the external service
      const response = await fetch(`${this.BASE_URL}/${vin}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
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
        data: this.transformVDPData(result.data)
      };

    } catch (error) {
      console.error('VIN API Error:', error);
      
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

  private static transformVDPData(rawData: any): VDPVehicleData {
    // Transform VDP API response according to their documented structure
    return {
      vin: rawData.vin || '',
      year: parseInt(rawData.year) || 0,
      make: rawData.make || '',
      model: rawData.model || '',
      trim: rawData.trim || '',
      engine: rawData.engine || '',
      transmission: rawData.transmission || '',
      drivetrain: rawData.drivetrain || rawData.drive_type || '',
      bodyStyle: rawData.body_style || rawData.bodyStyle || '',
      fuelType: rawData.fuel_type || rawData.fuelType || '',
      doors: parseInt(rawData.doors) || 4,
      cylinders: parseInt(rawData.cylinders) || 0,
      displacement: rawData.displacement || '',
      horsepower: parseInt(rawData.horsepower) || 0,
      torque: parseInt(rawData.torque) || 0,
      cityMpg: parseInt(rawData.city_mpg) || 0,
      highwayMpg: parseInt(rawData.highway_mpg) || 0,
      combinedMpg: parseInt(rawData.combined_mpg) || 0,
      msrp: parseInt(rawData.msrp) || 0,
      category: rawData.category || '',
      manufacturerCode: rawData.manufacturer_code || '',
      plantCountry: rawData.plant_country || '',
      plantCompany: rawData.plant_company || '',
      plantState: rawData.plant_state || '',
      plantCity: rawData.plant_city || ''
    };
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

  // Method to validate API key
  static async validateApiKey(): Promise<{
    valid: boolean;
    message: string;
  }> {
    try {
      // Test with a known valid VIN
      const testVin = '1HGBH41JXMN109186'; // Honda Civic test VIN
      const response = await fetch(`${this.BASE_URL}/${testVin}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        return {
          valid: false,
          message: 'Invalid API key or insufficient permissions'
        };
      }

      if (response.status === 429) {
        return {
          valid: true,
          message: 'API key valid but rate limit exceeded'
        };
      }

      return {
        valid: response.ok,
        message: response.ok ? 'API key is valid' : `API returned status ${response.status}`
      };
    } catch (error) {
      return {
        valid: false,
        message: 'Unable to validate API key - network error'
      };
    }
  }
}
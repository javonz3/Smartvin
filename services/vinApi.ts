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
  private static readonly BASE_URL = process.env.EXPO_PUBLIC_API_URL 
    ? `${process.env.EXPO_PUBLIC_API_URL}/api/vin`
    : 'https://api.vindataproject.com/api/vin';
  private static readonly API_KEY = process.env.EXPO_PUBLIC_VDP_API_KEY;

  static async decodeVIN(vin: string): Promise<VDPApiResponse> {
    if (!this.API_KEY) {
      return {
        success: false,
        error: 'API key not configured',
        message: 'VDP API key is missing from environment variables'
      };
    }

    if (!this.isValidVIN(vin)) {
      return {
        success: false,
        error: 'Invalid VIN format',
        message: 'VIN must be 17 characters long and contain only valid characters'
      };
    }

    try {
      // Using the correct VDP API endpoint format: /api/vin/{vin}
      const response = await fetch(`${this.BASE_URL}/${vin}`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.API_KEY,
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

      const data = await response.json();
      
      // Check if the response contains vehicle data
      if (!data || (!data.vin && !data.VIN)) {
        return {
          success: false,
          error: 'Invalid response',
          message: 'No vehicle data found for this VIN'
        };
      }

      return {
        success: true,
        data: this.transformVDPData(data)
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
    // Handle both uppercase and lowercase field names from API
    const getField = (field: string) => {
      return rawData[field] || rawData[field.toLowerCase()] || rawData[field.toUpperCase()] || '';
    };

    const getNumericField = (field: string, defaultValue: number = 0) => {
      const value = getField(field);
      const parsed = parseInt(value) || parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };

    return {
      vin: getField('vin') || getField('VIN'),
      year: getNumericField('year') || getNumericField('model_year'),
      make: getField('make') || getField('manufacturer'),
      model: getField('model'),
      trim: getField('trim') || getField('trim_level'),
      engine: getField('engine') || getField('engine_description') || 
              `${getField('engine_displacement')} ${getField('engine_cylinders')}`,
      transmission: getField('transmission') || getField('transmission_type'),
      drivetrain: getField('drivetrain') || getField('drive_type') || getField('wheel_base'),
      bodyStyle: getField('body_style') || getField('bodyStyle') || getField('body_type'),
      fuelType: getField('fuel_type') || getField('fuelType') || getField('fuel'),
      doors: getNumericField('doors') || getNumericField('door_count'),
      cylinders: getNumericField('cylinders') || getNumericField('engine_cylinders'),
      displacement: getField('displacement') || getField('engine_displacement'),
      horsepower: getNumericField('horsepower') || getNumericField('engine_hp'),
      torque: getNumericField('torque') || getNumericField('engine_torque'),
      cityMpg: getNumericField('city_mpg') || getNumericField('mpg_city'),
      highwayMpg: getNumericField('highway_mpg') || getNumericField('mpg_highway'),
      combinedMpg: getNumericField('combined_mpg') || getNumericField('mpg_combined'),
      msrp: getNumericField('msrp') || getNumericField('base_price'),
      category: getField('category') || getField('vehicle_type'),
      manufacturerCode: getField('manufacturer_code') || getField('wmi'),
      plantCountry: getField('plant_country') || getField('country_of_origin'),
      plantCompany: getField('plant_company') || getField('manufacturer'),
      plantState: getField('plant_state') || getField('plant_location'),
      plantCity: getField('plant_city') || getField('assembly_plant')
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
    if (!this.API_KEY) {
      return {
        success: false,
        error: 'API key not configured'
      };
    }

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
    if (!this.API_KEY) {
      return {
        valid: false,
        message: 'API key not configured'
      };
    }

    try {
      // Test with a known valid VIN
      const testVin = '1HGBH41JXMN109186'; // Honda Civic test VIN
      const response = await fetch(`${this.BASE_URL}/${testVin}`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.API_KEY,
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
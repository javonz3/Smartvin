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
  private static readonly BASE_URL = 'https://api.vindataproject.com/api/vin';
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
      const response = await fetch(`${this.BASE_URL}/${vin}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: `API Error: ${response.status}`,
          message: errorData.message || `Failed to decode VIN: ${response.statusText}`
        };
      }

      const data = await response.json();
      
      if (!data || !data.vin) {
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
      return {
        success: false,
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Failed to connect to VIN service'
      };
    }
  }

  private static transformVDPData(rawData: any): VDPVehicleData {
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
    return {
      success: true,
      specs: {
        engine: `${data.displacement} ${data.cylinders}-Cylinder ${data.fuelType}`,
        transmission: data.transmission,
        drivetrain: data.drivetrain,
        fuelEconomy: `${data.cityMpg}/${data.highwayMpg} MPG (City/Highway)`,
        performance: `${data.horsepower} HP, ${data.torque} lb-ft`
      }
    };
  }
}
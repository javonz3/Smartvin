import { VDPVehicleData } from './vinApi';

export interface ValuationRequest {
  vehicleData: VDPVehicleData;
  mileage: number;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  accidentHistory: 'None' | 'Minor' | 'Moderate' | 'Severe';
  zipCode?: string;
}

export interface ValuationResponse {
  wholesale: number;
  tradeIn: number;
  retail: number;
  bhph: number;
  aiInsight: string;
  marketTrend: 'up' | 'down' | 'stable';
  confidence: number;
  factors: {
    mileageImpact: number;
    conditionImpact: number;
    accidentImpact: number;
    marketDemand: string;
    regionalFactors?: string;
  };
}

export class ValuationService {
  private static readonly OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  private static readonly OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
  private static readonly MODELS = ['gpt-4', 'gpt-3.5-turbo'];

  static async getValuation(request: ValuationRequest): Promise<{
    success: boolean;
    data?: ValuationResponse;
    error?: string;
  }> {
    if (!this.OPENAI_API_KEY) {
      return {
        success: false,
        error: 'OpenAI API key not configured'
      };
    }

    try {
      const prompt = this.buildValuationPrompt(request);
      
      // Try each model in order until one works
      for (const model of this.MODELS) {
        try {
          const response = await fetch(this.OPENAI_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: model,
              messages: [
                {
                  role: 'system',
                  content: 'You are an expert automotive appraiser with 20+ years of experience in vehicle valuation for dealers, auctions, and BHPH lots. Provide accurate, market-based valuations with detailed insights.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.3,
              max_tokens: 1000
            })
          });

          if (response.ok) {
            const data = await response.json();
            const aiResponse = data.choices[0]?.message?.content;

            if (!aiResponse) {
              throw new Error('No response from AI service');
            }

            return {
              success: true,
              data: this.parseAIResponse(aiResponse, request)
            };
          } else if (response.status === 404) {
            // Model not available, try next model
            console.warn(`Model ${model} not available (404), trying next model...`);
            continue;
          } else {
            throw new Error(`OpenAI API error: ${response.status}`);
          }
        } catch (error) {
          // If this is the last model and it failed, throw the error
          if (model === this.MODELS[this.MODELS.length - 1]) {
            throw error;
          }
          // Otherwise, try the next model
          console.warn(`Model ${model} failed, trying next model...`, error);
          continue;
        }
      }

      // If all models failed, fall back to local calculation
      throw new Error('All OpenAI models unavailable');

    } catch (error) {
      console.error('Valuation API Error:', error);
      
      // Return fallback valuation when API fails
      const fallbackData = this.calculateFallbackValuation(request);
      
      return {
        success: true,
        data: {
          wholesale: fallbackData.wholesale,
          tradeIn: fallbackData.tradeIn,
          retail: fallbackData.retail,
          bhph: fallbackData.bhph,
          confidence: 60,
          marketTrend: 'stable' as const,
          aiInsight: 'Valuation calculated using standard depreciation models. AI-powered insights are temporarily unavailable.',
          factors: {
            mileageImpact: -10,
            conditionImpact: request.condition === 'Excellent' ? 5 : request.condition === 'Good' ? 0 : -15,
            accidentImpact: request.accidentHistory === 'None' ? 0 : -20,
            marketDemand: 'Medium'
          }
        }
      };
    }
  }

  private static buildValuationPrompt(request: ValuationRequest): string {
    const { vehicleData, mileage, condition, accidentHistory, zipCode } = request;
    
    return `
Please provide a comprehensive valuation for the following vehicle:

VEHICLE DETAILS:
- VIN: ${vehicleData.vin}
- Year: ${vehicleData.year}
- Make: ${vehicleData.make}
- Model: ${vehicleData.model}
- Trim: ${vehicleData.trim}
- Engine: ${vehicleData.engine}
- Transmission: ${vehicleData.transmission}
- Drivetrain: ${vehicleData.drivetrain}
- Body Style: ${vehicleData.bodyStyle}
- Fuel Type: ${vehicleData.fuelType}
- Original MSRP: $${vehicleData.msrp}

CURRENT CONDITION:
- Mileage: ${mileage.toLocaleString()} miles
- Condition: ${condition}
- Accident History: ${accidentHistory}
${zipCode ? `- Location: ZIP ${zipCode}` : ''}

Please provide your response in the following JSON format:
{
  "wholesale": [wholesale value in dollars],
  "tradeIn": [trade-in value in dollars],
  "retail": [retail value in dollars],
  "bhph": [buy-here-pay-here value in dollars],
  "confidence": [confidence percentage 1-100],
  "marketTrend": "[up/down/stable]",
  "aiInsight": "[detailed 2-3 sentence analysis of the vehicle's market position, value factors, and recommendations]",
  "factors": {
    "mileageImpact": [percentage impact of mileage on value, can be negative],
    "conditionImpact": [percentage impact of condition on value, can be negative],
    "accidentImpact": [percentage impact of accident history on value, can be negative],
    "marketDemand": "[High/Medium/Low demand description]",
    "regionalFactors": "[regional market insights if ZIP provided]"
  }
}

Consider current market conditions, seasonal factors, and typical depreciation patterns for this vehicle type.
`;
  }

  private static parseAIResponse(aiResponse: string, request: ValuationRequest): ValuationResponse {
    try {
      // Extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and provide defaults
      return {
        wholesale: Math.round(parsed.wholesale || 0),
        tradeIn: Math.round(parsed.tradeIn || 0),
        retail: Math.round(parsed.retail || 0),
        bhph: Math.round(parsed.bhph || 0),
        confidence: Math.min(100, Math.max(0, parsed.confidence || 85)),
        marketTrend: ['up', 'down', 'stable'].includes(parsed.marketTrend) ? parsed.marketTrend : 'stable',
        aiInsight: parsed.aiInsight || 'Vehicle valuation completed based on current market conditions.',
        factors: {
          mileageImpact: parsed.factors?.mileageImpact || 0,
          conditionImpact: parsed.factors?.conditionImpact || 0,
          accidentImpact: parsed.factors?.accidentImpact || 0,
          marketDemand: parsed.factors?.marketDemand || 'Medium',
          regionalFactors: parsed.factors?.regionalFactors
        }
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      
      // Fallback valuation based on MSRP and basic depreciation
      const baseValue = this.calculateFallbackValuation(request);
      
      return {
        wholesale: baseValue.wholesale,
        tradeIn: baseValue.tradeIn,
        retail: baseValue.retail,
        bhph: baseValue.bhph,
        confidence: 60,
        marketTrend: 'stable',
        aiInsight: 'Valuation calculated using standard depreciation models. For more accurate pricing, please ensure API keys are properly configured.',
        factors: {
          mileageImpact: -10,
          conditionImpact: request.condition === 'Excellent' ? 5 : request.condition === 'Good' ? 0 : -15,
          accidentImpact: request.accidentHistory === 'None' ? 0 : -20,
          marketDemand: 'Medium'
        }
      };
    }
  }

  private static calculateFallbackValuation(request: ValuationRequest): {
    wholesale: number;
    tradeIn: number;
    retail: number;
    bhph: number;
  } {
    const { vehicleData, mileage, condition, accidentHistory } = request;
    const currentYear = new Date().getFullYear();
    const age = currentYear - vehicleData.year;
    
    // Basic depreciation calculation
    let baseValue = vehicleData.msrp || 25000; // Default if MSRP not available
    
    // Age depreciation (15% first year, 10% subsequent years)
    if (age > 0) {
      baseValue *= 0.85; // First year
      baseValue *= Math.pow(0.90, age - 1); // Subsequent years
    }
    
    // Mileage adjustment (average 12k miles/year)
    const expectedMileage = age * 12000;
    const mileageDiff = mileage - expectedMileage;
    const mileageAdjustment = mileageDiff * -0.10; // $0.10 per excess mile
    baseValue += mileageAdjustment;
    
    // Condition adjustment
    const conditionMultipliers = {
      'Excellent': 1.1,
      'Good': 1.0,
      'Fair': 0.85,
      'Poor': 0.70
    };
    baseValue *= conditionMultipliers[condition];
    
    // Accident history adjustment
    const accidentMultipliers = {
      'None': 1.0,
      'Minor': 0.95,
      'Moderate': 0.85,
      'Severe': 0.70
    };
    baseValue *= accidentMultipliers[accidentHistory];
    
    // Calculate different market values
    const wholesale = Math.round(baseValue * 0.75);
    const tradeIn = Math.round(baseValue * 0.80);
    const retail = Math.round(baseValue * 1.15);
    const bhph = Math.round(baseValue * 1.25);
    
    return { wholesale, tradeIn, retail, bhph };
  }
}
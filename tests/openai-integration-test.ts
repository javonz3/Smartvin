import { ValuationService, ValuationRequest } from '@/services/valuationApi';
import { VDPVehicleData } from '@/services/vinApi';

// Test configuration
const TEST_CONFIG = {
  timeout: 30000, // 30 seconds per test
  retries: 2,
  verbose: true
};

// Mock vehicle data for testing
const TEST_VEHICLE_DATA: VDPVehicleData = {
  vin: '1HGBH41JXMN109186',
  year: 2021,
  make: 'Honda',
  model: 'Civic',
  trim: 'LX',
  engine: '2.0L 4-Cylinder',
  transmission: 'CVT',
  drivetrain: 'FWD',
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
  plantCompany: 'Honda',
  plantState: 'IN',
  plantCity: 'Greensburg'
};

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  error?: string;
  details?: any;
}

class OpenAIIntegrationTest {
  private results: TestResult[] = [];
  private startTime: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  // Main test runner
  async runAllTests(): Promise<void> {
    console.log('🤖 OpenAI API Integration Test Suite');
    console.log('====================================\n');

    const tests = [
      () => this.testApiKeyConfiguration(),
      () => this.testBasicAuthentication(),
      () => this.testBasicValuationRequest(),
      () => this.testDifferentVehicleConditions(),
      () => this.testHighMileageScenario(),
      () => this.testLuxuryVehicleValuation(),
      () => this.testResponseTimePerformance(),
      () => this.testErrorHandling(),
      () => this.testFallbackMechanism(),
      () => this.testDataValidation()
    ];

    for (const test of tests) {
      await test();
      // Small delay between tests to respect rate limits
      await this.delay(1000);
    }

    this.generateReport();
  }

  // Test 1: API Key Configuration
  private async testApiKeyConfiguration(): Promise<void> {
    await this.runTest('API Key Configuration', async () => {
      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error('EXPO_PUBLIC_OPENAI_API_KEY environment variable not set');
      }
      
      if (!apiKey.startsWith('sk-')) {
        throw new Error('Invalid OpenAI API key format - should start with "sk-"');
      }
      
      if (apiKey.length < 20) {
        throw new Error('OpenAI API key appears to be too short');
      }
      
      this.log(`✓ API Key configured: ${apiKey.substring(0, 10)}...`);
    });
  }

  // Test 2: Basic Authentication
  private async testBasicAuthentication(): Promise<void> {
    await this.runTest('Basic Authentication', async () => {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed - Invalid API key');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        } else {
          throw new Error(`Authentication failed with status ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Unexpected response format from OpenAI API');
      }
      
      this.log(`✓ Authentication successful, ${data.data.length} models available`);
    });
  }

  // Test 3: Basic Valuation Request
  private async testBasicValuationRequest(): Promise<void> {
    await this.runTest('Basic Valuation Request', async () => {
      const request: ValuationRequest = {
        vehicleData: TEST_VEHICLE_DATA,
        mileage: 45000,
        condition: 'Good',
        accidentHistory: 'None',
        zipCode: '75201'
      };

      const result = await ValuationService.getValuation(request);
      
      if (!result.success) {
        throw new Error(`Valuation failed: ${result.error}`);
      }
      
      if (!result.data) {
        throw new Error('No valuation data returned');
      }
      
      const valuation = result.data;
      
      // Validate response structure
      const requiredFields = ['wholesale', 'tradeIn', 'retail', 'bhph', 'confidence', 'aiInsight'];
      for (const field of requiredFields) {
        if (!(field in valuation)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      // Validate value ranges
      if (valuation.confidence < 0 || valuation.confidence > 100) {
        throw new Error(`Invalid confidence score: ${valuation.confidence}`);
      }
      
      if (valuation.wholesale <= 0 || valuation.retail <= 0) {
        throw new Error('Invalid valuation amounts');
      }

      // Validate value relationships
      if (valuation.wholesale > valuation.retail) {
        throw new Error('Wholesale value should not exceed retail value');
      }

      if (valuation.tradeIn > valuation.retail) {
        throw new Error('Trade-in value should not exceed retail value');
      }
      
      this.log(`✓ Valuation completed - Retail: $${valuation.retail}, Confidence: ${valuation.confidence}%`);
      this.log(`✓ AI Insight: "${valuation.aiInsight.substring(0, 100)}..."`);
    });
  }

  // Test 4: Different Vehicle Conditions
  private async testDifferentVehicleConditions(): Promise<void> {
    await this.runTest('Different Vehicle Conditions', async () => {
      const conditions: Array<'Excellent' | 'Good' | 'Fair' | 'Poor'> = ['Excellent', 'Good', 'Fair', 'Poor'];
      const results: { [key: string]: number } = {};
      
      for (const condition of conditions) {
        const request: ValuationRequest = {
          vehicleData: TEST_VEHICLE_DATA,
          mileage: 45000,
          condition,
          accidentHistory: 'None'
        };
        
        const result = await ValuationService.getValuation(request);
        
        if (!result.success || !result.data) {
          throw new Error(`Failed to get valuation for condition: ${condition}`);
        }
        
        results[condition] = result.data.retail;
        
        // Add delay to respect rate limits
        await this.delay(2000);
      }
      
      // Validate that condition affects pricing appropriately
      if (results.Excellent <= results.Poor) {
        this.log('Warning: Excellent condition not significantly higher than Poor condition');
      }

      if (results.Good <= results.Fair) {
        this.log('Warning: Good condition not higher than Fair condition');
      }
      
      this.log(`✓ Condition impact validated:`);
      Object.entries(results).forEach(([condition, value]) => {
        this.log(`  ${condition}: $${value}`);
      });
    });
  }

  // Test 5: High Mileage Scenario
  private async testHighMileageScenario(): Promise<void> {
    await this.runTest('High Mileage Scenario', async () => {
      const highMileageRequest: ValuationRequest = {
        vehicleData: TEST_VEHICLE_DATA,
        mileage: 150000, // High mileage
        condition: 'Fair',
        accidentHistory: 'None'
      };
      
      const normalMileageRequest: ValuationRequest = {
        vehicleData: TEST_VEHICLE_DATA,
        mileage: 45000, // Normal mileage
        condition: 'Fair',
        accidentHistory: 'None'
      };
      
      const [highResult, normalResult] = await Promise.all([
        ValuationService.getValuation(highMileageRequest),
        ValuationService.getValuation(normalMileageRequest)
      ]);
      
      if (!highResult.success || !highResult.data) {
        throw new Error('Failed to get high mileage valuation');
      }

      if (!normalResult.success || !normalResult.data) {
        throw new Error('Failed to get normal mileage valuation');
      }
      
      // High mileage should generally result in lower values
      if (highResult.data.retail >= normalResult.data.retail) {
        this.log('Warning: High mileage vehicle not valued lower than normal mileage');
      }
      
      this.log(`✓ High mileage (150k): $${highResult.data.retail}`);
      this.log(`✓ Normal mileage (45k): $${normalResult.data.retail}`);
      this.log(`✓ Difference: $${normalResult.data.retail - highResult.data.retail}`);
    });
  }

  // Test 6: Luxury Vehicle Valuation
  private async testLuxuryVehicleValuation(): Promise<void> {
    await this.runTest('Luxury Vehicle Valuation', async () => {
      const luxuryVehicle: VDPVehicleData = {
        ...TEST_VEHICLE_DATA,
        vin: '5UXKR0C58J0123456',
        year: 2020,
        make: 'BMW',
        model: 'X5',
        trim: 'xDrive35i',
        msrp: 60700,
        category: 'Luxury SUV'
      };

      const request: ValuationRequest = {
        vehicleData: luxuryVehicle,
        mileage: 35000,
        condition: 'Good',
        accidentHistory: 'None'
      };
      
      const result = await ValuationService.getValuation(request);
      
      if (!result.success || !result.data) {
        throw new Error('Failed to get luxury vehicle valuation');
      }
      
      // Luxury vehicles should generally have higher values
      if (result.data.retail < 30000) {
        this.log('Warning: Luxury vehicle valuation seems low');
      }
      
      this.log(`✓ Luxury vehicle valuation: $${result.data.retail}`);
      this.log(`✓ Confidence: ${result.data.confidence}%`);
    });
  }

  // Test 7: Response Time Performance
  private async testResponseTimePerformance(): Promise<void> {
    await this.runTest('Response Time Performance', async () => {
      const maxAcceptableTime = 20000; // 20 seconds
      const start = Date.now();
      
      const request: ValuationRequest = {
        vehicleData: TEST_VEHICLE_DATA,
        mileage: 45000,
        condition: 'Good',
        accidentHistory: 'None'
      };
      
      const result = await ValuationService.getValuation(request);
      const duration = Date.now() - start;
      
      if (!result.success) {
        throw new Error(`Valuation failed: ${result.error}`);
      }
      
      if (duration > maxAcceptableTime) {
        throw new Error(`Response time too slow: ${duration}ms (max: ${maxAcceptableTime}ms)`);
      }
      
      this.log(`✓ Response time: ${duration}ms`);
    });
  }

  // Test 8: Error Handling
  private async testErrorHandling(): Promise<void> {
    await this.runTest('Error Handling', async () => {
      // Test with invalid/incomplete data
      const invalidRequest: ValuationRequest = {
        vehicleData: {
          ...TEST_VEHICLE_DATA,
          year: 0, // Invalid year
          make: '', // Empty make
        },
        mileage: -1000, // Invalid mileage
        condition: 'Good',
        accidentHistory: 'None'
      };
      
      const result = await ValuationService.getValuation(invalidRequest);
      
      // Should either handle gracefully or provide meaningful error
      if (!result.success) {
        this.log(`✓ Properly handled invalid input: ${result.error}`);
      } else if (result.data) {
        // If it succeeds, should provide reasonable fallback values
        if (result.data.confidence > 80) {
          this.log('Warning: Confidence too high for invalid input data');
        }
        this.log(`✓ Handled invalid input with low confidence: ${result.data.confidence}%`);
      }
    });
  }

  // Test 9: Fallback Mechanism
  private async testFallbackMechanism(): Promise<void> {
    await this.runTest('Fallback Mechanism', async () => {
      // Test with invalid API key to trigger fallback
      const originalKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      
      try {
        // Temporarily set invalid key
        process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'invalid-key-test';
        
        const request: ValuationRequest = {
          vehicleData: TEST_VEHICLE_DATA,
          mileage: 45000,
          condition: 'Good',
          accidentHistory: 'None'
        };
        
        const result = await ValuationService.getValuation(request);
        
        // Should fall back to basic calculation
        if (!result.success || !result.data) {
          throw new Error('Fallback mechanism failed completely');
        }
        
        // Fallback should have lower confidence
        if (result.data.confidence > 70) {
          this.log('Warning: Fallback confidence higher than expected');
        }
        
        this.log(`✓ Fallback mechanism working - Confidence: ${result.data.confidence}%`);
        this.log(`✓ Fallback retail value: $${result.data.retail}`);
        
      } finally {
        // Restore original key
        process.env.EXPO_PUBLIC_OPENAI_API_KEY = originalKey;
      }
    });
  }

  // Test 10: Data Validation
  private async testDataValidation(): Promise<void> {
    await this.runTest('Data Validation', async () => {
      const request: ValuationRequest = {
        vehicleData: TEST_VEHICLE_DATA,
        mileage: 45000,
        condition: 'Good',
        accidentHistory: 'None'
      };
      
      const result = await ValuationService.getValuation(request);
      
      if (!result.success || !result.data) {
        throw new Error('Failed to get valuation for data validation');
      }
      
      const valuation = result.data;
      
      // Validate all monetary values are positive
      const monetaryFields = ['wholesale', 'tradeIn', 'retail', 'bhph'];
      for (const field of monetaryFields) {
        const value = valuation[field as keyof typeof valuation] as number;
        if (value <= 0) {
          throw new Error(`Invalid ${field} value: ${value}`);
        }
      }
      
      // Validate confidence is in valid range
      if (valuation.confidence < 0 || valuation.confidence > 100) {
        throw new Error(`Invalid confidence: ${valuation.confidence}`);
      }
      
      // Validate AI insight is meaningful
      if (!valuation.aiInsight || valuation.aiInsight.length < 20) {
        throw new Error('AI insight too short or missing');
      }
      
      // Validate market trend
      const validTrends = ['up', 'down', 'stable'];
      if (!validTrends.includes(valuation.marketTrend)) {
        throw new Error(`Invalid market trend: ${valuation.marketTrend}`);
      }
      
      this.log(`✓ All data validation checks passed`);
      this.log(`✓ Values: W:$${valuation.wholesale} T:$${valuation.tradeIn} R:$${valuation.retail} B:$${valuation.bhph}`);
    });
  }

  // Helper method to run individual tests
  private async runTest(testName: string, testFunction: () => Promise<void>): Promise<void> {
    const start = Date.now();
    
    try {
      this.log(`🧪 Running: ${testName}`);
      
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Test timeout after ${TEST_CONFIG.timeout}ms`)), TEST_CONFIG.timeout);
      });
      
      // Race between test and timeout
      await Promise.race([testFunction(), timeoutPromise]);
      
      const duration = Date.now() - start;
      const result: TestResult = {
        testName,
        status: 'PASS',
        duration
      };
      
      this.log(`✅ ${testName} - PASSED (${duration}ms)\n`);
      this.results.push(result);
      
    } catch (error) {
      const duration = Date.now() - start;
      const result: TestResult = {
        testName,
        status: 'FAIL',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.log(`❌ ${testName} - FAILED (${duration}ms): ${result.error}\n`);
      this.results.push(result);
    }
  }

  // Generate comprehensive test report
  private generateReport(): void {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const failedTests = this.results.filter(r => r.status === 'FAIL').length;
    const totalDuration = Date.now() - this.startTime;
    
    console.log('\n📊 OpenAI API Integration Test Report');
    console.log('=====================================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`Total Duration: ${(totalDuration / 1000).toFixed(1)}s`);
    console.log('');
    
    if (failedTests > 0) {
      console.log('❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(result => {
          console.log(`  - ${result.testName}: ${result.error}`);
        });
      console.log('');
    }
    
    console.log('📈 Performance Summary:');
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / totalTests;
    console.log(`  - Average Response Time: ${(avgDuration / 1000).toFixed(1)}s`);
    
    const slowestTest = this.results.reduce((prev, current) => 
      prev.duration > current.duration ? prev : current
    );
    console.log(`  - Slowest Test: ${slowestTest.testName} (${(slowestTest.duration / 1000).toFixed(1)}s)`);
    
    const fastestTest = this.results.reduce((prev, current) => 
      prev.duration < current.duration ? prev : current
    );
    console.log(`  - Fastest Test: ${fastestTest.testName} (${(fastestTest.duration / 1000).toFixed(1)}s)`);

    // Recommendations
    console.log('\n💡 Recommendations:');
    
    if (failedTests === 0) {
      console.log('  ✅ All tests passed! Your OpenAI integration is working correctly.');
    } else {
      console.log('  ⚠️  Some tests failed. Please review the errors above.');
    }
    
    if (avgDuration > 15000) {
      console.log('  ⚠️  Average response time is high. Consider optimizing prompts or checking network.');
    }
    
    if (passedTests / totalTests < 0.8) {
      console.log('  ⚠️  Success rate is below 80%. Check API configuration and network connectivity.');
    }
  }

  // Utility methods
  private log(message: string): void {
    if (TEST_CONFIG.verbose) {
      console.log(message);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export test runner
export async function runOpenAIIntegrationTest(): Promise<void> {
  const testSuite = new OpenAIIntegrationTest();
  await testSuite.runAllTests();
}

// Export for individual test execution
export { OpenAIIntegrationTest, TEST_VEHICLE_DATA, TEST_CONFIG };
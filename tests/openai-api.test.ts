import { ValuationService, ValuationRequest, ValuationResponse } from '@/services/valuationApi';
import { VDPVehicleData } from '@/services/vinApi';

// Mock test data
const mockVehicleData: VDPVehicleData = {
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

const mockValuationRequest: ValuationRequest = {
  vehicleData: mockVehicleData,
  mileage: 45000,
  condition: 'Good',
  accidentHistory: 'None',
  zipCode: '75201'
};

// Test configuration
interface TestConfig {
  timeout: number;
  retries: number;
  rateLimit: {
    requestsPerMinute: number;
    burstLimit: number;
  };
}

const testConfig: TestConfig = {
  timeout: 30000, // 30 seconds
  retries: 3,
  rateLimit: {
    requestsPerMinute: 60,
    burstLimit: 10
  }
};

// Test results interface
interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  error?: string;
  details?: any;
}

class OpenAITestSuite {
  private results: TestResult[] = [];
  private startTime: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  private async runTest(
    testName: string,
    testFunction: () => Promise<void>,
    timeout: number = testConfig.timeout
  ): Promise<TestResult> {
    const start = Date.now();
    
    try {
      console.log(`🧪 Running test: ${testName}`);
      
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Test timeout after ${timeout}ms`)), timeout);
      });
      
      // Race between test and timeout
      await Promise.race([testFunction(), timeoutPromise]);
      
      const duration = Date.now() - start;
      const result: TestResult = {
        testName,
        status: 'PASS',
        duration
      };
      
      console.log(`✅ ${testName} - PASSED (${duration}ms)`);
      this.results.push(result);
      return result;
      
    } catch (error) {
      const duration = Date.now() - start;
      const result: TestResult = {
        testName,
        status: 'FAIL',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      console.log(`❌ ${testName} - FAILED (${duration}ms): ${result.error}`);
      this.results.push(result);
      return result;
    }
  }

  // Test 1: API Key Configuration
  async testApiKeyConfiguration(): Promise<TestResult> {
    return this.runTest('API Key Configuration', async () => {
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
      
      console.log(`API Key configured: ${apiKey.substring(0, 10)}...`);
    });
  }

  // Test 2: Basic Authentication
  async testBasicAuthentication(): Promise<TestResult> {
    return this.runTest('Basic Authentication', async () => {
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
      
      console.log(`Available models: ${data.data.length}`);
    });
  }

  // Test 3: Model Availability
  async testModelAvailability(): Promise<TestResult> {
    return this.runTest('Model Availability', async () => {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      const models = data.data.map((model: any) => model.id);
      
      const requiredModels = ['gpt-4', 'gpt-3.5-turbo'];
      const availableModels = requiredModels.filter(model => models.includes(model));
      
      if (availableModels.length === 0) {
        throw new Error(`None of the required models (${requiredModels.join(', ')}) are available`);
      }
      
      console.log(`Available required models: ${availableModels.join(', ')}`);
    });
  }

  // Test 4: Basic Valuation Request
  async testBasicValuationRequest(): Promise<TestResult> {
    return this.runTest('Basic Valuation Request', async () => {
      const result = await ValuationService.getValuation(mockValuationRequest);
      
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
      
      console.log(`Valuation completed - Retail: $${valuation.retail}, Confidence: ${valuation.confidence}%`);
    });
  }

  // Test 5: Different Vehicle Conditions
  async testDifferentConditions(): Promise<TestResult> {
    return this.runTest('Different Vehicle Conditions', async () => {
      const conditions: Array<'Excellent' | 'Good' | 'Fair' | 'Poor'> = ['Excellent', 'Good', 'Fair', 'Poor'];
      const results: { [key: string]: number } = {};
      
      for (const condition of conditions) {
        const request = { ...mockValuationRequest, condition };
        const result = await ValuationService.getValuation(request);
        
        if (!result.success || !result.data) {
          throw new Error(`Failed to get valuation for condition: ${condition}`);
        }
        
        results[condition] = result.data.retail;
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Validate that condition affects pricing (Excellent should be higher than Poor)
      if (results.Excellent <= results.Poor) {
        throw new Error('Vehicle condition does not properly affect valuation');
      }
      
      console.log('Condition impact validated:', results);
    });
  }

  // Test 6: High Mileage Edge Case
  async testHighMileageEdgeCase(): Promise<TestResult> {
    return this.runTest('High Mileage Edge Case', async () => {
      const highMileageRequest = {
        ...mockValuationRequest,
        mileage: 250000 // Very high mileage
      };
      
      const result = await ValuationService.getValuation(highMileageRequest);
      
      if (!result.success || !result.data) {
        throw new Error('Failed to handle high mileage vehicle');
      }
      
      // High mileage should result in lower values
      if (result.data.retail > 30000) {
        throw new Error('High mileage vehicle valuation seems unrealistic');
      }
      
      console.log(`High mileage valuation: $${result.data.retail}`);
    });
  }

  // Test 7: Invalid Input Handling
  async testInvalidInputHandling(): Promise<TestResult> {
    return this.runTest('Invalid Input Handling', async () => {
      // Test with missing required fields
      const invalidRequest = {
        ...mockValuationRequest,
        vehicleData: {
          ...mockValuationRequest.vehicleData,
          year: 0, // Invalid year
          make: '', // Empty make
        }
      };
      
      const result = await ValuationService.getValuation(invalidRequest);
      
      // Should either handle gracefully or provide meaningful error
      if (!result.success) {
        console.log(`Properly handled invalid input: ${result.error}`);
      } else if (result.data) {
        // If it succeeds, should provide reasonable fallback values
        if (result.data.confidence > 70) {
          throw new Error('Confidence too high for invalid input data');
        }
        console.log(`Handled invalid input with low confidence: ${result.data.confidence}%`);
      }
    });
  }

  // Test 8: Response Time Performance
  async testResponseTimePerformance(): Promise<TestResult> {
    return this.runTest('Response Time Performance', async () => {
      const maxAcceptableTime = 15000; // 15 seconds
      const start = Date.now();
      
      const result = await ValuationService.getValuation(mockValuationRequest);
      const duration = Date.now() - start;
      
      if (!result.success) {
        throw new Error(`Valuation failed: ${result.error}`);
      }
      
      if (duration > maxAcceptableTime) {
        throw new Error(`Response time too slow: ${duration}ms (max: ${maxAcceptableTime}ms)`);
      }
      
      console.log(`Response time: ${duration}ms`);
    });
  }

  // Test 9: Rate Limiting Behavior
  async testRateLimitingBehavior(): Promise<TestResult> {
    return this.runTest('Rate Limiting Behavior', async () => {
      const requests = [];
      const maxConcurrent = 3;
      
      // Make multiple concurrent requests
      for (let i = 0; i < maxConcurrent; i++) {
        requests.push(ValuationService.getValuation(mockValuationRequest));
      }
      
      const results = await Promise.allSettled(requests);
      
      let successCount = 0;
      let rateLimitCount = 0;
      
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.success) {
          successCount++;
        } else if (result.status === 'rejected' || 
                   (result.status === 'fulfilled' && result.value.error?.includes('rate limit'))) {
          rateLimitCount++;
        }
      }
      
      console.log(`Concurrent requests - Success: ${successCount}, Rate limited: ${rateLimitCount}`);
      
      // At least some requests should succeed
      if (successCount === 0) {
        throw new Error('All concurrent requests failed');
      }
    });
  }

  // Test 10: Token Usage Monitoring
  async testTokenUsageMonitoring(): Promise<TestResult> {
    return this.runTest('Token Usage Monitoring', async () => {
      // This test would ideally check token usage from OpenAI headers
      // For now, we'll validate that the prompt is reasonable in length
      
      const result = await ValuationService.getValuation(mockValuationRequest);
      
      if (!result.success || !result.data) {
        throw new Error('Failed to get valuation for token monitoring');
      }
      
      // Check that AI insight is reasonable length (not too short or too long)
      const insightLength = result.data.aiInsight.length;
      
      if (insightLength < 50) {
        throw new Error('AI insight too short - may indicate token issues');
      }
      
      if (insightLength > 1000) {
        throw new Error('AI insight too long - may indicate excessive token usage');
      }
      
      console.log(`AI insight length: ${insightLength} characters`);
    });
  }

  // Test 11: Error Recovery and Retries
  async testErrorRecoveryAndRetries(): Promise<TestResult> {
    return this.runTest('Error Recovery and Retries', async () => {
      // Test with a request that might fail initially
      let attempts = 0;
      let lastError: string | undefined;
      
      for (let i = 0; i < testConfig.retries; i++) {
        attempts++;
        
        try {
          const result = await ValuationService.getValuation(mockValuationRequest);
          
          if (result.success) {
            console.log(`Succeeded on attempt ${attempts}`);
            return;
          } else {
            lastError = result.error;
          }
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'Unknown error';
        }
        
        // Wait before retry
        if (i < testConfig.retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      throw new Error(`Failed after ${attempts} attempts. Last error: ${lastError}`);
    });
  }

  // Test 12: Fallback Mechanism
  async testFallbackMechanism(): Promise<TestResult> {
    return this.runTest('Fallback Mechanism', async () => {
      // Test with invalid API key to trigger fallback
      const originalKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      
      try {
        // Temporarily set invalid key
        process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'invalid-key';
        
        const result = await ValuationService.getValuation(mockValuationRequest);
        
        // Should fall back to basic calculation
        if (!result.success || !result.data) {
          throw new Error('Fallback mechanism failed');
        }
        
        // Fallback should have lower confidence
        if (result.data.confidence > 70) {
          throw new Error('Fallback confidence too high');
        }
        
        console.log(`Fallback mechanism working - Confidence: ${result.data.confidence}%`);
        
      } finally {
        // Restore original key
        process.env.EXPO_PUBLIC_OPENAI_API_KEY = originalKey;
      }
    });
  }

  // Run all tests
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting OpenAI API Test Suite...\n');
    
    const tests = [
      () => this.testApiKeyConfiguration(),
      () => this.testBasicAuthentication(),
      () => this.testModelAvailability(),
      () => this.testBasicValuationRequest(),
      () => this.testDifferentConditions(),
      () => this.testHighMileageEdgeCase(),
      () => this.testInvalidInputHandling(),
      () => this.testResponseTimePerformance(),
      () => this.testRateLimitingBehavior(),
      () => this.testTokenUsageMonitoring(),
      () => this.testErrorRecoveryAndRetries(),
      () => this.testFallbackMechanism()
    ];
    
    for (const test of tests) {
      await test();
      // Add delay between tests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    this.generateReport();
  }

  // Generate test report
  private generateReport(): void {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const failedTests = this.results.filter(r => r.status === 'FAIL').length;
    const totalDuration = Date.now() - this.startTime;
    
    console.log('\n📊 OpenAI API Test Suite Report');
    console.log('================================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`Total Duration: ${totalDuration}ms`);
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
    console.log(`  - Average Response Time: ${avgDuration.toFixed(0)}ms`);
    
    const slowestTest = this.results.reduce((prev, current) => 
      prev.duration > current.duration ? prev : current
    );
    console.log(`  - Slowest Test: ${slowestTest.testName} (${slowestTest.duration}ms)`);
    
    const fastestTest = this.results.reduce((prev, current) => 
      prev.duration < current.duration ? prev : current
    );
    console.log(`  - Fastest Test: ${fastestTest.testName} (${fastestTest.duration}ms)`);
  }
}

// Export test runner
export async function runOpenAITests(): Promise<void> {
  const testSuite = new OpenAITestSuite();
  await testSuite.runAllTests();
}

// Export individual test functions for selective testing
export {
  OpenAITestSuite,
  mockVehicleData,
  mockValuationRequest,
  testConfig
};
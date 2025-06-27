# SmartVIN Test Suite

This directory contains comprehensive test suites for the SmartVIN application, focusing on API integrations and core functionality.

## Test Suites

### OpenAI API Test Suite (`openai-api.test.ts`)

Comprehensive testing for the OpenAI integration used in vehicle valuations.

#### Test Categories

1. **Configuration Tests**
   - API key validation
   - Environment variable checks
   - Key format verification

2. **Authentication Tests**
   - Basic authentication flow
   - Token validation
   - Error handling for invalid credentials

3. **Model Availability Tests**
   - Check available models
   - Verify required models (GPT-4, GPT-3.5-turbo)
   - Model access permissions

4. **Functional Tests**
   - Basic valuation requests
   - Different vehicle conditions
   - Edge cases (high mileage, old vehicles)
   - Invalid input handling

5. **Performance Tests**
   - Response time monitoring
   - Rate limiting behavior
   - Concurrent request handling
   - Token usage optimization

6. **Reliability Tests**
   - Error recovery mechanisms
   - Retry logic validation
   - Fallback system testing
   - Network failure handling

## Running Tests

### Prerequisites

1. **Environment Setup**
   ```bash
   # Ensure your .env file contains:
   EXPO_PUBLIC_OPENAI_API_KEY=sk-your_openai_api_key_here
   ```

2. **Dependencies**
   ```bash
   npm install
   ```

### Running All Tests

```bash
# Run complete test suite
npm run test

# Or using the test runner directly
npx ts-node tests/test-runner.ts
```

### Running Specific Test Suites

```bash
# OpenAI API tests only
npx ts-node tests/test-runner.ts --openai-only

# Individual test file
npx ts-node tests/openai-api.test.ts
```

### Running Tests in Development

```bash
# Watch mode for continuous testing
npm run test:watch

# Debug mode with verbose output
npm run test:debug
```

## Test Configuration

### Timeouts and Limits

```typescript
const testConfig = {
  timeout: 30000,        // 30 second timeout per test
  retries: 3,            // Retry failed tests 3 times
  rateLimit: {
    requestsPerMinute: 60,  // OpenAI rate limit
    burstLimit: 10          // Concurrent request limit
  }
};
```

### Mock Data

Tests use realistic mock data for consistent results:

```typescript
const mockVehicleData = {
  vin: '1HGBH41JXMN109186',
  year: 2021,
  make: 'Honda',
  model: 'Civic',
  // ... complete vehicle data
};
```

## Test Results and Reporting

### Console Output

Tests provide detailed console output including:
- Individual test results (✅/❌)
- Performance metrics
- Error details
- Summary statistics

### Example Output

```
🧪 Running test: API Key Configuration
✅ API Key Configuration - PASSED (45ms)

🧪 Running test: Basic Authentication
✅ Basic Authentication - PASSED (1,234ms)

📊 OpenAI API Test Suite Report
================================
Total Tests: 12
Passed: 11 ✅
Failed: 1 ❌
Success Rate: 91.7%
Total Duration: 15,432ms

📈 Performance Summary:
  - Average Response Time: 1,286ms
  - Slowest Test: Different Vehicle Conditions (4,567ms)
  - Fastest Test: API Key Configuration (45ms)
```

## Test Scenarios

### 1. API Key Configuration
- Validates environment variable presence
- Checks API key format (starts with 'sk-')
- Verifies key length and structure

### 2. Authentication Flow
- Tests basic API authentication
- Validates response from OpenAI models endpoint
- Handles authentication errors gracefully

### 3. Model Availability
- Checks for required models (GPT-4, GPT-3.5-turbo)
- Validates model access permissions
- Reports available models

### 4. Valuation Accuracy
- Tests basic valuation requests
- Validates response structure
- Checks value ranges and logic

### 5. Condition Impact Testing
- Tests all condition levels (Excellent, Good, Fair, Poor)
- Validates that condition affects pricing appropriately
- Ensures logical price relationships

### 6. Edge Case Handling
- High mileage vehicles (250k+ miles)
- Very old vehicles (20+ years)
- Luxury vs economy vehicles
- Invalid or incomplete data

### 7. Performance Monitoring
- Response time validation (< 15 seconds)
- Rate limiting compliance
- Concurrent request handling
- Memory usage optimization

### 8. Error Recovery
- Network failure simulation
- Invalid API key handling
- Rate limit exceeded scenarios
- Timeout handling

### 9. Fallback Mechanisms
- Tests fallback to basic calculations
- Validates fallback confidence scores
- Ensures graceful degradation

## Troubleshooting

### Common Issues

1. **API Key Errors**
   ```
   ❌ API Key Configuration - FAILED: EXPO_PUBLIC_OPENAI_API_KEY environment variable not set
   ```
   **Solution**: Add your OpenAI API key to the `.env` file

2. **Rate Limiting**
   ```
   ❌ Basic Valuation Request - FAILED: Rate limit exceeded
   ```
   **Solution**: Wait a few minutes or upgrade your OpenAI plan

3. **Network Timeouts**
   ```
   ❌ Response Time Performance - FAILED: Response time too slow: 35000ms
   ```
   **Solution**: Check internet connection or increase timeout in config

4. **Authentication Failures**
   ```
   ❌ Basic Authentication - FAILED: Authentication failed - Invalid API key
   ```
   **Solution**: Verify your OpenAI API key is correct and active

### Debug Mode

Enable debug mode for detailed logging:

```bash
DEBUG=true npx ts-node tests/openai-api.test.ts
```

### Test Data Validation

Verify test data is realistic:

```typescript
// Check that mock data represents real vehicle
console.log('Mock vehicle:', mockVehicleData);

// Validate VIN format
const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
console.log('VIN valid:', vinRegex.test(mockVehicleData.vin));
```

## Best Practices

### 1. Rate Limit Compliance
- Add delays between tests (500ms minimum)
- Limit concurrent requests (max 3)
- Monitor rate limit headers

### 2. Error Handling
- Test both success and failure scenarios
- Validate error messages are user-friendly
- Ensure graceful degradation

### 3. Performance Optimization
- Monitor response times
- Test with various input sizes
- Validate token usage efficiency

### 4. Data Validation
- Use realistic test data
- Test edge cases and boundary conditions
- Validate output formats and ranges

### 5. Security Testing
- Never log API keys in test output
- Test with invalid/expired keys
- Validate secure error handling

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Add appropriate error handling
3. Include performance monitoring
4. Update this documentation
5. Test both success and failure cases

### Test Template

```typescript
async testNewFeature(): Promise<TestResult> {
  return this.runTest('New Feature Test', async () => {
    // Test setup
    const testData = { /* test data */ };
    
    // Execute test
    const result = await someFunction(testData);
    
    // Validate results
    if (!result.success) {
      throw new Error(`Test failed: ${result.error}`);
    }
    
    // Additional validations
    if (result.data.someValue < 0) {
      throw new Error('Invalid result value');
    }
    
    console.log(`Test completed successfully: ${result.data.someValue}`);
  });
}
```

## Continuous Integration

For CI/CD integration:

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test
        env:
          EXPO_PUBLIC_OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## Support

For test-related issues:
1. Check the troubleshooting section above
2. Review test logs for specific error messages
3. Verify environment configuration
4. Check API service status (OpenAI Status Page)
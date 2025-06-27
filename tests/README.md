# SmartVIN OpenAI API Integration Tests

This directory contains comprehensive tests for the OpenAI API integration used in SmartVIN's AI-powered vehicle valuations.

## 🧪 Test Suite Overview

The OpenAI integration test suite validates:

- **API Configuration**: Ensures API keys are properly configured
- **Authentication**: Verifies connection to OpenAI services
- **Valuation Accuracy**: Tests AI-powered vehicle valuations
- **Performance**: Monitors response times and efficiency
- **Error Handling**: Validates graceful error management
- **Fallback Systems**: Tests backup valuation methods

## 🚀 Running Tests

### Prerequisites

1. **Environment Setup**
   ```bash
   # Ensure your .env file contains:
   EXPO_PUBLIC_OPENAI_API_KEY=sk-your_openai_api_key_here
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

### Quick Test Commands

```bash
# Run OpenAI integration tests only
npm run test:openai

# Run all tests including OpenAI
npm run test

# Run with debug output
npm run test:debug

# Watch mode for development
npm run test:watch
```

### Direct Test Execution

```bash
# Run OpenAI tests directly
npx ts-node tests/run-openai-test.ts

# Run with Node.js debugging
node --inspect-brk -r ts-node/register tests/run-openai-test.ts
```

## 📋 Test Categories

### 1. Configuration Tests
- ✅ API key presence and format validation
- ✅ Environment variable configuration
- ✅ Key security and length checks

### 2. Authentication Tests
- ✅ Basic API authentication
- ✅ Model access verification
- ✅ Rate limit handling

### 3. Functional Tests
- ✅ Basic valuation requests
- ✅ Different vehicle conditions (Excellent, Good, Fair, Poor)
- ✅ High mileage scenarios
- ✅ Luxury vehicle valuations
- ✅ Invalid input handling

### 4. Performance Tests
- ✅ Response time monitoring (< 20 seconds)
- ✅ Rate limiting compliance
- ✅ Token usage optimization

### 5. Reliability Tests
- ✅ Error recovery mechanisms
- ✅ Fallback system validation
- ✅ Data validation and integrity

## 📊 Expected Test Results

### ✅ Successful Test Output

```
🤖 OpenAI API Integration Test Suite
====================================

🧪 Running: API Key Configuration
✓ API Key configured: sk-proj-abc...
✅ API Key Configuration - PASSED (45ms)

🧪 Running: Basic Authentication
✓ Authentication successful, 67 models available
✅ Basic Authentication - PASSED (1,234ms)

🧪 Running: Basic Valuation Request
✓ Valuation completed - Retail: $21,500, Confidence: 87%
✓ AI Insight: "This 2021 Honda Civic LX represents solid value in the compact car segment..."
✅ Basic Valuation Request - PASSED (8,456ms)

📊 OpenAI API Integration Test Report
=====================================
Total Tests: 10
Passed: 10 ✅
Failed: 0 ❌
Success Rate: 100.0%
Total Duration: 45.2s

📈 Performance Summary:
  - Average Response Time: 4.5s
  - Slowest Test: Different Vehicle Conditions (12.3s)
  - Fastest Test: API Key Configuration (0.045s)

💡 Recommendations:
  ✅ All tests passed! Your OpenAI integration is working correctly.
```

### ❌ Common Failure Scenarios

#### Missing API Key
```
❌ API Key Configuration - FAILED (45ms): EXPO_PUBLIC_OPENAI_API_KEY environment variable not set
```
**Solution**: Add your OpenAI API key to the `.env` file

#### Authentication Failure
```
❌ Basic Authentication - FAILED (1,234ms): Authentication failed - Invalid API key
```
**Solution**: Verify your OpenAI API key is correct and active

#### Rate Limiting
```
❌ Basic Valuation Request - FAILED (8,456ms): Rate limit exceeded
```
**Solution**: Wait a few minutes or upgrade your OpenAI plan

#### Slow Performance
```
⚠️ Average response time is high. Consider optimizing prompts or checking network.
```
**Solution**: Check internet connection or optimize AI prompts

## 🔧 Test Configuration

### Timeout Settings
```typescript
const TEST_CONFIG = {
  timeout: 30000,    // 30 seconds per test
  retries: 2,        // Retry failed tests twice
  verbose: true      // Detailed logging
};
```

### Test Vehicle Data
The tests use a standardized 2021 Honda Civic for consistent results:
```typescript
const TEST_VEHICLE_DATA = {
  vin: '1HGBH41JXMN109186',
  year: 2021,
  make: 'Honda',
  model: 'Civic',
  trim: 'LX',
  // ... complete vehicle specifications
};
```

## 🐛 Troubleshooting

### Common Issues

1. **"API key not configured"**
   - Check `.env` file exists and contains `EXPO_PUBLIC_OPENAI_API_KEY`
   - Restart development server after adding environment variables

2. **"Rate limit exceeded"**
   - OpenAI has usage limits based on your plan
   - Wait 1-2 minutes between test runs
   - Consider upgrading your OpenAI plan for higher limits

3. **"Network timeout"**
   - Check internet connection
   - Verify OpenAI service status at status.openai.com
   - Increase timeout in test configuration if needed

4. **"Invalid response format"**
   - OpenAI API may have changed response structure
   - Check OpenAI documentation for updates
   - Update test expectations if needed

### Debug Mode

Enable detailed logging for troubleshooting:

```bash
DEBUG=true npm run test:openai
```

This will show:
- Detailed API request/response logs
- Token usage information
- Performance metrics
- Error stack traces

### Manual Testing

You can also test the OpenAI integration manually in the app:

1. Open the SmartVIN app
2. Enter a test VIN: `1HGBH41JXMN109186`
3. Set mileage: `45000`
4. Select condition: `Good`
5. Tap "Get AI Valuation"
6. Verify you receive realistic valuations with AI insights

## 📈 Performance Benchmarks

### Target Performance
- **Response Time**: < 15 seconds average
- **Success Rate**: > 95%
- **Confidence Score**: > 80% for valid vehicles
- **Token Usage**: < 2000 tokens per request

### Monitoring
The tests automatically monitor:
- Individual test response times
- Overall success rates
- API error patterns
- Performance degradation

## 🔄 Continuous Integration

For CI/CD pipelines, add this to your workflow:

```yaml
# .github/workflows/test-openai.yml
name: OpenAI Integration Tests
on: [push, pull_request]

jobs:
  test-openai:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:openai
        env:
          EXPO_PUBLIC_OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## 📝 Adding New Tests

To add new OpenAI integration tests:

1. **Create Test Method**
   ```typescript
   private async testNewFeature(): Promise<void> {
     await this.runTest('New Feature Test', async () => {
       // Your test logic here
       const result = await ValuationService.someNewMethod();
       
       if (!result.success) {
         throw new Error(`Test failed: ${result.error}`);
       }
       
       this.log(`✓ New feature working correctly`);
     });
   }
   ```

2. **Add to Test Suite**
   ```typescript
   const tests = [
     // ... existing tests
     () => this.testNewFeature(),
   ];
   ```

3. **Update Documentation**
   - Add test description to this README
   - Document expected behavior
   - Include troubleshooting tips

## 🤝 Contributing

When contributing to the test suite:

1. Follow existing test patterns
2. Add comprehensive error handling
3. Include performance monitoring
4. Update documentation
5. Test both success and failure scenarios

## 📞 Support

For test-related issues:

1. Check this README for common solutions
2. Review test output for specific error messages
3. Verify OpenAI API key and account status
4. Check OpenAI service status
5. Review network connectivity

## 📚 Related Documentation

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [SmartVIN Valuation Service](../services/valuationApi.ts)
- [Environment Configuration](../.env.example)
- [Main Test Suite](./test-runner.ts)
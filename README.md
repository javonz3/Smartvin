# SmartVIN - AI-Powered Vehicle Valuation App

A comprehensive mobile application for vehicle dealers and professionals to get AI-powered vehicle valuations using VIN decoding.

## Features

- 📱 VIN barcode scanning and manual entry
- 🤖 AI-powered market valuations
- 📊 Comprehensive vehicle specifications
- 📈 Market trend analysis
- 💼 Professional PDF reports
- 📱 Cross-platform (iOS, Android, Web)
- 🧪 **Mock data service for development and testing**

## Setup

### Prerequisites

- Node.js 18+ 
- Expo CLI
- API keys for VIN Data API and OpenAI (optional for development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. **For Development**: You can start developing immediately without API credentials! The app will automatically use mock data.

5. **For Production**: Add your API credentials to `.env`:
   ```
   EXPO_PUBLIC_VDP_API_KEY=your_vindata_secret_key
   EXPO_PUBLIC_VDP_USERNAME=your_vindata_username
   EXPO_PUBLIC_VDP_PASSWORD=your_vindata_password
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   ```

### Running the App

```bash
# Start development server
npm run dev

# Build for web
npm run build:web
```

## 🧪 Mock Data Service

The app includes a comprehensive mock VIN data service that allows you to develop and test without using paid API credits.

### Features

- **10 realistic test vehicles** with complete specifications
- **Error simulation** for testing edge cases
- **Automatic fallback** when API credentials are missing
- **Easy switching** between mock and real data
- **Development-friendly** with test VIN suggestions

### Available Test VINs

| VIN | Vehicle | Year | Type |
|-----|---------|------|------|
| `1HGBH41JXMN109186` | Honda Civic LX | 2021 | Economy |
| `1FTFW1ET5DFC10312` | Ford F-150 XLT | 2020 | Truck |
| `4T1B11HK5KU123456` | Toyota Camry LE | 2019 | Mid-size |
| `5YJ3E1EA5NF123789` | Tesla Model 3 | 2022 | Electric |
| `5UXKR0C58J0123456` | BMW X5 xDrive35i | 2018 | Luxury SUV |
| `5NPE34AF4HH012345` | Hyundai Elantra SE | 2017 | Compact |
| `1GCUYDED5PZ123456` | Chevrolet Silverado | 2023 | Pickup |
| `1N4BL4BV4LC123456` | Nissan Altima 2.5 S | 2020 | Mid-size |
| `1C4HJXDG5MW123456` | Jeep Wrangler | 2021 | SUV |
| `4S4BSANC5K3123456` | Subaru Outback | 2019 | Wagon |

### Error Testing VINs

Test error handling with these special VINs:

| VIN | Error Type | Description |
|-----|------------|-------------|
| `INVALID123` | Invalid Format | Too short VIN |
| `1HGBH41JXMN999999` | Not Found | Valid format but not in database |
| `1HGBH41JXMN000000` | Network Error | Simulates connection issues |
| `1HGBH41JXMN111111` | Rate Limit | Simulates API rate limiting |
| `1HGBH41JXMN222222` | Server Error | Simulates server errors |

### Switching Between Mock and Real Data

#### Automatic Mode (Recommended)
The app automatically chooses the appropriate service:
- **Development + No API credentials** → Mock data
- **Development + Valid API credentials** → Real API
- **Production** → Real API (with fallback to mock if needed)

#### Manual Override
In development, you can manually switch using the VIN Service Toggle component:

1. Look for the "VIN Data Service" toggle in the app
2. Switch between "Mock Data" and "Real API"
3. View available test VINs when using mock data

#### Environment Variable Override
Force mock data usage regardless of credentials:
```bash
# In your .env file
EXPO_PUBLIC_FORCE_MOCK_DATA=true
```

### Development Workflow

1. **Start Development**: Run `npm run dev` - app uses mock data automatically
2. **Test with Sample VINs**: Use the "Fill Test VIN" button or enter VINs manually
3. **Test Error Cases**: Try the error test VINs to verify error handling
4. **Add API Credentials**: When ready, add real credentials to switch to live data
5. **Production Deploy**: Ensure real API credentials are configured

### Mock Service API

The mock service provides the same interface as the real VIN API:

```typescript
import { VinApiConfig } from '@/services/vinApiConfig';

// Automatically uses mock or real service based on configuration
const result = await VinApiConfig.decodeVIN('1HGBH41JXMN109186');

// Check current service status
const status = await VinApiConfig.getServiceStatus();
console.log('Using:', status.service); // 'mock' or 'real'

// Get available test data (only when using mock)
const testData = VinApiConfig.getTestData();
if (testData) {
  console.log('Available test VINs:', testData.availableVINs);
}
```

## API Keys Required (Production Only)

### VIN Data API
- **Website**: https://vindata.com
- **Documentation**: https://vdpvin.docs.apiary.io/
- **Required Credentials**:
  - **Secret Key** (`secret_key`) - Found in your VIN Data dashboard
  - **Username** (`username`) - Your VIN Data account username
  - **Password** (`password`) - Your VIN Data account password

### OpenAI API (for AI valuations)
- Sign up at: https://platform.openai.com
- Create an API key at: https://platform.openai.com/api-keys
- Add to `EXPO_PUBLIC_OPENAI_API_KEY` in `.env`

## Project Structure

```
app/
├── (tabs)/           # Main tab navigation
│   ├── index.tsx     # VIN lookup screen (with mock service toggle)
│   ├── history.tsx   # Lookup history
│   ├── analytics.tsx # Analytics dashboard
│   ├── more.tsx      # Additional features
│   └── profile.tsx   # User profile
├── valuation.tsx     # Valuation results
├── marketplace.tsx   # Vehicle marketplace
├── compare.tsx       # Vehicle comparison
├── alerts.tsx        # Price alerts
└── api/
    └── vin/
        └── [vin]+api.ts # VIN API proxy route

components/
├── VINScanner.tsx       # Barcode scanner
├── PaywallModal.tsx     # Subscription modal
├── UsageBanner.tsx      # Usage tracking
├── VehicleCard.tsx      # Vehicle listing card
└── VinServiceToggle.tsx # Mock/Real API toggle (dev only)

services/
├── vinApi.ts            # Real VIN Data API client
├── mockVinData.ts       # Mock VIN data service
├── vinApiConfig.ts      # Service configuration and switching
├── valuationApi.ts      # AI valuation service
└── subscriptionService.ts # Subscription management
```

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `EXPO_PUBLIC_VDP_API_KEY` | VIN Data secret key | Production | `your_secret_key` |
| `EXPO_PUBLIC_VDP_USERNAME` | VIN Data username | Production | `your_username` |
| `EXPO_PUBLIC_VDP_PASSWORD` | VIN Data password | Production | `your_password` |
| `EXPO_PUBLIC_OPENAI_API_KEY` | OpenAI API key | Production | `sk-...` |
| `EXPO_PUBLIC_FORCE_MOCK_DATA` | Force mock data usage | Optional | `true/false` |

## Development Benefits

### 🚀 **Instant Development**
- Start coding immediately without API setup
- No API credits consumed during development
- Realistic test data for all scenarios

### 🧪 **Comprehensive Testing**
- Test all vehicle types and conditions
- Simulate error scenarios safely
- Validate error handling and edge cases

### 💰 **Cost Effective**
- No API costs during development
- Only use real API when needed
- Easy switching for different environments

### 🔄 **Seamless Transition**
- Same interface for mock and real data
- Automatic fallback mechanisms
- Production-ready error handling

## Troubleshooting

### Common Issues

1. **"Using mock data" in production**
   - Check that API credentials are properly set in production environment
   - Verify `EXPO_PUBLIC_FORCE_MOCK_DATA` is not set to `true`

2. **"No test VINs available"**
   - This message appears when using real API (expected behavior)
   - Switch to mock data to access test VINs

3. **Mock service not working**
   - Ensure you're in development mode (`__DEV__` is true)
   - Check that the VinServiceToggle component is visible

## Deployment

### Development/Staging
- Mock data can be used for testing environments
- Set `EXPO_PUBLIC_FORCE_MOCK_DATA=true` if needed

### Production
- Ensure all API credentials are configured
- Verify `EXPO_PUBLIC_FORCE_MOCK_DATA` is not set or is `false`
- Test with real API before deployment

## Contributing

When contributing:

1. Test with both mock and real data
2. Add new test VINs to the mock service if needed
3. Ensure error handling works with both services
4. Update documentation for any new mock data features

## License

This project is licensed under the MIT License.
# SmartVIN - AI-Powered Vehicle Valuation App

A comprehensive mobile application for vehicle dealers and professionals to get AI-powered vehicle valuations using VIN decoding.

## Features

- 📱 VIN barcode scanning and manual entry
- 🤖 AI-powered market valuations
- 📊 Comprehensive vehicle specifications
- 📈 Market trend analysis
- 💼 Professional PDF reports
- 📱 Cross-platform (iOS, Android, Web)

## Setup

### Prerequisites

- Node.js 18+ 
- Expo CLI
- API keys for VIN Data API and OpenAI

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

4. Add your API keys to `.env`:
   ```
   EXPO_PUBLIC_VDP_API_KEY=your_vindata_secret_key
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   ```

### API Keys Required

#### VIN Data API
- Sign up at: https://vindata.com
- Navigate to your dashboard to get your **secret key** (not API key)
- API Documentation: https://vdpvin.docs.apiary.io/
- Add to `EXPO_PUBLIC_VDP_API_KEY` in `.env`

**Important**: The VIN Data API uses Bearer token authentication. You need your **secret key** from the dashboard, which is used to obtain authentication tokens.

**Authentication Flow**:
1. POST to `/token` endpoint with your `secret_key` to get a Bearer token
2. Use the Bearer token in the `Authorization` header for VIN requests
3. Tokens expire after 1 hour and need to be refreshed

#### OpenAI API (for AI valuations)
- Sign up at: https://platform.openai.com
- Create an API key at: https://platform.openai.com/api-keys
- Add to `EXPO_PUBLIC_OPENAI_API_KEY` in `.env`

### Running the App

```bash
# Start development server
npm run dev

# Build for web
npm run build:web
```

## API Integration

### VIN Data API

The app uses the VIN Data API for vehicle data retrieval:

- **Base URL**: `https://api.vindata.com/v1`
- **Authentication**: Bearer token (obtained via `/token` endpoint)
- **Documentation**: https://vdpvin.docs.apiary.io/

#### Authentication Process

1. **Get Token**: POST to `/token` with your secret key
   ```typescript
   const tokenResponse = await fetch('https://api.vindata.com/v1/token', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ secret_key: YOUR_SECRET_KEY })
   });
   ```

2. **Use Token**: Include Bearer token in VIN requests
   ```typescript
   const response = await fetch(`https://api.vindata.com/v1/vin/${vin}`, {
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     }
   });
   ```

#### Rate Limiting
- Maximum 100 requests per minute
- HTTP 429 response when limit exceeded
- `X-Calls-Count` header shows current usage

### Testing API Integration

1. Add your VIN Data secret key to `.env`
2. Use the built-in API key validation:
   ```typescript
   import { VINApiService } from '@/services/vinApi';
   
   const validation = await VINApiService.validateApiKey();
   console.log(validation.message);
   ```

## Project Structure

```
app/
├── (tabs)/           # Main tab navigation
│   ├── index.tsx     # VIN lookup screen
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
├── VINScanner.tsx    # Barcode scanner
├── PaywallModal.tsx  # Subscription modal
├── UsageBanner.tsx   # Usage tracking
└── VehicleCard.tsx   # Vehicle listing card

services/
├── vinApi.ts         # VIN Data API
├── valuationApi.ts   # AI valuation service
└── subscriptionService.ts # Subscription management
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_VDP_API_KEY` | VIN Data secret key (not API key) | Yes |
| `EXPO_PUBLIC_OPENAI_API_KEY` | OpenAI API key for AI valuations | Yes |
| `EXPO_PUBLIC_API_URL` | VIN Data API base URL | No |

## Features Overview

### VIN Lookup
- Manual VIN entry with validation
- Barcode scanning (mobile only)
- Comprehensive vehicle data retrieval
- Real-time validation
- Support for all 17-character VINs

### AI Valuations
- Wholesale, trade-in, retail, and BHPH values
- Market trend analysis
- Confidence scoring
- Regional pricing factors
- AI-powered insights

### Subscription Management
- Free tier with limited lookups
- Pay-per-request option
- Pro subscription with unlimited access
- Usage tracking and analytics

### Professional Features
- PDF report generation
- Bulk VIN processing
- Advanced analytics
- Market insights

## Platform Support

- ✅ iOS (via Expo Go or development build)
- ✅ Android (via Expo Go or development build)
- ✅ Web (full functionality)

## Development

### Adding New Features

1. Create components in `/components`
2. Add routes in `/app`
3. Update navigation in `app/(tabs)/_layout.tsx`
4. Add services in `/services`

### Testing VIN API

Test with these sample VINs:
- `1HGBH41JXMN109186` (Honda Civic)
- `1FTFW1ET5DFC10312` (Ford F-150)
- `5NPE34AF4HH012345` (Hyundai Elantra)

### Error Handling

The VIN API service includes comprehensive error handling:
- Network connectivity issues
- Invalid secret keys
- Malformed VINs
- Rate limiting (100 requests/minute)
- Token expiration (1 hour)
- Server errors

## Deployment

### Web Deployment
```bash
npm run build:web
```

### Mobile Deployment
Use Expo Application Services (EAS) for building and distributing mobile apps:

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Build for iOS/Android
eas build --platform all
```

## Troubleshooting

### Common Issues

1. **"API key not configured"**
   - Ensure `.env` file exists with `EXPO_PUBLIC_VDP_API_KEY`
   - Use your **secret key** from VIN Data dashboard, not API key
   - Restart the development server after adding environment variables

2. **"Authentication failed"**
   - Verify you're using the secret key, not API key
   - Check your VIN Data dashboard for the correct secret key
   - Ensure the secret key hasn't expired

3. **"Invalid VIN format"**
   - VINs must be exactly 17 characters
   - Cannot contain letters I, O, or Q
   - Must be alphanumeric only

4. **"Network error"**
   - Check internet connection
   - Verify API endpoint is accessible
   - Check for firewall/proxy issues

5. **"API Error: 401"**
   - Invalid secret key
   - Token has expired (tokens last 1 hour)
   - Check your VIN Data dashboard for the correct secret key

6. **"API Error: 429"**
   - Rate limit exceeded (100 requests/minute)
   - Wait before making more requests
   - Consider upgrading your VIN Data plan

7. **"Token expired"**
   - Tokens automatically expire after 1 hour
   - The app will automatically request a new token
   - If issues persist, check your secret key

### API Key vs Secret Key

**Important**: VIN Data uses two different credentials:
- **API Key**: Used for some legacy endpoints
- **Secret Key**: Used for Bearer token authentication (what you need)

Make sure you're using the **secret key** from your VIN Data dashboard.

### API Key Validation

Use the built-in validation method to test your setup:

```typescript
import { VINApiService } from '@/services/vinApi';

const result = await VINApiService.validateApiKey();
console.log(result.message);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the documentation
- Review VIN Data API documentation: https://vdpvin.docs.apiary.io/
- Contact VIN Data support for API-related issues
- Check OpenAI documentation for AI service issues
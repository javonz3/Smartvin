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
- API keys for VIN Data Project and OpenAI

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
   EXPO_PUBLIC_VDP_API_KEY=your_vindataproject_api_key
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   ```

### API Keys Required

#### VIN Data Project API
- Sign up at: https://vindataproject.com
- Navigate to your dashboard to get your API key
- API Documentation: https://vdpvin.docs.apiary.io/
- Add to `EXPO_PUBLIC_VDP_API_KEY` in `.env`

**Important**: The VIN Data Project API uses `Bearer` token authentication and follows the endpoint pattern `/vin/{vin}`.

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

### VIN Data Project API

The app uses the VIN Data Project API for vehicle data retrieval:

- **Endpoint**: `https://api.vindataproject.com/vin/{vin}`
- **Authentication**: `Authorization: Bearer {token}`
- **Documentation**: https://vdpvin.docs.apiary.io/

#### Example API Usage

```typescript
const response = await fetch(`https://api.vindataproject.com/vin/${vin}`, {
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});
```

### Testing API Integration

1. Add your VDP API key to `.env`
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
├── vinApi.ts         # VIN Data Project API
├── valuationApi.ts   # AI valuation service
└── subscriptionService.ts # Subscription management
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_VDP_API_KEY` | VIN Data Project API key | Yes |
| `EXPO_PUBLIC_OPENAI_API_KEY` | OpenAI API key for AI valuations | Yes |
| `EXPO_PUBLIC_API_URL` | VDP API base URL | No |

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
- Invalid API keys
- Malformed VINs
- Rate limiting
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
   - Restart the development server after adding environment variables

2. **"Invalid VIN format"**
   - VINs must be exactly 17 characters
   - Cannot contain letters I, O, or Q
   - Must be alphanumeric only

3. **"Network error"**
   - Check internet connection
   - Verify API endpoint is accessible
   - Check for firewall/proxy issues

4. **"API Error: 401"**
   - Invalid API key
   - Check your VDP dashboard for the correct key

5. **"API Error: 429"**
   - Rate limit exceeded
   - Wait before making more requests
   - Consider upgrading your VDP plan

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
- Review VDP API documentation: https://vdpvin.docs.apiary.io/
- Contact VDP support for API-related issues
- Check OpenAI documentation for AI service issues
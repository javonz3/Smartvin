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

4. Add your API credentials to `.env`:
   ```
   EXPO_PUBLIC_VDP_API_KEY=your_vindata_secret_key
   EXPO_PUBLIC_VDP_USERNAME=your_vindata_username
   EXPO_PUBLIC_VDP_PASSWORD=your_vindata_password
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   ```

### API Keys Required

#### VIN Data API
- **Website**: https://vindata.com
- **Documentation**: https://vdpvin.docs.apiary.io/
- **Required Credentials**:
  - **Secret Key** (`secret_key`) - Found in your VIN Data dashboard
  - **Username** (`username`) - Your VIN Data account username
  - **Password** (`password`) - Your VIN Data account password

**Authentication Process**:
1. POST to `/token` endpoint with all three credentials to get a Bearer token
2. Use the Bearer token for VIN report requests
3. Tokens expire after 1 hour and need to be refreshed

**API Endpoints Used**:
- **Authentication**: `POST https://api.vindata.com/v1/token`
- **VIN Reports**: `GET https://api.vindata.com/v1/products/vind/reports/{VIN}?force=false`

**Rate Limiting**:
- Maximum 100 requests per minute
- HTTP 429 response when limit exceeded
- Reports are cached for 90 days

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

## API Integration Details

### VIN Data API Implementation

The app uses a two-step authentication process with the VIN Data API:

#### Step 1: Authentication
```typescript
POST https://api.vindata.com/v1/token
Content-Type: application/json

{
  "secret_key": "your_secret_key",
  "username": "your_username", 
  "password": "your_password"
}
```

**Response**:
```json
{
  "token": "bearer_token_here",
  "expires_in": 3600
}
```

#### Step 2: VIN Report Request
```typescript
GET https://api.vindata.com/v1/products/vind/reports/{VIN}?force=false
Authorization: Bearer {token}
Content-Type: application/json
```

**Parameters**:
- `{VIN}`: 17-character VIN number
- `force=false`: Returns cached report if available (within 90 days)
- `force=true`: Generates new report (costs additional credits)

**Response Structure**:
```json
{
  "id": "report_id",
  "vin": "1HGBH41JXMN109186",
  "html_link": "https://reports.vindata.com/...",
  "created_at": "2024-01-15T10:30:00Z",
  "year": 2021,
  "make": "Honda",
  "model": "Civic",
  "trim": "LX",
  // ... additional vehicle data
}
```

### Error Handling

The API service includes comprehensive error handling for:

- **401/403**: Invalid credentials
- **404**: VIN not found
- **429**: Rate limit exceeded (100 requests/minute)
- **500+**: Server errors
- **Network errors**: Connection issues

### Testing API Integration

1. **Environment Setup**:
   ```bash
   # Add to .env file
   EXPO_PUBLIC_VDP_API_KEY=b1b094ca-65c5-460c-a396-6f8fd2d0cd1b
   EXPO_PUBLIC_VDP_USERNAME=your_username
   EXPO_PUBLIC_VDP_PASSWORD=your_password
   ```

2. **Test VINs**:
   - `1HGBH41JXMN109186` (Honda Civic)
   - `1FTFW1ET5DFC10312` (Ford F-150)
   - `5NPE34AF4HH012345` (Hyundai Elantra)

3. **API Validation**:
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
├── vinApi.ts         # VIN Data API client
├── valuationApi.ts   # AI valuation service
└── subscriptionService.ts # Subscription management
```

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `EXPO_PUBLIC_VDP_API_KEY` | VIN Data secret key | Yes | `b1b094ca-65c5-460c-a396-6f8fd2d0cd1b` |
| `EXPO_PUBLIC_VDP_USERNAME` | VIN Data username | Yes | `your_username` |
| `EXPO_PUBLIC_VDP_PASSWORD` | VIN Data password | Yes | `your_password` |
| `EXPO_PUBLIC_OPENAI_API_KEY` | OpenAI API key | Yes | `sk-...` |

## Features Overview

### VIN Lookup
- Manual VIN entry with real-time validation
- Barcode scanning (mobile only)
- Comprehensive vehicle data retrieval
- Support for all 17-character VINs
- Sample VINs for testing

### AI Valuations
- Wholesale, trade-in, retail, and BHPH values
- Market trend analysis with confidence scoring
- Regional pricing factors
- AI-powered insights and recommendations

### Subscription Management
- Free tier: 3 VIN lookups per month
- Pay-per-request: $9.99 per lookup
- Pro subscription: Unlimited access with advanced features
- Usage tracking and analytics

### Professional Features
- PDF report generation (Pro)
- Bulk VIN processing (Pro)
- Advanced analytics dashboard
- Market insights and trends

## Platform Support

- ✅ iOS (via Expo Go or development build)
- ✅ Android (via Expo Go or development build)  
- ✅ Web (full functionality with server-side API proxy)

## API Rate Limits & Costs

### VIN Data API
- **Rate Limit**: 100 requests per minute
- **Report Caching**: 90 days (use `force=false` to avoid extra costs)
- **Token Expiry**: 1 hour (automatically refreshed)

### Best Practices
- Use `force=false` parameter to leverage cached reports
- Implement proper error handling for rate limits
- Cache tokens to minimize authentication requests
- Monitor usage to stay within rate limits

## Troubleshooting

### Common Issues

1. **"API credentials not configured"**
   - Ensure all three credentials are in `.env`:
     - `EXPO_PUBLIC_VDP_API_KEY` (secret key)
     - `EXPO_PUBLIC_VDP_USERNAME` (username)
     - `EXPO_PUBLIC_VDP_PASSWORD` (password)
   - Restart development server after adding variables

2. **"Authentication failed" (401/403)**
   - Verify credentials in VIN Data dashboard
   - Check username/password are correct
   - Ensure secret key hasn't expired

3. **"Too many requests" (429)**
   - Rate limit: 100 requests/minute
   - Wait before making more requests
   - Consider upgrading VIN Data plan

4. **"No vehicle data found" (404)**
   - VIN not in database
   - Verify VIN is correct (17 characters, no I/O/Q)
   - Try with known test VINs

5. **Token expiration**
   - Tokens expire after 1 hour
   - App automatically requests new tokens
   - Check credentials if repeated failures

### VIN Data Dashboard

Access your VIN Data dashboard at: https://vindata.com/dashboard

**Required Information**:
- **Secret Key**: Found in API section
- **Username**: Your account username
- **Password**: Your account password

### API Testing

Test your integration with the built-in validation:

```typescript
// Test API connectivity
const result = await VINApiService.validateApiKey();
console.log(result.message);

// Test VIN decoding
const vinResult = await VINApiService.decodeVIN('1HGBH41JXMN109186');
console.log(vinResult);
```

## Development

### Adding New Features

1. Create components in `/components`
2. Add routes in `/app`
3. Update navigation in `app/(tabs)/_layout.tsx`
4. Add services in `/services`

### API Proxy Pattern

The app uses a server-side API proxy (`app/api/vin/[vin]+api.ts`) to:
- Secure API credentials on the server
- Handle authentication token management
- Provide consistent error handling
- Enable CORS for web clients

## Deployment

### Web Deployment
```bash
npm run build:web
```

### Mobile Deployment
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Build for iOS/Android
eas build --platform all
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Test with real VIN Data API credentials
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support:
- VIN Data API: https://vdpvin.docs.apiary.io/
- OpenAI API: https://platform.openai.com/docs
- Expo: https://docs.expo.dev/
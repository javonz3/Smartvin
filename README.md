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
- Get your API key from the dashboard
- Add to `EXPO_PUBLIC_VDP_API_KEY` in `.env`

#### OpenAI API (for AI valuations)
- Sign up at: https://platform.openai.com
- Create an API key
- Add to `EXPO_PUBLIC_OPENAI_API_KEY` in `.env`

### Running the App

```bash
# Start development server
npm run dev

# Build for web
npm run build:web
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
└── alerts.tsx        # Price alerts

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
| `EXPO_PUBLIC_API_URL` | Custom API base URL | No |

## Features Overview

### VIN Lookup
- Manual VIN entry with validation
- Barcode scanning (mobile only)
- Comprehensive vehicle data retrieval
- Real-time validation

### AI Valuations
- Wholesale, trade-in, retail, and BHPH values
- Market trend analysis
- Confidence scoring
- Regional pricing factors

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

### Testing

- Test VIN scanning on physical devices
- Verify API integrations with valid keys
- Test subscription flows
- Validate cross-platform compatibility

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
- Review API documentation for VIN Data Project
- Contact support for API-related issues
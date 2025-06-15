# Minimal Expo Router App

This is a minimal expo-router app using Expo SDK 52.0.30 and Expo Router 4.0.17.

For all designs I ask you to make, have them be beautiful, not cookie cutter. Make apps that are fully featured and worthy for production.

When using placeholder images from Pexels, link directly to them using `Image` components.

# Project Structure

- All routes must be placed in the `/app` directory
- Reusable components must be placed in the `/components` directory
- Each route file must export a default React component

# Important Constraints

This project's default platform is Web, which means:

- Native-only APIs like Haptics, Local Authentication, and some Sensors are not available
- Use web-compatible alternatives or implement platform-specific code using `Platform.select()`
- Always check platform compatibility before using React Native APIs
- CRITICAL: The `useFrameworkReady` hook code in `app/_layout.tsx` is REQUIRED and must NEVER be removed or modified. This code is essential for the framework to function properly.

Example of proper platform-specific code:

```typescript
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const triggerFeedback = () => {
  if (Platform.OS !== 'web') {
    // Only runs on iOS/Android
    Haptics.impactAsync();
  } else {
    // Implement web alternative (e.g., visual feedback)
  }
};
```

Example of the required initialization code that MUST be preserved:

```typescript
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
```

## Expo Managed Workflow

- This project uses Expo managed workflow exclusively
- DO NOT create `ios` or `android` directories
- No native code files should be included in the project

## Navigation Architecture

### Primary Navigation: Tabs

- The app MUST use tab-based layout as the primary navigation structure
- Tab navigation is implemented using expo-router's built-in tab support
- All main sections of the app should be accessible via tabs

### Secondary Navigation

You can implement additional navigation patterns WITHIN tab screens:

- Stack Navigation: Use for hierarchical flows within a tab
- Modal Navigation: Use for overlay screens within a tab
- Drawer Navigation: Use for additional menu options within a specific tab

Example of proper navigation nesting:

```typescript
// app/(tabs)/home/_layout.tsx - Stack navigator within a tab

import { Stack } from 'expo-router/stack';

export default function HomeTabLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="details" options={{ title: 'Details' }} />
    </Stack>
  );
}
```

## Styling

- Use `StyleSheet.create` for all styling
- DO NOT use NativeWind or any alternative styling libraries unless explicitly asked for

## Error Handling

- Prefer showing errors directly in the UI instead of using the Alert API
- Use error states in components to display error messages inline

Example of proper error handling:

```typescript
function UserProfile() {
  const [error, setError] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      <Text>User Profile</Text>
    </View>
  );
}
```

## Environment Variables

- Use Expo's environment variable system
- DO NOT use Vite environment variables

### Environment Variable Types

Create a `types/env.d.ts` file in your project:

```typescript
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_URL: string;
      EXPO_PUBLIC_API_KEY: string;
      // Add other environment variables here
    }
  }
}

// Ensure this file is treated as a module
export {};
```

### Environment Setup

1. Create environment files for different environments:
  - `.env` - Development defaults
  - `.env.staging` - Staging environment
  - `.env.production` - Production environment

2. Example environment file structure:

```
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_API_KEY=your_api_key
```

## Dependencies

- ALWAYS maintain ALL existing dependencies in package.json
- DO NOT remove any pre-configured dependencies

# Fonts

This section covers font management in React Native Expo projects using `expo-google-fonts`. Follow these guidelines to ensure proper font integration and loading.

- Use `@expo-google-fonts` packages for any font implementation
- DO NOT use local font files or custom font loading methods
- ALWAYS follow the standard pattern for loading and using Google Fonts

## Implementation Steps

### Step 1: Install Required Packages

For any font family needed, install the corresponding `@expo-google-fonts` package:

```bash
npm install @expo-google-fonts/[font-name]
```

Example:

```bash
npm install @expo-google-fonts/inter @expo-google-fonts/roboto
```

### Step 2: Import and Load Fonts

Always use the `useFonts` hook from the font package:

```typescript
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null to keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Continue with app rendering
  return <YourApp />;
}
```

### Step 3: Apply Fonts in Styles

Always reference fonts by their mapped names:

```typescript
const styles = StyleSheet.create({
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  }
});
```

### Best Practices

- Load fonts at the root level to ensure all components have access
- Handle loading states, e.g., use a splash screen or loading indicator
- Maintain a clear mapping for font families
- Organize imports systematically and when working with multiple font families, group them by family
- Check for font loading errors and provide fallbacks

### Troubleshooting

- Font not displaying correctly: Verify the font name mapping is correct
- Correct package name: Ensure you're using the exact font name from the `@expo-google-fonts` package
- Loading state: Check that fonts are properly loaded before rendering components that use them

# File Management

## Removing Routes

To remove a route, use the following command in the terminal:

```bash
rm -rf "path/to/route/file"
```

# Tabs Layout in Expo Router

## File Structure Example

```
app/
├── _layout.tsx
└── (tabs)/
    ├── _layout.tsx
    ├── index.tsx
    └── settings.tsx
```

- app/_layout.tsx: Root layout with Stack navigator pointing to tabs
- app/(tabs)/_layout.tsx: Tab bar layout configuration
- app/(tabs)/index.tsx and app/(tabs)/settings.tsx: Individual tab screens

## Setting Up the Root Layout

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router/stack';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

## Configuring the Tabs Layout

```typescript
// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

## Creating Tab Screens

Each tab screen should follow this basic template:

```typescript
// app/(tabs)/index.tsx or app/(tabs)/settings.tsx

import { View, Text, StyleSheet } from 'react-native';

export default function Tab() {
  return (
    <View style={styles.container}>
      <Text>Tab Content</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

## Icons

- Use the lucide icon library exclusively by importing icons as React components from "lucide-react-native"
- Follow SVG prop defaults for consistency
- Import only needed icons for better performance

### Icon Component Usage

Example of proper icon implementation:

```typescript
import { Camera } from 'lucide-react-native';
function PhotoButton() {
  return <Camera color="red" size={48} />;
}
```

### SVG Prop Defaults

All icons should use these default props unless specifically needed:

```typescript
{
  size: 24,
  color: 'currentColor',
  strokeWidth: 2,
  absoluteStrokeWidth: false
}
```

### Custom Icons

For Lucide Lab or custom icons, use the Icon component:

```typescript
import { Icon } from 'lucide-react-native';
import { burger } from '@lucide/lab';
function MenuButton() {
  return <Icon iconNode={burger} />;
}
```

# Camera Usage

Use `expo-camera` for implementing camera features. Here's the standard implementation:

```typescript
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}
```

## Best Practices

- Always check and request permissions before camera access
- Unmount camera component when not in use
- Test on both iOS and Android platforms
- Handle platform-specific camera behaviors

# API Routes

Expo Router enables you to write secure server code for all platforms, right in your **app** directory. API Routes are functions that are executed on a server when a route is matched. They can be used to handle sensitive data, such as API keys securely, or implement custom server logic.

## Setup

1. Ensure your project is using server output in app.json:

```json
{
  "web": {
    "output": "server"
  }
}
```

2. Create API routes in the **app** directory with the `+api.ts` extension. For example:

```typescript
// app/hello+api.ts
export function GET(request: Request) {
  return Response.json({ hello: 'world' });
}
```

You can export any of the following functions `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, and `OPTIONS` from a server route.

## Making Requests

You can make requests to API routes from client code:

```typescript
async function fetchHello() {
  const response = await fetch('/hello');
  const data = await response.json();
  alert('Hello ' + data.hello);
}
```

## Request Handling

### Request Body

```typescript
export async function POST(request: Request) {
  const body = await request.json();
  return Response.json({ ... });
}
```

### Query Parameters

```typescript
export async function GET(request: Request) {
  const url = new URL(request.url);
  const post = url.searchParams.get('post');
  return Response.json({ ... });
}
```

### Error Handling

```typescript
export async function GET(request: Request, { post }: Record<string, string>) {
  if (!post) {
    return new Response('No post found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
  return Response.json({ ... });
}
```

## Important Notes

- API route filenames cannot have platform-specific extensions (e.g., `hello+api.web.ts` will not work)
- Server features require a custom server, which can be deployed to EAS or other hosting providers
- Configure the origin in app.json for production:

```json
{
  "plugins": [
    [
      "expo-router",
      {
        "origin": "https://your-domain.com/"
      }
    ]
  ]
}
```

# Preferred Libraries

Use these recommended libraries for better performance and functionality:

- `react-native-reanimated` instead of `Animated` from `react-native`
  - Better performance for animations
  - More powerful animation capabilities

- `react-native-gesture-handler` instead of `PanResponder`
  - Native gesture handling
  - Better performance for touch interactions

Example usage:

```typescript
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

function Ball() {
  return (
    <GestureDetector>
      <Animated.View style={{}} />
    </GestureDetector>
  );
}
```

# Payments

When adding subscriptions or in-app purchases to the app, use RevenueCat.

RevenueCat is the best solution for mobile subscriptions and in-app purchases. It handles billing, entitlements, analytics, and receipt validation out of the box, making it easier for developers to monetize their apps without building complex infrastructure.

Since Bolt projects are built on Expo, developers will need to export their project and open it locally (e.g. in Cursor or VS Code) to install the RevenueCat SDK. I recommend doing so when integrating RevenueCat.

You can find the official guide:

https://www.revenuecat.com/docs/getting-started/installation/expo

Note that RevenueCat requires native code and will not function in Bolt's in-browser preview. To test purchases, developers should create a development build using the Expo Dev Client.

DO NOT use Stripe as it does not support mobile platform subscriptions like Apple or Google billing. RevenueCat is the preferred tool for that use case.
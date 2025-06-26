declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_VDP_API_KEY: string;
      EXPO_PUBLIC_VDP_USERNAME: string;
      EXPO_PUBLIC_VDP_PASSWORD: string;
      EXPO_PUBLIC_OPENAI_API_KEY: string;
      EXPO_PUBLIC_API_URL: string;
    }
  }
}

// Ensure this file is treated as a module
export {};
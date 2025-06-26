/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/analytics` | `/(tabs)/history` | `/(tabs)/more` | `/(tabs)/profile` | `/_sitemap` | `/alerts` | `/analytics` | `/compare` | `/history` | `/marketplace` | `/more` | `/profile` | `/valuation`;
      DynamicRoutes: `/vehicle-details/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/vehicle-details/[id]`;
    }
  }
}

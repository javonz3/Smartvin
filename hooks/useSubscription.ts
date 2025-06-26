import { useState, useEffect } from 'react';
import SubscriptionService, { SubscriptionStatus, UsageStats } from '@/services/subscriptionService';

export function useSubscription() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  const subscriptionService = SubscriptionService.getInstance();

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [status, usage] = await Promise.all([
        subscriptionService.getSubscriptionStatus(),
        subscriptionService.getUsageStats()
      ]);
      
      setSubscriptionStatus(status);
      setUsageStats(usage);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const canPerformAction = async (action: 'vin_lookup' | 'pdf_export' | 'bulk_processing' | 'analytics') => {
    return await subscriptionService.canPerformAction(action);
  };

  const recordUsage = async (action: 'vin_lookup' | 'pdf_export') => {
    await subscriptionService.recordUsage(action);
    // Refresh usage stats
    const newUsage = await subscriptionService.getUsageStats();
    setUsageStats(newUsage);
  };

  const subscribe = async (planId: string) => {
    const success = await subscriptionService.subscribe(planId);
    if (success) {
      await loadSubscriptionData();
    }
    return success;
  };

  const isPro = subscriptionStatus?.isActive || subscriptionStatus?.isInTrial || false;
  const isInTrial = subscriptionStatus?.isInTrial || false;

  return {
    subscriptionStatus,
    usageStats,
    loading,
    isPro,
    isInTrial,
    canPerformAction,
    recordUsage,
    subscribe,
    refreshSubscription: loadSubscriptionData,
  };
}
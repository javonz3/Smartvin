// This is a mock service for demonstration purposes
// In a real app, you would integrate with RevenueCat

export interface SubscriptionStatus {
  isActive: boolean;
  plan: string | null;
  expiresAt: Date | null;
  trialEndsAt: Date | null;
  isInTrial: boolean;
}

export interface UsageStats {
  vinLookupsUsed: number;
  vinLookupsLimit: number;
  pdfExportsUsed: number;
  pdfExportsLimit: number;
  payPerRequestCredits: number;
}

class SubscriptionService {
  private static instance: SubscriptionService;
  private subscriptionStatus: SubscriptionStatus = {
    isActive: false,
    plan: null,
    expiresAt: null,
    trialEndsAt: null,
    isInTrial: false,
  };
  
  private usageStats: UsageStats = {
    vinLookupsUsed: 0,
    vinLookupsLimit: 3, // Free tier limit
    pdfExportsUsed: 0,
    pdfExportsLimit: 0, // No PDF exports on free tier
    payPerRequestCredits: 0, // Credits for pay-per-request purchases
  };

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    // In a real app, this would check with RevenueCat
    return this.subscriptionStatus;
  }

  async getUsageStats(): Promise<UsageStats> {
    return this.usageStats;
  }

  async canPerformAction(action: 'vin_lookup' | 'pdf_export' | 'bulk_processing' | 'analytics'): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const status = await this.getSubscriptionStatus();
    
    if (status.isActive || status.isInTrial) {
      return { allowed: true };
    }

    switch (action) {
      case 'vin_lookup':
        // Check if user has pay-per-request credits
        if (this.usageStats.payPerRequestCredits > 0) {
          return { allowed: true };
        }
        
        // Check free tier limit
        if (this.usageStats.vinLookupsUsed >= this.usageStats.vinLookupsLimit) {
          return {
            allowed: false,
            reason: 'You\'ve reached your free lookup limit. Purchase a single lookup or upgrade to Pro for unlimited access.'
          };
        }
        return { allowed: true };
        
      case 'pdf_export':
        return {
          allowed: false,
          reason: 'PDF export is a Pro feature. Upgrade to export professional reports.'
        };
        
      case 'bulk_processing':
        return {
          allowed: false,
          reason: 'Bulk VIN processing requires a Pro subscription.'
        };
        
      case 'analytics':
        return {
          allowed: false,
          reason: 'Advanced analytics are available with Pro subscription.'
        };
        
      default:
        return { allowed: false };
    }
  }

  async recordUsage(action: 'vin_lookup' | 'pdf_export'): Promise<void> {
    const status = await this.getSubscriptionStatus();
    
    switch (action) {
      case 'vin_lookup':
        // If user has Pro subscription, don't count against limits
        if (status.isActive || status.isInTrial) {
          break;
        }
        
        // If user has pay-per-request credits, use those first
        if (this.usageStats.payPerRequestCredits > 0) {
          this.usageStats.payPerRequestCredits--;
        } else {
          // Use free tier lookup
          this.usageStats.vinLookupsUsed++;
        }
        break;
        
      case 'pdf_export':
        this.usageStats.pdfExportsUsed++;
        break;
    }
    
    // In a real app, you would sync this with your backend
    console.log('Usage recorded:', action, this.usageStats);
  }

  async subscribe(planId: string): Promise<boolean> {
    try {
      // In a real app, this would trigger RevenueCat purchase flow
      console.log('Subscribing to plan:', planId);
      
      if (planId === 'pay_per_request') {
        // Handle pay-per-request purchase
        this.usageStats.payPerRequestCredits += 1;
        console.log('Added 1 pay-per-request credit');
        return true;
      }
      
      // Handle subscription plans
      const now = new Date();
      const expiresAt = new Date();
      
      switch (planId) {
        case 'monthly':
          expiresAt.setMonth(now.getMonth() + 1);
          break;
        case 'yearly':
          expiresAt.setFullYear(now.getFullYear() + 1);
          break;
      }
      
      this.subscriptionStatus = {
        isActive: true,
        plan: planId,
        expiresAt,
        trialEndsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isInTrial: true,
      };
      
      // Update usage limits for Pro users
      this.usageStats.vinLookupsLimit = -1; // Unlimited
      this.usageStats.pdfExportsLimit = -1; // Unlimited
      
      return true;
    } catch (error) {
      console.error('Subscription error:', error);
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    // In a real app, this would restore purchases from RevenueCat
    console.log('Restoring purchases...');
    return true;
  }

  async cancelSubscription(): Promise<boolean> {
    // In a real app, this would handle cancellation through RevenueCat
    this.subscriptionStatus.isActive = false;
    this.subscriptionStatus.plan = null;
    this.subscriptionStatus.expiresAt = null;
    this.subscriptionStatus.trialEndsAt = null;
    this.subscriptionStatus.isInTrial = false;
    
    // Reset to free tier limits
    this.usageStats.vinLookupsLimit = 3;
    this.usageStats.pdfExportsLimit = 0;
    
    return true;
  }

  async purchasePayPerRequest(): Promise<boolean> {
    // In a real app, this would handle the one-time purchase through RevenueCat
    try {
      this.usageStats.payPerRequestCredits += 1;
      console.log('Pay-per-request credit added. Total credits:', this.usageStats.payPerRequestCredits);
      return true;
    } catch (error) {
      console.error('Pay-per-request purchase error:', error);
      return false;
    }
  }
}

export default SubscriptionService;
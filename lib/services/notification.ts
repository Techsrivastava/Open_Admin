import { toast } from "@/components/ui/use-toast"

class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = "default";
  private audio: HTMLAudioElement | null = null;

  private constructor() {
    console.log('🔔 Initializing NotificationService...');
    if (typeof window !== 'undefined') {
      try {
        console.log('🎵 Creating audio element...');
        this.audio = new Audio('/notification.mp3');
        // Check if audio file is valid
        this.audio.addEventListener('error', (e) => {
          console.error('❌ Audio file error:', e);
          this.audio = null;
        });
        console.log('✅ Audio element created');
      } catch (error) {
        console.error('❌ Failed to initialize notification sound:', error);
        this.audio = null;
      }
      this.init();
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async init() {
    console.log('🔔 Initializing notifications...');
    if (!("Notification" in window)) {
      console.log("❌ This browser does not support notifications");
      return;
    }

    this.permission = await this.requestPermission();
    console.log('🔔 Notification permission status:', this.permission);
  }

  private async requestPermission(): Promise<NotificationPermission> {
    console.log('🔔 Checking notification permission...');
    if (Notification.permission === "granted") {
      console.log('✅ Notifications already granted');
      return "granted";
    }

    try {
      console.log('🔔 Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('🔔 Permission result:', permission);
      return permission;
    } catch (error) {
      console.error("❌ Error requesting notification permission:", error);
      return "denied";
    }
  }

  public async notifyNewLead(lead: {
    firstName: string;
    lastName?: string;
    packageType?: string;
    email: string;
    phone?: string;
  }) {
    console.log('🔔 Starting notification process for lead:', lead);
    
    // Play notification sound if available
    if (this.audio) {
      try {
        console.log('🎵 Attempting to play notification sound...');
        await this.audio.play();
        console.log('✅ Notification sound played');
      } catch (error) {
        console.warn("❌ Could not play notification sound:", error);
      }
    } else {
      console.log('⚠️ No audio element available');
    }

    // Show toast notification in-app
    console.log('📢 Showing toast notification...');
    toast({
      title: "New Lead Received! 🎯",
      description: `${lead.firstName} ${lead.lastName || ''} is interested in ${lead.packageType || 'your packages'}`,
      duration: 5000,
    });
    console.log('✅ Toast notification shown');

    // Show system notification if permitted
    if (this.permission === "granted") {
      try {
        console.log('🔔 Creating system notification...');
        const notification = new Notification("New Lead Alert! 🎯", {
          body: `Name: ${lead.firstName} ${lead.lastName || ''}\nPackage: ${lead.packageType || 'Not specified'}\nEmail: ${lead.email}\nPhone: ${lead.phone || 'Not provided'}`,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: "new-lead",
          requireInteraction: true,
          silent: true
        });
        console.log('✅ System notification created');

        notification.onclick = () => {
          console.log('🔔 Notification clicked');
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error("❌ Error showing notification:", error);
      }
    } else {
      console.log('⚠️ Cannot show system notification - permission not granted');
    }
  }
}

export const notificationService = NotificationService.getInstance(); 
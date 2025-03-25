import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().optional(),
  displayName: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const notificationSchema = z.object({
  emailNotifications: z.boolean().default(true),
  newContentAlerts: z.boolean().default(true),
  weeklyDigest: z.boolean().default(true),
  platformUpdates: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type NotificationFormValues = z.infer<typeof notificationSchema>;

interface ProfileModalProps {
  trigger: React.ReactNode;
}

export default function ProfileModal({ trigger }: ProfileModalProps) {
  const { user, isLoading, refetchUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
      displayName: user?.display_name || "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Notification preferences form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: user?.notification_preferences?.email_notifications ?? true,
      newContentAlerts: user?.notification_preferences?.new_content_alerts ?? true,
      weeklyDigest: user?.notification_preferences?.weekly_digest ?? true,
      platformUpdates: user?.notification_preferences?.platform_updates ?? false,
    },
  });

  // Update form values when user data loads
  useEffect(() => {
    if (user && !isLoading) {
      profileForm.reset({
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        displayName: user.display_name || "",
      });

      notificationForm.reset({
        emailNotifications: user.notification_preferences?.email_notifications ?? true,
        newContentAlerts: user.notification_preferences?.new_content_alerts ?? true,
        weeklyDigest: user.notification_preferences?.weekly_digest ?? true,
        platformUpdates: user.notification_preferences?.platform_updates ?? false,
      });
    }
  }, [user, isLoading, profileForm, notificationForm]);

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      return apiRequest(
        "PATCH",
        '/api/profile',
        data
      );
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      refetchUser();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      console.error("Profile update error:", error);
    },
  });

  // Password update mutation
  const passwordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string, newPassword: string }) => {
      return apiRequest(
        "PATCH",
        '/api/profile/password',
        data
      );
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      if (error.status === 401) {
        toast({
          title: "Error",
          description: "Current password is incorrect.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update password. Please try again.",
          variant: "destructive",
        });
      }
      console.error("Password update error:", error);
    },
  });

  // Notification preferences mutation
  const notificationMutation = useMutation({
    mutationFn: async (data: NotificationFormValues) => {
      return apiRequest(
        "PATCH",
        '/api/profile/notifications',
        data
      );
    },
    onSuccess: () => {
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been updated successfully.",
      });
      refetchUser();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update notification preferences. Please try again.",
        variant: "destructive",
      });
      console.error("Notification preferences update error:", error);
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    profileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    const { currentPassword, newPassword } = data;
    passwordMutation.mutate({ currentPassword, newPassword });
  };

  const onNotificationSubmit = (data: NotificationFormValues) => {
    notificationMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and preferences
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-3 w-full"
          >
            <TabsList className="bg-white border border-gray-200 w-full">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4 w-full">
              <div className="flex items-center gap-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
                <div className="h-14 w-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold">
                  <span>{user?.username?.charAt(0).toUpperCase() || "U"}</span>
                </div>
                <div>
                  <h3 className="font-medium">{user?.display_name || user?.username}</h3>
                  <p className="text-xs text-gray-500">
                    {user?.email}
                  </p>
                  <div className="flex items-center mt-1">
                    <div className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">
                      Active User
                    </div>
                  </div>
                </div>
              </div>
              
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Username</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          This is your public username.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Display Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your display name" />
                        </FormControl>
                        <FormDescription className="text-xs">
                          This is the name displayed to other users.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" disabled={isLoading} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Your email address is used for notifications.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="A short bio about yourself"
                            className="min-h-[60px]"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Tell others a little about yourself.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" size="sm">Update Profile</Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4 w-full">
              <Form {...notificationForm}>
                <form
                  onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={notificationForm.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel className="text-sm font-medium">
                            Email Notifications
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Receive email notifications about your account.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="newContentAlerts"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel className="text-sm font-medium">
                            New Content Alerts
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Get notified when new similar content is available.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="weeklyDigest"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel className="text-sm font-medium">
                            Weekly Digest
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Receive a weekly summary of your content activity.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="platformUpdates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel className="text-sm font-medium">
                            Platform Updates
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Get notified about new features and improvements.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" size="sm">Save Preferences</Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4 w-full">
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Current Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">New Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Must be at least 8 characters with a number.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Confirm New Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit"
                    size="sm"
                    disabled={passwordMutation.isPending}
                  >
                    {passwordMutation.isPending ? "Updating..." : "Change Password"}
                  </Button>
                </form>
              </Form>
              
              <div className="pt-4 mt-4 border-t border-gray-200">
                <h3 className="font-medium text-sm mb-3">Account Management</h3>
                
                <div className="mb-4">
                  <Button 
                    className="text-xs w-full justify-start"
                    variant="default"
                    size="sm"
                  >
                    {user?.is_premium ? (
                      <>
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs mr-2">Premium</span>
                        Manage Subscription
                      </>
                    ) : (
                      'Upgrade to Premium'
                    )}
                  </Button>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full text-xs"
                    size="sm"
                    onClick={async () => {
                      try {
                        await apiRequest("POST", "/api/logout");
                        window.location.href = "/";
                      } catch (error) {
                        toast({
                          title: "Error logging out",
                          description: "Please try again",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Log Out
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full text-xs"
                    size="sm"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
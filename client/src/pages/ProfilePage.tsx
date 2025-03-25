import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider } from "@/components/ui/sidebar";
import CustomSidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import TopBar from "@/components/TopBar";
import MobileNavigation from "@/components/MobileNavigation";
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

export default function ProfilePage() {
  const { user, isLoading, refetchUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        <CustomSidebar user={user} isLoading={isLoading} />
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <TopBar user={user} />
          
          <main className="flex-1 overflow-auto w-full">
            <div style={{width: "calc(100% - 40px)", maxWidth: "1200px"}} className="mx-auto px-4 py-6">
              <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
              
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6 mb-10 w-full"
              >
                <TabsList className="bg-white border border-gray-200">
                  <TabsTrigger value="profile">Profile Information</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-6 w-full">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal information and public profile.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Form {...profileForm}>
                        <form
                          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                          className="space-y-4"
                        >
                          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                            <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold mb-3">
                              <span>{user?.username?.charAt(0).toUpperCase() || "U"}</span>
                            </div>
                            <h3 className="font-medium text-lg">{user?.display_name || user?.username}</h3>
                            <p className="text-sm text-gray-500 mt-1 text-center max-w-xs">
                              {user?.email}
                            </p>
                            <div className="flex items-center space-x-2 mt-3">
                              <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                                Active User
                              </div>
                            </div>
                          </div>

                          <FormField
                            control={profileForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled={isLoading} />
                                </FormControl>
                                <FormDescription>
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
                                <FormLabel>Display Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Your display name" />
                                </FormControl>
                                <FormDescription>
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
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" disabled={isLoading} />
                                </FormControl>
                                <FormDescription>
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
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="A short bio about yourself"
                                    className="min-h-[120px]"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Tell others a little about yourself.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />



                          <Button type="submit">Update Profile</Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications" className="space-y-6 w-full">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>
                        Configure how you want to receive notifications.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Form {...notificationForm}>
                        <form
                          onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}
                          className="space-y-4"
                        >
                          <FormField
                            control={notificationForm.control}
                            name="emailNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Email Notifications
                                  </FormLabel>
                                  <FormDescription>
                                    Receive email notifications about your account and content.
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
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    New Content Alerts
                                  </FormLabel>
                                  <FormDescription>
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
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Weekly Digest
                                  </FormLabel>
                                  <FormDescription>
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
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Platform Updates
                                  </FormLabel>
                                  <FormDescription>
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

                          <Button type="submit">Save Preferences</Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security" className="space-y-6 w-full">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>
                        Manage your account security and password.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                                <FormLabel>Current Password</FormLabel>
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
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="password"
                                    placeholder="••••••••"
                                  />
                                </FormControl>
                                <FormDescription>
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
                                <FormLabel>Confirm New Password</FormLabel>
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
                            disabled={passwordMutation.isPending}
                          >
                            {passwordMutation.isPending ? "Updating..." : "Change Password"}
                          </Button>
                        </form>
                      </Form>
                      
                      <div className="pt-6 mt-6 border-t border-gray-200">
                        <h3 className="font-medium text-base mb-4">Account Management</h3>
                        
                        <div className="mb-6">
                          <h4 className="text-sm font-medium mb-3">Subscription</h4>
                          {user?.is_premium ? (
                            <>
                              <Button 
                                variant="outline" 
                                className="mb-3 border-amber-300 text-amber-700 hover:bg-amber-50"
                              >
                                Cancel Subscription Plan
                              </Button>
                              <p className="text-xs text-gray-500">
                                Your premium subscription will remain active until the end of your current billing period.
                              </p>
                            </>
                          ) : (
                            <>
                              <Button 
                                variant="outline" 
                                className="mb-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 hover:from-blue-600 hover:to-indigo-600"
                              >
                                Upgrade to Premium
                              </Button>
                              <p className="text-xs text-gray-500">
                                Upgrade to premium for advanced features and unlimited content organization.
                              </p>
                            </>
                          )}
                        </div>
                        
                        <div className="mb-8 pt-6 border-t border-gray-100">
                          <h4 className="text-sm font-medium mb-3 text-red-600">Danger Zone</h4>
                          <Button variant="destructive" className="mb-3">
                            Delete Account
                          </Button>
                          <p className="text-xs text-gray-500">
                            This will permanently delete your account and all your data.
                            This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
          
          <MobileNavigation onAddLinkClick={() => {}} />
        </div>
      </div>
    </SidebarProvider>
  );
}
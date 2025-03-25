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
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <h1 className="text-3xl font-bold tracking-tight text-center mb-8">Your Profile</h1>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full flex justify-center bg-gray-100 rounded-xl p-2 space-x-3 border border-gray-200/80 shadow-sm">
                  <TabsTrigger 
                    className="flex-1 py-3.5 px-5 font-medium rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md hover:bg-white/80 text-gray-700" 
                    value="profile"
                  >
                    Profile Information
                  </TabsTrigger>
                  <TabsTrigger 
                    className="flex-1 py-3.5 px-5 font-medium rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md hover:bg-white/80 text-gray-700" 
                    value="notifications"
                  >
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger 
                    className="flex-1 py-3.5 px-5 font-medium rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md hover:bg-white/80 text-gray-700" 
                    value="security"
                  >
                    Security
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-8 w-full bg-white rounded-xl p-10 shadow-md mt-8">
                  <Card className="w-full border-0 shadow-none">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="text-2xl font-bold text-gray-900">Profile Information</CardTitle>
                      <CardDescription className="text-base text-gray-600 mt-3 leading-relaxed">
                        Update your personal information and public profile.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 px-0 mt-4">
                      <Form {...profileForm}>
                        <form
                          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                          className="space-y-8 max-w-md mx-auto"
                        >
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-md font-medium text-gray-800">
                              {user?.email}
                            </p>
                            <div className="inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm">
                              Active User
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
                                  <Input {...field} placeholder="How others will see you" />
                                </FormControl>
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
                                    placeholder="Tell others about yourself"
                                    className="min-h-[120px]"
                                  />
                                </FormControl>
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

                <TabsContent value="notifications" className="space-y-6 w-full bg-white rounded-xl p-10 shadow-md mt-8">
                  <Card className="w-full border-0 shadow-none">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="text-2xl font-bold text-gray-900">Notification Settings</CardTitle>
                      <CardDescription className="text-base text-gray-600 mt-3 leading-relaxed">
                        Control how and when you receive notifications about your account activity.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 px-0 mt-4">
                      <Form {...notificationForm}>
                        <form
                          onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}
                          className="space-y-6"
                        >
                          <FormField
                            control={notificationForm.control}
                            name="emailNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-6 bg-white hover:bg-gray-50 transition-colors">
                                <div className="space-y-2">
                                  <FormLabel className="text-lg font-medium text-gray-900">
                                    Email Notifications
                                  </FormLabel>
                                  <FormDescription className="text-sm text-gray-600">
                                    Receive email notifications about your account activity and content updates.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-primary"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={notificationForm.control}
                            name="newContentAlerts"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-6 bg-white hover:bg-gray-50 transition-colors">
                                <div className="space-y-2">
                                  <FormLabel className="text-lg font-medium text-gray-900">
                                    New Content Alerts
                                  </FormLabel>
                                  <FormDescription className="text-sm text-gray-600">
                                    Get notified when new similar content is available.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-primary"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={notificationForm.control}
                            name="weeklyDigest"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-6 bg-white hover:bg-gray-50 transition-colors">
                                <div className="space-y-2">
                                  <FormLabel className="text-lg font-medium text-gray-900">
                                    Weekly Digest
                                  </FormLabel>
                                  <FormDescription className="text-sm text-gray-600">
                                    Receive a weekly summary of your content activity.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-primary"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={notificationForm.control}
                            name="platformUpdates"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-6 bg-white hover:bg-gray-50 transition-colors">
                                <div className="space-y-2">
                                  <FormLabel className="text-lg font-medium text-gray-900">
                                    Platform Updates
                                  </FormLabel>
                                  <FormDescription className="text-sm text-gray-600">
                                    Get notified about new features and improvements.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-primary"
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

                <TabsContent value="security" className="space-y-6 w-full bg-white rounded-xl p-10 shadow-md mt-8">
                  <Card className="w-full border-0 shadow-none">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="text-2xl font-bold text-gray-900">Security Settings</CardTitle>
                      <CardDescription className="text-base text-gray-600 mt-3 leading-relaxed">
                        Manage your account security and update your password.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 px-0 mt-4">
                      <Form {...passwordForm}>
                        <form
                          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                          className="space-y-6 max-w-md"
                        >
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-medium text-gray-700">Current Password</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20"
                                  />
                                </FormControl>
                                <FormMessage className="text-sm text-red-500" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-medium text-gray-700">New Password</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs text-gray-500">
                                  Must be at least 8 characters with a number.
                                </FormDescription>
                                <FormMessage className="text-sm text-red-500" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-medium text-gray-700">Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20"
                                  />
                                </FormControl>
                                <FormMessage className="text-sm text-red-500" />
                              </FormItem>
                            )}
                          />

                          <Button 
                            type="submit"
                            disabled={passwordMutation.isPending}
                            className="w-full"
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
                                className="mb-3 border-amber-300 text-amber-700 hover:bg-amber-50 w-full"
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
                                className="mb-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 hover:from-blue-600 hover:to-indigo-600 w-full"
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
                          <Button variant="destructive" className="w-full">
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
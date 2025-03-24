import { useState } from "react";
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

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().optional(),
  displayName: z.string().optional(),
});

const notificationSchema = z.object({
  emailNotifications: z.boolean().default(true),
  newContentAlerts: z.boolean().default(true),
  weeklyDigest: z.boolean().default(true),
  platformUpdates: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      bio: "",
      displayName: "",
    },
  });

  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      newContentAlerts: true,
      weeklyDigest: true,
      platformUpdates: false,
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    // In a real app, you would call an API to update the profile
    console.log("Profile data:", data);
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const onNotificationSubmit = (data: NotificationFormValues) => {
    // In a real app, you would call an API to update notification preferences
    console.log("Notification data:", data);
    toast({
      title: "Preferences updated",
      description: "Your notification preferences have been updated successfully.",
    });
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        <CustomSidebar user={user} isLoading={isLoading} />
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <TopBar user={user} />
          
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-6">
              <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
              
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <TabsList className="bg-white border border-gray-200">
                  <TabsTrigger value="profile">Profile Information</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-6">
                  <Card>
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
                          <div className="flex items-center space-x-4 mb-6">
                            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-semibold">
                              {user?.username?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                              <Button variant="outline" size="sm">
                                Change Avatar
                              </Button>
                              <p className="text-xs text-gray-500 mt-1">
                                JPG, GIF or PNG. 1MB max.
                              </p>
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
                
                <TabsContent value="notifications" className="space-y-6">
                  <Card>
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
                
                <TabsContent value="security" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>
                        Manage your account security and password.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input
                            id="current-password"
                            type="password"
                            placeholder="••••••••"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            placeholder="••••••••"
                          />
                          <p className="text-xs text-gray-500">
                            Password must be at least 8 characters and include a number.
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="••••••••"
                          />
                        </div>
                        
                        <Button>Change Password</Button>
                      </div>
                      
                      <div className="pt-6 border-t border-gray-200">
                        <h3 className="font-medium text-base mb-4">Account Management</h3>
                        
                        <Button variant="destructive" className="mb-2">
                          Delete Account
                        </Button>
                        <p className="text-xs text-gray-500">
                          This will permanently delete your account and all your data.
                          This action cannot be undone.
                        </p>
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
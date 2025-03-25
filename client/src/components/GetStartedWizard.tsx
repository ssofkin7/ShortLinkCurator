import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export default function GetStartedWizard() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const isMobile = useIsMobile();

  // Show wizard automatically for new users
  // In a real app, we'd check a DB field like "onboardingCompleted"
  useEffect(() => {
    const hasSeenWizard = localStorage.getItem("linkOrbit_hasSeenWizard");
    if (!hasSeenWizard) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    // Mark wizard as seen
    localStorage.setItem("linkOrbit_hasSeenWizard", "true");
    setOpen(false);
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Welcome to LinkOrbit!</DialogTitle>
              <DialogDescription>
                Your personal space for organizing all your favorite online content.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center my-8">
              <div className="h-16 w-16 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M8 12a4 4 0 0 1 8 0" />
                  <path d="M18 12a6 6 0 0 0-12 0" />
                  <path d="M16 8l-4 4-4-4" />
                </svg>
              </div>
              <p className="text-center max-w-md">
                LinkOrbit helps you save, organize, and discover content from platforms like YouTube, TikTok, Instagram, Twitter, and many more.
              </p>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Add Your First Link</DialogTitle>
              <DialogDescription>
                Save links to your favorite content with one click
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center my-6 space-y-4">
              <div className="rounded-md border border-gray-200 p-4 w-full bg-gray-50">
                <div className="flex gap-2 items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="font-medium">Click the "Add Link" button</span>
                </div>
                <p className="text-sm text-gray-600 ml-7">Paste the URL of any content you want to save.</p>
              </div>
              <div className="rounded-md border border-gray-200 p-4 w-full bg-gray-50">
                <div className="flex gap-2 items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                  </svg>
                  <span className="font-medium">AI-Powered Organization</span>
                </div>
                <p className="text-sm text-gray-600 ml-7">Our AI automatically tags and categorizes your content.</p>
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Create Custom Tabs</DialogTitle>
              <DialogDescription>
                Organize your library your way
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center my-6">
              <div className="w-full rounded-md border border-gray-200 p-4 bg-gray-50 mb-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Custom Tabs</span> let you organize links however you want.
                </p>
                <ul className="mt-3 space-y-2 ml-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Work Research
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Recipes
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Learning Resources
                  </li>
                </ul>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Create tabs by clicking the "+ New Tab" button in the sidebar.
                </p>
              </div>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <DialogHeader>
              <DialogTitle>You're all set!</DialogTitle>
              <DialogDescription>
                Start exploring LinkOrbit's features
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center my-6 space-y-6">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div className="text-center max-w-md">
                <p className="mb-2">Remember to check the notification bell for helpful tips!</p>
                <p className="text-sm text-gray-600">
                  If you ever need help, click on your profile icon for support options.
                </p>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={`${isMobile ? 'max-w-[350px]' : 'max-w-[500px]'} p-6`}>
        {getStepContent()}
        
        <DialogFooter className="flex justify-between mt-6">
          <div className="flex gap-2">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={prevStep}
              >
                Back
              </Button>
            )}
            <Button 
              onClick={nextStep} 
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {step < totalSteps ? "Next" : "Get Started"}
            </Button>
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            {step} of {totalSteps}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
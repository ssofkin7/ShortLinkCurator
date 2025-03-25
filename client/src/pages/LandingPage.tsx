
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="h-16 w-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white animate-pulse">
            <circle cx="12" cy="12" r="8" />
            <path d="M8 12a4 4 0 0 1 8 0" />
            <path d="M18 12a6 6 0 0 0-12 0" />
          </svg>
        </div>
        
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent sm:text-6xl mb-6 animate-fade-in">
          Your Content Universe
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Save and organize your favorite short-form content from TikTok, YouTube Shorts, and Instagram Reels.
        </p>

        <div className="flex gap-6 justify-center mb-20">
          <Link href="/register">
            <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-200">
              Get Started Free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:bg-gray-50">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Smart Organization</h3>
            <p className="text-gray-600">Automatically categorize and tag your content for instant access</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Cross-Platform</h3>
            <p className="text-gray-600">Save content from multiple platforms in one unified space</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
                <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Custom Collections</h3>
            <p className="text-gray-600">Create personal collections for different interests and goals</p>
          </div>
        </div>
      </div>
    </div>
  );
}

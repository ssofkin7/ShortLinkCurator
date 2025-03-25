
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <circle cx="12" cy="12" r="8" />
            <path d="M8 12a4 4 0 0 1 8 0" />
            <path d="M18 12a6 6 0 0 0-12 0" />
          </svg>
        </div>
        
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
          Organize Your Content Universe
        </h1>
        
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          Save and organize your favorite short-form content from TikTok, YouTube Shorts, and Instagram Reels all in one place.
        </p>

        <div className="flex gap-4 justify-center mb-16">
          <Link href="/register">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Get Started Free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-lg mb-2">Smart Organization</h3>
            <p className="text-gray-600">Automatically categorize and tag your content for easy access</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-lg mb-2">Cross-Platform</h3>
            <p className="text-gray-600">Save content from multiple platforms in one unified space</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-lg mb-2">Custom Collections</h3>
            <p className="text-gray-600">Create personal collections for different interests and goals</p>
          </div>
        </div>
      </div>
    </div>
  );
}

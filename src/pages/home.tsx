import { useState } from "react";
import { FigmaGenerator } from "@/components/figma/FigmaGenerator";
import { Features } from "@/components/figma/Features";

export default function Home() {
  const [activeSection, setActiveSection] = useState<'generator' | 'features' | 'docs'>('generator');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                <svg width="24" height="24" viewBox="0 0 20 20" className="text-white">
                  <path
                    d="M7.084 20c.884-.001 1.731-.353 2.356-.978s.977-1.472.978-2.356v-3.334H7.084a3.34 3.34 0 0 0-2.356.978c-.625.625-.977 1.472-.978 2.356a3.34 3.34 0 0 0 .978 2.356c.625.625 1.472.977 2.356.978z"
                    fill="currentColor"
                  />
                  <path
                    d="M3.75 9.998c.001-.884.353-1.731.978-2.356a3.34 3.34 0 0 1 2.356-.978h3.334v6.666H7.084a3.34 3.34 0 0 1-2.356-.977c-.625-.625-.977-1.472-.978-2.355z"
                    fill="currentColor"
                  />
                  <path
                    d="M3.75 3.334c.001-.884.353-1.731.978-2.356A3.34 3.34 0 0 1 7.084 0h3.334v6.666H7.084c-.884-.001-1.731-.352-2.356-.977s-.977-1.472-.978-2.355z"
                    fill="currentColor"
                  />
                  <path
                    d="M10.418 0h3.334a3.34 3.34 0 0 1 3.334 3.334 3.34 3.34 0 0 1-3.334 3.334h-3.334V0z"
                    fill="currentColor"
                  />
                  <path
                    d="M17.084 9.998c-.001.884-.352 1.731-.977 2.356a3.34 3.34 0 0 1-4.712 0 3.34 3.34 0 0 1-.977-2.356c.001-.884.352-1.731.977-2.356a3.34 3.34 0 0 1 2.356-.978c.884.001 1.731.353 2.355.978s.976 1.472.977 2.356z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Figma-to-Code Generator</h1>
                <p className="text-sm text-gray-500">Fixed & Refactored - AI-Powered Components</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setActiveSection('features')}
                className={`font-medium transition-colors ${
                  activeSection === 'features' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => setActiveSection('generator')}
                className={`font-medium transition-colors ${
                  activeSection === 'generator' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Generator
              </button>
              <button
                onClick={() => setActiveSection('docs')}
                className={`font-medium transition-colors ${
                  activeSection === 'docs' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Documentation
              </button>
            </nav>

            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeSection === 'features' && <Features />}
        {activeSection === 'generator' && <FigmaGenerator />}
        {activeSection === 'docs' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Documentation</h2>
            <p className="text-gray-600">Documentation section coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
}

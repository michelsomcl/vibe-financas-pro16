
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Project
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              A clean foundation ready for your next big idea. Start building something amazing.
            </p>
          </div>
          
          <Card className="p-8 mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-lg"></div>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Ready to Begin</h2>
                <p className="text-gray-600">This is your empty canvas. What will you create today?</p>
              </div>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Started
              </Button>
            </div>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6 bg-white/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-500 rounded"></div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Feature One</h3>
              <p className="text-sm text-gray-600">Add your first feature here</p>
            </Card>
            
            <Card className="p-6 bg-white/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className="w-6 h-6 bg-purple-500 rounded"></div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Feature Two</h3>
              <p className="text-sm text-gray-600">Add your second feature here</p>
            </Card>
            
            <Card className="p-6 bg-white/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Feature Three</h3>
              <p className="text-sm text-gray-600">Add your third feature here</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

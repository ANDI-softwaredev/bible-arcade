
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scan, Sparkles, Smartphone, QrCode, BookOpen, Compass, Globe, Zap } from "lucide-react";

function MobileAR() {
  const arExperiences = [
    { 
      id: 1, 
      title: "3D Bible Scenes", 
      description: "Experience biblical scenes in augmented reality",
      icon: BookOpen 
    },
    { 
      id: 2, 
      title: "Scripture Places", 
      description: "Visit historical biblical locations in AR",
      icon: Globe 
    },
    { 
      id: 3, 
      title: "Characters AR", 
      description: "Interact with biblical figures in your space",
      icon: Sparkles 
    },
    { 
      id: 4, 
      title: "Interactive Maps", 
      description: "Explore 3D maps of biblical journeys",
      icon: Compass 
    },
  ];

  return (
    <Layout>
      <div className="starry-background min-h-screen -mt-6 -mx-6 p-6 relative overflow-hidden">
        {/* Starry background overlay */}
        <div className="absolute inset-0 z-0">
          <div className="stars-container"></div>
          <div className="twinkling-stars"></div>
          <div className="glow-overlay"></div>
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                Mobile AR Experience
              </h1>
              <p className="text-lg text-indigo-200 mt-1">
                Explore biblical content in augmented reality
              </p>
            </div>
            <Badge className="bg-indigo-600 hover:bg-indigo-700 py-1 px-3 text-xs uppercase">New Feature</Badge>
          </div>
          
          <div className="p-6 rounded-lg glass-card backdrop-blur-xl border border-white/20 shadow-xl">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="md:w-2/3">
                <h2 className="text-2xl font-bold mb-4 text-white flex items-center">
                  <Smartphone className="h-6 w-6 mr-3 text-indigo-300" />
                  Connect Your Mobile Device
                </h2>
                <p className="text-indigo-100 mb-4">
                  Access powerful augmented reality features directly from your mobile device.
                  Point your camera at study materials to bring them to life with interactive 3D models,
                  historical context, and immersive experiences.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-indigo-200">
                    <Zap className="h-5 w-5 mr-2 text-indigo-400" />
                    <span>Instant connection with your Biblico account</span>
                  </div>
                  <div className="flex items-center text-indigo-200">
                    <Sparkles className="h-5 w-5 mr-2 text-indigo-400" />
                    <span>Visualize biblical scenes in your environment</span>
                  </div>
                  <div className="flex items-center text-indigo-200">
                    <Scan className="h-5 w-5 mr-2 text-indigo-400" />
                    <span>Scan printed materials for interactive overlays</span>
                  </div>
                </div>
                <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700">
                  Download Mobile App
                </Button>
              </div>
              
              <div className="md:w-1/3 flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 p-2 bg-white rounded-lg shadow-lg flex items-center justify-center">
                    <QrCode className="h-24 w-24 text-indigo-900" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">Available Experiences</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {arExperiences.map((exp) => (
              <Card key={exp.id} className="overflow-hidden border border-purple-500/20 bg-background/10 backdrop-blur-md text-white">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-indigo-500/30 flex items-center justify-center">
                      <exp.icon className="h-5 w-5 text-indigo-300" />
                    </div>
                    <CardTitle className="text-md">{exp.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-indigo-200">{exp.description}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" size="sm" className="w-full bg-indigo-900/50 border border-indigo-500/30 hover:bg-indigo-800/60 text-white">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Launch Experience
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 p-6 rounded-lg glass-card backdrop-blur-xl border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-full bg-indigo-600/40 flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-white">1</span>
                </div>
                <h4 className="text-lg font-medium text-white">Download App</h4>
                <p className="text-indigo-200 text-sm">
                  Get the Biblico AR app from your device's app store
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-full bg-indigo-600/40 flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-white">2</span>
                </div>
                <h4 className="text-lg font-medium text-white">Scan QR Code</h4>
                <p className="text-indigo-200 text-sm">
                  Connect your desktop account with the mobile app
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-full bg-indigo-600/40 flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-white">3</span>
                </div>
                <h4 className="text-lg font-medium text-white">Experience AR</h4>
                <p className="text-indigo-200 text-sm">
                  Point your camera at study materials or open experiences
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default MobileAR;

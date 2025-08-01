import { Mic, Globe, Users, Zap, Star, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import GoogleLoginButton from '../components/GoogleLoginButton';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();


  // useEffect(() => {
  //   if (currentUser) {
  //     navigate('/dashboard');
  //   }
  // }, [currentUser, navigate]);

  const handleExploreClick = () => {
    // Navigate to your desired page after login, e.g., '/explore' or '/dashboard'
    navigate('/explore');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300`}>
      <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 min-h-screen">
        {/* Header */}
        <header className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Talkitive
            </span>
          </div>

        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {"Connect with 10M+ users worldwide"}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
                Voice Connects
              </span>
              <br />
              <span className="text-gray-800 dark:text-white">Hearts Globally</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Swipe through voice cards, connect instantly with strangers worldwide, and discover meaningful
              conversations that transcend borders.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {currentUser ? (
                // If user is logged in, show the "Explore" button
                <Button onClick={handleExploreClick} size="lg">
                  <Zap className="mr-2 h-5 w-5" /> Explore Now
                </Button>
              ) : (
                // If user is not logged in, show the Google Login button
                <GoogleLoginButton />
              )}
              <Button
                variant="outline"
                size="lg"
                className="rounded-2xl px-8 py-4 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm bg-transparent"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Floating Cards Preview */}
            <div className="relative max-w-md mx-auto">
              <div className="absolute -top-4 -left-8 w-64 h-80 bg-gradient-to-br from-pink-400 to-purple-500 rounded-3xl shadow-2xl transform rotate-12 opacity-20"></div>
              <div className="absolute -top-2 -right-6 w-64 h-80 bg-gradient-to-br from-orange-400 to-pink-500 rounded-3xl shadow-2xl transform -rotate-6 opacity-30"></div>
              <div className="relative w-64 h-80 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl mx-auto p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"></div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">Sarah, 24</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">🇺🇸 New York</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-2xl p-4 mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    "Let's talk about travel adventures and favorite coffee spots!"
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <Star className="w-3 h-3 mr-1 text-yellow-500" />
                    Level 12
                  </span>
                  <span>🎨 Art • 🎵 Music</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-white">Why Choose Talkitive?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience the future of social connection through voice-first interactions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Global Connections</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Connect with people from over 190 countries. Break language barriers and cultural boundaries through
                authentic voice conversations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Anonymous & Safe</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Stay anonymous until you're ready to share more. Our advanced moderation keeps conversations respectful
                and enjoyable.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">XP & Rewards</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Level up through meaningful conversations. Earn XP, unlock exclusive features, and show off your social
                achievements.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-orange-500 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Join the Global Voice Revolution</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">10M+</div>
                <div className="text-lg opacity-90">Active Users</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">190+</div>
                <div className="text-lg opacity-90">Countries</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">50M+</div>
                <div className="text-lg opacity-90">Conversations</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">4.8★</div>
                <div className="text-lg opacity-90">User Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-white">
              Ready to Start Talking?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
              Your next meaningful conversation is just one swipe away. Join millions discovering the world through
              voice.
            </p>
            <GoogleLoginButton />
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Talkitive
              </span>
            </div>

            <div className="flex space-x-8 text-sm text-gray-600 dark:text-gray-400">
              <a href="#" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                About
              </a>
              <a href="#" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                Support
              </a>
            </div>
          </div>

          <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
            © 2024 Talkitive. Connecting voices, bridging worlds.
          </div>
        </footer>
      </div>
    </div>
  )
}

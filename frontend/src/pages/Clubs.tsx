import React from 'react';
import { Users, Star, MapPin, Calendar } from 'lucide-react';

const Clubs: React.FC = () => {
  const clubs = [
    {
      id: 1,
      name: 'Tech Innovators',
      members: 1247,
      rating: 4.8,
      location: 'Global',
      nextEvent: '2024-01-15',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Connect with tech enthusiasts and innovators from around the world.',
      tags: ['Technology', 'Innovation', 'Startups']
    },
    {
      id: 2,
      name: 'Art & Culture',
      members: 892,
      rating: 4.6,
      location: 'Europe',
      nextEvent: '2024-01-20',
      image: 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Explore diverse cultures and artistic expressions together.',
      tags: ['Art', 'Culture', 'History']
    },
    {
      id: 3,
      name: 'Adventure Seekers',
      members: 2156,
      rating: 4.9,
      location: 'Worldwide',
      nextEvent: '2024-01-18',
      image: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'For those who love outdoor adventures and extreme sports.',
      tags: ['Adventure', 'Outdoors', 'Travel']
    },
    {
      id: 4,
      name: 'Bookworms United',
      members: 745,
      rating: 4.7,
      location: 'Global',
      nextEvent: '2024-01-25',
      image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Passionate readers sharing their love for literature.',
      tags: ['Books', 'Literature', 'Discussion']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Clubs</h1>
          <p className="text-gray-600">Join communities that match your interests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <div key={club.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src={club.image} 
                  alt={club.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">{club.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{club.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{club.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{club.members.toLocaleString()} members</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{club.location}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Next event: {new Date(club.nextEvent).toLocaleDateString()}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {club.tags.map((tag, index) => (
                    <span key={index} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  Join Club
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Clubs;
import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { MapPin, Users, Star, ChevronRight, Check } from 'lucide-react'
import { blink } from '../blink/client'

interface OnboardingProps {
  onComplete: () => void
}

interface Course {
  id: string
  name: string
  location: string
  image_url: string
  community_rating: number
  difficulty_rating: number
  description?: string
}

interface Contact {
  name: string
  phone: string
  email?: string
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1)
  const [userData, setUserData] = useState({
    name: '',
    location: '',
    contacts: [] as Contact[],
    selectedCourses: [] as string[]
  })
  const [nearbyCourses, setNearbyCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending')

  // Step 1: Get user's name
  const handleNameSubmit = () => {
    if (userData.name.trim()) {
      setStep(2)
    }
  }

  // Step 2: Request contacts permission
  const requestContactsPermission = async () => {
    setLoading(true)
    try {
      // Simulate contact import (in real app, would use Contacts API)
      const mockContacts: Contact[] = [
        { name: 'John Smith', phone: '+1234567890', email: 'john@example.com' },
        { name: 'Sarah Johnson', phone: '+1234567891', email: 'sarah@example.com' },
        { name: 'Mike Wilson', phone: '+1234567892', email: 'mike@example.com' },
        { name: 'Emily Davis', phone: '+1234567893', email: 'emily@example.com' },
        { name: 'Chris Brown', phone: '+1234567894', email: 'chris@example.com' }
      ]
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setUserData(prev => ({ ...prev, contacts: mockContacts }))
      setStep(3)
    } catch (error) {
      console.error('Error importing contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Get location
  const requestLocation = async () => {
    setLoading(true)
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            
            // Reverse geocoding simulation (in real app, would use Google Maps API)
            const mockLocation = 'San Francisco, CA'
            setUserData(prev => ({ ...prev, location: mockLocation }))
            setLocationPermission('granted')
            
            // Fetch nearby courses based on location
            await fetchNearbyCourses(mockLocation)
            setStep(4)
            setLoading(false)
          },
          (error) => {
            console.error('Location error:', error)
            setLocationPermission('denied')
            setStep(4) // Continue to manual location entry
            setLoading(false)
          }
        )
      } else {
        setLocationPermission('denied')
        setStep(4)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error getting location:', error)
      setLocationPermission('denied')
      setStep(4)
      setLoading(false)
    }
  }

  const handleManualLocation = async () => {
    if (userData.location.trim()) {
      setLoading(true)
      await fetchNearbyCourses(userData.location)
      setStep(4)
      setLoading(false)
    }
  }

  const fetchNearbyCourses = async (location: string) => {
    try {
      // Fetch courses from database based on location
      const courses = await blink.db.courses.list({
        limit: 6,
        orderBy: { community_rating: 'desc' }
      })
      
      // Filter courses based on location (simplified logic)
      const locationBasedCourses = courses.filter(course => {
        if (location.toLowerCase().includes('california') || location.toLowerCase().includes('ca')) {
          return course.location.toLowerCase().includes('california') || 
                 course.location.toLowerCase().includes('ca')
        }
        return true // Show all courses if location doesn't match
      }).slice(0, 6)
      
      setNearbyCourses(locationBasedCourses)
    } catch (error) {
      console.error('Error fetching courses:', error)
      // Fallback to mock data
      setNearbyCourses([
        {
          id: '1',
          name: 'Pebble Beach Golf Links',
          location: 'Pebble Beach, CA',
          image_url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
          community_rating: 9.8,
          difficulty_rating: 9.8
        },
        {
          id: '2',
          name: 'Spyglass Hill Golf Course',
          location: 'Pebble Beach, CA',
          image_url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400',
          community_rating: 9.2,
          difficulty_rating: 9.2
        },
        {
          id: '3',
          name: 'TPC Harding Park',
          location: 'San Francisco, CA',
          image_url: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400',
          community_rating: 8.7,
          difficulty_rating: 8.7
        }
      ])
    }
  }

  const toggleCourseSelection = (courseId: string) => {
    setUserData(prev => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(courseId)
        ? prev.selectedCourses.filter(id => id !== courseId)
        : [...prev.selectedCourses, courseId]
    }))
  }

  const completeOnboarding = async () => {
    setLoading(true)
    try {
      const user = await blink.auth.me()
      
      // Save user profile data
      await blink.db.user_profiles.create({
        id: `profile_${user.id}`,
        userId: user.id,
        displayName: userData.name,
        location: userData.location,
        onboardingCompleted: "1", // SQLite boolean as string
        createdAt: new Date().toISOString()
      })

      // Save initial course interests
      for (const courseId of userData.selectedCourses) {
        await blink.db.user_course_rankings.create({
          id: `ranking_${user.id}_${courseId}_${Date.now()}`,
          user_id: user.id,
          course_id: courseId,
          ranking: null, // Will be set when user actually ranks
          status: 'want_to_try',
          created_at: new Date().toISOString()
        })
      }

      // Save contacts for friend suggestions (in real app, would hash/encrypt)
      for (const contact of userData.contacts) {
        await blink.db.user_contacts.create({
          id: `contact_${user.id}_${Date.now()}_${Math.random()}`,
          user_id: user.id,
          contact_name: contact.name,
          contact_phone: contact.phone,
          contact_email: contact.email || null,
          created_at: new Date().toISOString()
        })
      }

      onComplete()
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Welcome to Beli!</CardTitle>
              <p className="text-gray-600">Let's get you set up to discover and rank amazing golf courses</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  What should we call you?
                </label>
                <Input
                  placeholder="Enter your name"
                  value={userData.name}
                  onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                  className="text-lg"
                />
              </div>
              <Button 
                onClick={handleNameSubmit} 
                className="w-full"
                disabled={!userData.name.trim()}
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Find Your Golf Buddies</CardTitle>
              <p className="text-gray-600">We'll help you connect with friends who also love golf</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Why import contacts?</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• See friends' course rankings</li>
                  <li>• Get personalized recommendations</li>
                  <li>• Compare your golf experiences</li>
                </ul>
              </div>
              <Button 
                onClick={requestContactsPermission} 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Importing Contacts...' : 'Import Contacts'}
                <Users className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setStep(3)}
                className="w-full"
              >
                Skip for now
              </Button>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl">Where's Your Home Base?</CardTitle>
              <p className="text-gray-600">We'll suggest courses near you and track your golf travels</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {locationPermission === 'pending' && (
                <Button 
                  onClick={requestLocation} 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Getting Location...' : 'Use Current Location'}
                  <MapPin className="w-4 h-4 ml-2" />
                </Button>
              )}
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </div>
              </div>

              <div>
                <Input
                  placeholder="Enter your city, state"
                  value={userData.location}
                  onChange={(e) => setUserData(prev => ({ ...prev, location: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualLocation()}
                />
                <Button 
                  onClick={handleManualLocation}
                  className="w-full mt-2"
                  disabled={!userData.location.trim() || loading}
                >
                  {loading ? 'Finding Courses...' : 'Continue'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Courses Near You</CardTitle>
              <p className="text-gray-600">
                Select a few courses you'd like to try or have played before
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {nearbyCourses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => toggleCourseSelection(course.id)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      userData.selectedCourses.includes(course.id)
                        ? 'border-green-500 ring-2 ring-green-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="aspect-video relative">
                      <img
                        src={course.image_url}
                        alt={course.name}
                        className="w-full h-full object-cover"
                      />
                      {userData.selectedCourses.includes(course.id) && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm">{course.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">{course.location}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs ml-1">{course.community_rating}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {course.difficulty_rating >= 9 ? 'Championship' : course.difficulty_rating >= 7 ? 'Advanced' : 'Intermediate'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Selected {userData.selectedCourses.length} courses
                </p>
                <Button 
                  onClick={completeOnboarding}
                  className="w-full max-w-sm"
                  disabled={loading}
                >
                  {loading ? 'Setting Up Your Profile...' : 'Complete Setup'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNum <= step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {stepNum < step ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                {stepNum < 4 && (
                  <div
                    className={`w-8 h-0.5 ${
                      stepNum < step ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {renderStep()}
      </div>
    </div>
  )
}

export default Onboarding
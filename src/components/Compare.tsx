import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, ArrowRight, Trophy, Star, MapPin, Users, Shuffle } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { blink } from '../blink/client'

interface Course {
  id: string
  name: string
  location: string
  image: string
  rating: number
  friendsRating?: number
  description: string
}

interface Comparison {
  course1: Course
  course2: Course
}

export default function Compare() {
  const [currentComparison, setCurrentComparison] = useState<Comparison | null>(null)
  const [comparisonsCompleted, setComparisonsCompleted] = useState(0)
  const [totalComparisons] = useState(10) // Target comparisons for this session
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)

  useEffect(() => {
    loadNextComparison()
  }, [loadNextComparison])

  const [allCourses, setAllCourses] = useState<Course[]>([])

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      const courses = await blink.db.courses.list({
        limit: 20,
        orderBy: { communityRating: 'desc' }
      })

      const formattedCourses: Course[] = courses.map(course => ({
        id: course.id,
        name: course.name,
        location: course.location,
        image: course.imageUrl || 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop',
        rating: Math.round(Number(course.communityRating) * 10) / 10,
        friendsRating: Math.round((Number(course.communityRating) - 0.1) * 10) / 10,
        description: course.description || 'Amazing golf course experience.'
      }))

      setAllCourses(formattedCourses)
    } catch (error) {
      console.error('Error loading courses:', error)
      // Fallback to mock data
      const fallbackCourses: Course[] = [
        {
          id: '1',
          name: 'Pebble Beach Golf Links',
          location: 'Pebble Beach, CA',
          image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop',
          rating: 9.2,
          friendsRating: 9.1,
          description: 'Iconic oceanside course with breathtaking views and challenging holes.'
        },
        {
          id: '2',
          name: 'Augusta National Golf Club',
          location: 'Augusta, GA',
          image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop',
          rating: 9.8,
          friendsRating: 9.7,
          description: 'Home of the Masters Tournament, featuring pristine conditions and azaleas.'
        }
      ]
      setAllCourses(fallbackCourses)
    }
  }

  const loadNextComparison = useCallback(async () => {
    if (allCourses.length < 2) return
    
    setLoading(true)
    setSelectedCourse(null)
    
    // Simulate loading
    setTimeout(() => {
      // Randomly select two different courses
      const shuffled = [...allCourses].sort(() => 0.5 - Math.random())
      const course1 = shuffled[0]
      const course2 = shuffled[1]
      
      setCurrentComparison({ course1, course2 })
      setLoading(false)
    }, 500)
  }, [allCourses])

  const handleCourseSelection = (courseId: string) => {
    setSelectedCourse(courseId)
    
    // Simulate saving the comparison
    setTimeout(() => {
      setComparisonsCompleted(prev => prev + 1)
      
      if (comparisonsCompleted + 1 < totalComparisons) {
        loadNextComparison()
      } else {
        // Show completion state
        setCurrentComparison(null)
      }
    }, 1000)
  }

  const CourseCard = ({ course, isSelected, onSelect }: { 
    course: Course
    isSelected: boolean
    onSelect: () => void 
  }) => (
    <Card 
      className={`overflow-hidden cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'ring-2 ring-primary shadow-lg scale-105' 
          : selectedCourse 
            ? 'opacity-50 scale-95' 
            : 'hover:shadow-md hover:scale-102'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={course.image}
            alt={course.name}
            className="w-full h-48 object-cover"
          />
          {isSelected && (
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <div className="bg-primary text-primary-foreground p-3 rounded-full">
                <Trophy className="w-6 h-6" />
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{course.name}</h3>
          <div className="flex items-center text-muted-foreground text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            {course.location}
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {course.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{course.rating}</span>
              </div>
              {course.friendsRating && (
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{course.friendsRating}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-primary rounded-full animate-pulse mx-auto"></div>
          <p className="text-muted-foreground">Loading comparison...</p>
        </div>
      </div>
    )
  }

  if (!currentComparison) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
          <div className="p-4">
            <h1 className="text-2xl font-bold">Compare</h1>
          </div>
        </div>

        <div className="p-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6 max-w-sm">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Great job!</h2>
              <p className="text-muted-foreground">
                You've completed {totalComparisons} comparisons. Your rankings are being updated!
              </p>
            </div>
            <Button onClick={() => {
              setComparisonsCompleted(0)
              loadNextComparison()
            }}>
              <Shuffle className="w-4 h-4 mr-2" />
              Start New Session
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const progress = (comparisonsCompleted / totalComparisons) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Compare</h1>
            <Badge variant="secondary">
              {comparisonsCompleted}/{totalComparisons}
            </Badge>
          </div>
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Question */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold mb-2">Which course did you like better?</h2>
          <p className="text-muted-foreground">
            Help us understand your preferences to improve your rankings
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <CourseCard
            course={currentComparison.course1}
            isSelected={selectedCourse === currentComparison.course1.id}
            onSelect={() => !selectedCourse && handleCourseSelection(currentComparison.course1.id)}
          />
          
          <div className="flex items-center justify-center md:hidden">
            <div className="text-2xl font-bold text-muted-foreground">VS</div>
          </div>
          
          <CourseCard
            course={currentComparison.course2}
            isSelected={selectedCourse === currentComparison.course2.id}
            onSelect={() => !selectedCourse && handleCourseSelection(currentComparison.course2.id)}
          />
        </div>

        {/* Skip Option */}
        <div className="text-center mt-8">
          <Button 
            variant="ghost" 
            onClick={loadNextComparison}
            disabled={!!selectedCourse}
          >
            Skip this comparison
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-12 p-4 bg-muted/50 rounded-lg max-w-2xl mx-auto">
          <h3 className="font-semibold mb-2">How it works</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Compare courses you've played or want to play</li>
            <li>• Your choices help build your personal ranking</li>
            <li>• Skip if you haven't experienced both courses</li>
            <li>• Complete more comparisons for better recommendations</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
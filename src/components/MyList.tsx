import { useState, useEffect } from 'react'
import { Plus, Star, MapPin, Clock, TrendingUp, Users, Heart } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'

interface Course {
  id: string
  name: string
  location: string
  image: string
  rating?: number
  myRating?: number
  addedAt: string
  playedAt?: string
  trending?: boolean
  friendsRating?: number
}

export default function MyList() {
  const [rankedCourses, setRankedCourses] = useState<Course[]>([])
  const [wantToTry, setWantToTry] = useState<Course[]>([])
  const [recommendations, setRecommendations] = useState<Course[]>([])
  const [trending, setTrending] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMyLists()
  }, [])

  const loadMyLists = async () => {
    // Mock data for now
    const mockRanked: Course[] = [
      {
        id: '1',
        name: 'Pebble Beach Golf Links',
        location: 'Pebble Beach, CA',
        image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop',
        rating: 9.2,
        myRating: 10,
        addedAt: '2024-01-15',
        playedAt: '2024-01-10'
      },
      {
        id: '2',
        name: 'Augusta National Golf Club',
        location: 'Augusta, GA',
        image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop',
        rating: 9.8,
        myRating: 9,
        addedAt: '2024-01-12',
        playedAt: '2024-01-08'
      },
      {
        id: '3',
        name: 'St. Andrews Old Course',
        location: 'St. Andrews, Scotland',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
        rating: 9.5,
        myRating: 8,
        addedAt: '2024-01-10',
        playedAt: '2024-01-05'
      }
    ]

    const mockWantToTry: Course[] = [
      {
        id: '4',
        name: 'Torrey Pines Golf Course',
        location: 'La Jolla, CA',
        image: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400&h=300&fit=crop',
        rating: 8.7,
        addedAt: '2024-01-18',
        friendsRating: 8.5
      },
      {
        id: '5',
        name: 'Whistling Straits',
        location: 'Kohler, WI',
        image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop',
        rating: 9.1,
        addedAt: '2024-01-16',
        friendsRating: 9.2
      }
    ]

    const mockRecommendations: Course[] = [
      {
        id: '6',
        name: 'Bandon Dunes Golf Resort',
        location: 'Bandon, OR',
        image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop',
        rating: 8.9,
        addedAt: '2024-01-19',
        friendsRating: 8.8
      },
      {
        id: '7',
        name: 'Kiawah Island Golf Resort',
        location: 'Kiawah Island, SC',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
        rating: 8.6,
        addedAt: '2024-01-17',
        friendsRating: 8.4
      }
    ]

    const mockTrending: Course[] = [
      {
        id: '8',
        name: 'TPC Sawgrass',
        location: 'Ponte Vedra Beach, FL',
        image: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400&h=300&fit=crop',
        rating: 8.8,
        addedAt: '2024-01-20',
        trending: true,
        friendsRating: 8.7
      },
      {
        id: '9',
        name: 'Bethpage Black',
        location: 'Farmingdale, NY',
        image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop',
        rating: 8.5,
        addedAt: '2024-01-19',
        trending: true,
        friendsRating: 8.3
      }
    ]

    setTimeout(() => {
      setRankedCourses(mockRanked)
      setWantToTry(mockWantToTry)
      setRecommendations(mockRecommendations)
      setTrending(mockTrending)
      setLoading(false)
    }, 1000)
  }

  const CourseCard = ({ course, showRanking = false }: { course: Course; showRanking?: boolean }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={course.image}
            alt={course.name}
            className="w-full h-32 object-cover"
          />
          {course.myRating && showRanking && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-lg flex items-center space-x-1">
              <span className="text-sm font-bold">#{course.myRating}</span>
            </div>
          )}
          {course.trending && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-lg flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs">Trending</span>
            </div>
          )}
        </div>
        
        <div className="p-3">
          <h3 className="font-semibold text-sm">{course.name}</h3>
          <div className="flex items-center text-muted-foreground text-xs mt-1">
            <MapPin className="w-3 h-3 mr-1" />
            {course.location}
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-3">
              {course.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{course.rating}</span>
                </div>
              )}
              {course.friendsRating && (
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3 text-blue-500" />
                  <span className="text-xs font-medium">{course.friendsRating}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {course.playedAt ? 'Played' : 'Added'} {new Date(course.playedAt || course.addedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded-lg"></div>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">My List</h1>
            <Button size="sm" className="rounded-full">
              <Plus className="w-4 h-4 mr-1" />
              Add Course
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="ranked" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ranked" className="text-xs">
              Ranked ({rankedCourses.length})
            </TabsTrigger>
            <TabsTrigger value="want-to-try" className="text-xs">
              Want to Try ({wantToTry.length})
            </TabsTrigger>
            <TabsTrigger value="recs" className="text-xs">
              Recs ({recommendations.length})
            </TabsTrigger>
            <TabsTrigger value="trending" className="text-xs">
              Trending ({trending.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ranked" className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">My Ranked Courses</h2>
                <Badge variant="secondary">{rankedCourses.length} courses</Badge>
              </div>
              {rankedCourses.map((course) => (
                <CourseCard key={course.id} course={course} showRanking />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="want-to-try" className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Want to Try</h2>
                <Badge variant="secondary">{wantToTry.length} courses</Badge>
              </div>
              {wantToTry.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recs" className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recommendations</h2>
                <Badge variant="secondary">{recommendations.length} courses</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Based on your rankings and friends' preferences
              </p>
              {recommendations.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Trending</h2>
                <Badge variant="secondary">{trending.length} courses</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Popular courses in the community right now
              </p>
              {trending.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { Plus, Star, MapPin, Clock, TrendingUp, Users, Heart } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { blink } from '../blink/client'

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
  const [user, setUser] = useState<any>(null)
  const [rankedCourses, setRankedCourses] = useState<Course[]>([])
  const [wantToTry, setWantToTry] = useState<Course[]>([])
  const [recommendations, setRecommendations] = useState<Course[]>([])
  const [trending, setTrending] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (user) {
      loadMyLists()
    }
  }, [user])

  const loadMyLists = async () => {
    try {
      setLoading(true)

      // Load all golf courses
      const allCourses = await blink.db.golfCourses.list({
        orderBy: { rating: 'desc' }
      })

      // Load user's course rankings
      const userRankings = await blink.db.userCourseRankings.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })

      // Process courses into different categories
      const rankedCoursesData: Course[] = []
      const wantToTryData: Course[] = []
      const recommendationsData: Course[] = []
      const trendingData: Course[] = []

      // Map user rankings to courses
      const userRankingMap = new Map()
      userRankings.forEach(ranking => {
        userRankingMap.set(ranking.courseId, ranking)
      })

      allCourses.forEach(course => {
        const userRanking = userRankingMap.get(course.id)
        
        const courseData: Course = {
          id: course.id,
          name: course.name,
          location: course.location,
          image: course.imageUrl || course.image_url,
          rating: course.rating,
          addedAt: userRanking?.createdAt || course.createdAt,
          playedAt: userRanking?.status === 'ranked' ? userRanking.updatedAt : undefined,
          myRating: userRanking?.ranking,
          friendsRating: course.rating,
          trending: Math.random() > 0.7 // Simple trending logic
        }

        if (userRanking) {
          if (userRanking.status === 'ranked') {
            rankedCoursesData.push(courseData)
          } else if (userRanking.status === 'want_to_try') {
            wantToTryData.push(courseData)
          }
        } else {
          // Courses not in user's list become recommendations or trending
          if (courseData.trending) {
            trendingData.push(courseData)
          } else {
            recommendationsData.push(courseData)
          }
        }
      })

      // Sort ranked courses by user ranking
      rankedCoursesData.sort((a, b) => (a.myRating || 0) - (b.myRating || 0))

      setRankedCourses(rankedCoursesData.slice(0, 10))
      setWantToTry(wantToTryData.slice(0, 10))
      setRecommendations(recommendationsData.slice(0, 10))
      setTrending(trendingData.slice(0, 10))
      
    } catch (error) {
      console.error('Error loading lists:', error)
      // Fallback to empty arrays
      setRankedCourses([])
      setWantToTry([])
      setRecommendations([])
      setTrending([])
    } finally {
      setLoading(false)
    }
  }

  const addCourseToWantToTry = async (courseId: string) => {
    try {
      await blink.db.userCourseRankings.create({
        id: `ranking_${Date.now()}`,
        userId: user.id,
        courseId: courseId,
        status: 'want_to_try',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      // Reload lists to reflect changes
      loadMyLists()
    } catch (error) {
      console.error('Error adding course:', error)
    }
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

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm mx-auto p-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Sign in to see your list</h2>
            <p className="text-muted-foreground">
              Create your personal golf course rankings and wishlist
            </p>
          </div>
          <Button onClick={() => blink.auth.login()} className="w-full">
            Sign In to Continue
          </Button>
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
              {rankedCourses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No ranked courses yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Start comparing courses to build your rankings</p>
                </div>
              ) : (
                rankedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} showRanking />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="want-to-try" className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Want to Try</h2>
                <Badge variant="secondary">{wantToTry.length} courses</Badge>
              </div>
              {wantToTry.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No courses in your wishlist yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Add courses you want to play</p>
                </div>
              ) : (
                wantToTry.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))
              )}
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
                <div key={course.id} className="relative">
                  <CourseCard course={course} />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="absolute top-2 right-2 z-10"
                    onClick={() => addCourseToWantToTry(course.id)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
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
                <div key={course.id} className="relative">
                  <CourseCard course={course} />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="absolute top-2 right-2 z-10"
                    onClick={() => addCourseToWantToTry(course.id)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
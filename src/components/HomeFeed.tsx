import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share, Star, MapPin, Users } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'

interface FeedItem {
  id: string
  type: 'ranking' | 'comparison' | 'recommendation'
  user: {
    name: string
    avatar?: string
  }
  course: {
    name: string
    location: string
    image: string
    rating?: number
  }
  action: string
  timestamp: string
  likes: number
  comments: number
}

export default function HomeFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeed()
  }, [])

  const loadFeed = async () => {
    // Mock feed data
    const mockFeed: FeedItem[] = [
      {
        id: '1',
        type: 'ranking',
        user: { name: 'Alex Chen' },
        course: {
          name: 'Pebble Beach Golf Links',
          location: 'Pebble Beach, CA',
          image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop',
          rating: 10
        },
        action: 'ranked this course #1',
        timestamp: '2 hours ago',
        likes: 12,
        comments: 3
      },
      {
        id: '2',
        type: 'comparison',
        user: { name: 'Sarah Johnson' },
        course: {
          name: 'Augusta National Golf Club',
          location: 'Augusta, GA',
          image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop',
          rating: 9
        },
        action: 'compared 5 courses and ranked this #2',
        timestamp: '4 hours ago',
        likes: 8,
        comments: 1
      },
      {
        id: '3',
        type: 'recommendation',
        user: { name: 'Mike Rodriguez' },
        course: {
          name: 'Torrey Pines Golf Course',
          location: 'La Jolla, CA',
          image: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400&h=300&fit=crop',
          rating: 8
        },
        action: 'added to want-to-try list',
        timestamp: '1 day ago',
        likes: 15,
        comments: 7
      },
      {
        id: '4',
        type: 'ranking',
        user: { name: 'Emma Wilson' },
        course: {
          name: 'St. Andrews Old Course',
          location: 'St. Andrews, Scotland',
          image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
          rating: 9
        },
        action: 'ranked this course #3',
        timestamp: '2 days ago',
        likes: 22,
        comments: 5
      }
    ]

    setTimeout(() => {
      setFeedItems(mockFeed)
      setLoading(false)
    }, 1000)
  }

  const handleLike = (itemId: string) => {
    setFeedItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, likes: item.likes + 1 }
          : item
      )
    )
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-48 bg-muted rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">Beli</h1>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                8 friends
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="p-4 space-y-4">
        {feedItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* User Header */}
              <div className="p-4 pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {item.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm">{item.user.name}</span>
                      <span className="text-muted-foreground text-sm">{item.action}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                  </div>
                </div>
              </div>

              {/* Course Image */}
              <div className="relative">
                <img
                  src={item.course.image}
                  alt={item.course.name}
                  className="w-full h-48 object-cover"
                />
                {item.course.rating && (
                  <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-lg flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{item.course.rating}</span>
                  </div>
                )}
              </div>

              {/* Course Info */}
              <div className="p-4 pt-3">
                <h3 className="font-semibold text-lg">{item.course.name}</h3>
                <div className="flex items-center text-muted-foreground text-sm mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {item.course.location}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(item.id)}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      {item.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {item.comments}
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Share className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Load More */}
        <div className="text-center py-8">
          <Button variant="outline" onClick={loadFeed}>
            Load More
          </Button>
        </div>
      </div>
    </div>
  )
}
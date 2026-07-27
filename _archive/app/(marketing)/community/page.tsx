'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, Send, Loader2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

export default function CommunityPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // New Post State
  const [newPostContent, setNewPostContent] = useState('')
  const [posting, setPosting] = useState(false)
  
  // Comment State Map
  const [comments, setComments] = useState<Record<string, string>>({})
  const [commenting, setCommenting] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchProfile()
    loadPosts()
  }, [])

  async function fetchProfile() {
    try {
      const res = await fetch('/api/profile')
      const data = await res.json()
      if (data.ok) setUser(data.data)
    } catch {}
  }

  async function loadPosts() {
    try {
      const res = await fetch('/api/community/posts')
      const data = await res.json()
      if (data.ok) setPosts(data.data)
    } catch {
      toast.error('Failed to load community feed')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to create a post')
      router.push('/login?callbackUrl=/community')
      return
    }
    if (!newPostContent.trim()) return

    setPosting(true)
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPostContent })
      })
      const data = await res.json()
      if (data.ok) {
        setNewPostContent('')
        loadPosts() // reload feed
        toast.success('Posted successfully!')
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Failed to create post')
    } finally {
      setPosting(false)
    }
  }

  async function handleLike(postId: string) {
    if (!user) {
      toast.error('Please login to like a post')
      router.push('/login?callbackUrl=/community')
      return
    }

    try {
      // Optimistic update
      setPosts(current => current.map(p => {
        if (p.id === postId) {
          const isLiked = p.likes.some((l: any) => l.userId === user.id)
          return {
            ...p,
            _count: { ...p._count, likes: p._count.likes + (isLiked ? -1 : 1) },
            likes: isLiked ? p.likes.filter((l: any) => l.userId !== user.id) : [...p.likes, { userId: user.id }]
          }
        }
        return p
      }))

      await fetch(`/api/community/posts/${postId}/like`, { method: 'POST' })
    } catch {
      toast.error('Failed to like post')
    }
  }

  async function handleComment(postId: string) {
    if (!user) {
      toast.error('Please login to comment')
      router.push('/login?callbackUrl=/community')
      return
    }

    const text = comments[postId]
    if (!text?.trim()) return

    setCommenting(prev => ({ ...prev, [postId]: true }))
    try {
      const res = await fetch(`/api/community/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      })
      const data = await res.json()
      if (data.ok) {
        setComments(prev => ({ ...prev, [postId]: '' }))
        loadPosts() // reload feed
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Failed to post comment')
    } finally {
      setCommenting(prev => ({ ...prev, [postId]: false }))
    }
  }

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin text-orange-600 mx-auto" /></div>

  return (
    <div className="container py-10 max-w-2xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-800">Devotee Community</h1>
        <p className="text-slate-500 mt-2">Connect, share thoughts, and discuss Sanatan Dharma.</p>
      </div>

      {/* CREATE POST */}
      <Card className="mb-8 border-orange-100 shadow-sm">
        <CardContent className="p-4">
          <form onSubmit={handleCreatePost}>
            <div className="flex gap-4">
              <Avatar className="h-10 w-10 border">
                <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                  {user ? user.fullName?.charAt(0) || 'U' : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <textarea
                  value={newPostContent}
                  onChange={e => setNewPostContent(e.target.value)}
                  placeholder={user ? `What's on your mind, ${user.fullName?.split(' ')[0]}?` : "Login to share your thoughts..."}
                  className="w-full resize-none border-0 focus:ring-0 text-lg p-2 bg-transparent"
                  rows={2}
                  disabled={!user}
                />
                <div className="flex justify-between items-center border-t pt-3">
                  <Button type="button" variant="ghost" size="sm" className="text-slate-500 hover:text-orange-600">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Photo (Coming Soon)
                  </Button>
                  <Button type="submit" disabled={posting || !user || !newPostContent.trim()} className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6">
                    {posting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Post'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* FEED */}
      <div className="space-y-6">
        {posts.map(post => {
          const isLiked = user && post.likes?.some((l: any) => l.userId === user.id)
          
          return (
            <Card key={post.id} className="border-slate-200 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="p-5">
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10 border">
                      <AvatarFallback className="bg-slate-100 font-bold text-slate-700">
                        {post.author.fullName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm text-slate-800">{post.author.fullName || 'Anonymous Devotee'}</p>
                      <p className="text-xs text-slate-400">{formatDistanceToNow(new Date(post.createdAt))} ago</p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-slate-700 text-[15px] whitespace-pre-wrap">{post.content}</p>
                  
                  {/* Stats */}
                  <div className="flex justify-between items-center mt-4 text-xs text-slate-500 border-b pb-3">
                    <span>{post._count?.likes || 0} Likes</span>
                    <span>{post._count?.comments || 0} Comments</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleLike(post.id)}
                      className={`flex-1 ${isLiked ? 'text-orange-600 hover:text-orange-700 bg-orange-50' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                      Like
                    </Button>
                    <Button variant="ghost" className="flex-1 text-slate-600 hover:bg-slate-100" onClick={() => {
                       document.getElementById(`comment-${post.id}`)?.focus()
                    }}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Comment
                    </Button>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="bg-slate-50 p-4 border-t">
                  <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto">
                    {post.comments?.map((comment: any) => (
                      <div key={comment.id} className="flex gap-3 text-sm">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-slate-200 text-xs font-bold text-slate-600">
                            {comment.author.fullName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white px-3 py-2 rounded-2xl border flex-1">
                          <p className="font-bold text-xs text-slate-800">{comment.author.fullName || 'User'}</p>
                          <p className="text-slate-700">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleComment(post.id) }} className="flex gap-2">
                    <Input
                      id={`comment-${post.id}`}
                      placeholder={user ? "Write a comment..." : "Login to comment"}
                      value={comments[post.id] || ''}
                      onChange={e => setComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                      disabled={!user || commenting[post.id]}
                      className="rounded-full bg-white border-slate-200"
                    />
                    <Button 
                      type="submit" 
                      disabled={!user || !comments[post.id]?.trim() || commenting[post.id]}
                      size="icon" 
                      className="rounded-full bg-orange-600 hover:bg-orange-700 text-white shrink-0"
                    >
                      {commenting[post.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {posts.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-xl border">
            <MessageCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No posts yet. Be the first to start a discussion!</p>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { useConversations } from '@/hooks/realtime/useConversations'
import { markThreadRead } from '@/app/actions/messages'
import { ConversationList } from '@/components/chat/ConversationList'
import { MessageThread } from '@/components/chat/MessageThread'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function MessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const initialJobId = searchParams.get('job')
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    initialJobId
  )
  const [showList, setShowList] = useState(!initialJobId)

  const { conversations, loading } = useConversations()

  useEffect(() => {
    if (selectedJobId) {
      router.push(`?job=${selectedJobId}`, { scroll: false })
    }
  }, [selectedJobId, router])

  const selectedConvo = conversations.find((c) => c.job.id === selectedJobId)

  const handleMarkRead = async (jobId: string) => {
    try {
      await markThreadRead(jobId)
    } catch (error) {
      console.error('Error marking thread as read:', error)
    }
  }

  return (
    <main className="min-h-0 flex-1 overflow-hidden">
      {/* Mobile: List View */}
      {showList && (
        <div className="flex h-full flex-col lg:hidden">
          <ConversationList
            conversations={conversations}
            selectedJobId={selectedJobId}
            currentUserId={user?.id || ''}
            onSelect={(jobId) => {
              setSelectedJobId(jobId)
              setShowList(false)
            }}
            loading={loading}
            isEmpty="No active conversations. Conversations appear once an employee claims your job."
          />
        </div>
      )}

      {/* Mobile: Thread View */}
      {!showList && selectedConvo && (
        <div className="flex h-full flex-col lg:hidden">
          <div className="border-b bg-white p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowList(true)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          <MessageThread
            jobId={selectedConvo.job.id}
            otherPartyName={
              selectedConvo.job.worker_profile?.full_name || 'Employee'
            }
            jobAddress={
              selectedConvo.job.location_address || 'No address'
            }
            currentUserId={user?.id || ''}
            onMarkRead={handleMarkRead}
          />
        </div>
      )}

      {/* Desktop: Two-column layout */}
      <div className="hidden h-full grid-cols-[320px_1fr] gap-4 p-4 lg:grid">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <ConversationList
            conversations={conversations}
            selectedJobId={selectedJobId}
            currentUserId={user?.id || ''}
            onSelect={setSelectedJobId}
            loading={loading}
            isEmpty="No active conversations. Conversations appear once an employee claims your job."
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {selectedConvo ? (
            <MessageThread
              jobId={selectedConvo.job.id}
              otherPartyName={
                selectedConvo.job.worker_profile?.full_name || 'Employee'
              }
              jobAddress={
                selectedConvo.job.location_address || 'No address'
              }
              currentUserId={user?.id || ''}
              onMarkRead={handleMarkRead}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

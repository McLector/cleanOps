'use client'

import { useEffect, useState, useRef } from 'react'
import { useJobMessages } from '@/hooks/realtime/useJobMessages'
import { sendMessage } from '@/app/actions/messages'
import { format } from 'date-fns'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface MessageThreadProps {
  jobId: string
  otherPartyName: string
  jobAddress: string
  currentUserId: string
  onMarkRead: (jobId: string) => void
}

export function MessageThread({
  jobId,
  otherPartyName,
  jobAddress,
  currentUserId,
  onMarkRead,
}: MessageThreadProps) {
  const [messageContent, setMessageContent] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, loading } = useJobMessages(jobId)

  // Mark thread as read on mount and when new messages arrive
  useEffect(() => {
    onMarkRead(jobId)
  }, [jobId, messages, onMarkRead])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return

    setSending(true)
    try {
      await sendMessage(jobId, messageContent)
      setMessageContent('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col rounded-none shadow-md sm:rounded-lg"
      style={{
        backgroundColor: 'var(--md-surface)',
      }}
    >
      {/* Header */}
      <div
        data-testid="message-thread-header"
        className="min-w-0 border-b px-4 py-3 sm:px-6 sm:py-4"
        style={{
          borderColor: 'var(--md-divider)',
        }}
      >
        <h3
          className="truncate text-base font-semibold sm:text-lg"
          style={{ color: 'var(--md-on-surface)' }}
        >
          {otherPartyName}
        </h3>
        <p
          className="truncate text-sm"
          style={{ color: 'var(--md-on-surface-muted)' }}
        >
          {jobAddress}
        </p>
      </div>

      {/* Messages Area */}
      <div data-testid="message-thread-scroll" className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p
              className="text-sm"
              style={{ color: 'var(--md-on-surface-muted)' }}
            >
              Send the first message to coordinate the job.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  data-testid={`message-bubble-${message.id}`}
                  className={`max-w-[min(82vw,28rem)] rounded-lg px-3 py-2 sm:px-4 ${
                    isOwn
                      ? 'rounded-br-none'
                      : 'rounded-bl-none'
                  }`}
                  style={{
                    backgroundColor: isOwn
                      ? 'var(--md-primary-500)'
                      : 'var(--md-surface-variant)',
                    color: isOwn
                      ? 'var(--md-on-primary)'
                      : 'var(--md-on-surface)',
                  }}
                >
                  {!isOwn && (
                    <p
                      className="text-xs font-semibold mb-1"
                      style={{
                        color: 'var(--md-on-surface-muted)',
                      }}
                    >
                      {otherPartyName}
                    </p>
                  )}
                  <p className="text-sm break-words">{message.content}</p>
                  <p
                    className="text-xs mt-1 opacity-70"
                  >
                    {format(new Date(message.created_at), 'HH:mm')}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        data-testid="message-thread-composer"
        className="border-t p-3 sm:p-4"
        style={{
          borderColor: 'var(--md-divider)',
        }}
      >
        <div className="flex items-end gap-2">
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (Shift+Enter for new line)"
            className="min-w-0 flex-1 resize-none rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 sm:px-4"
            style={{
              borderColor: 'var(--md-divider)',
              backgroundColor: 'var(--md-background)',
              color: 'var(--md-on-surface)',
              '--tw-ring-color': 'var(--md-primary-500)',
            } as React.CSSProperties}
            rows={3}
            disabled={sending}
            aria-label="Message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={sending || !messageContent.trim()}
            className="h-10 w-10 shrink-0 p-0 sm:h-auto sm:w-auto sm:px-4"
            style={{
              backgroundColor: sending ? 'var(--md-primary-200)' : 'var(--md-primary-500)',
              color: sending ? 'var(--md-on-primary-container)' : 'var(--md-on-primary)',
            }}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

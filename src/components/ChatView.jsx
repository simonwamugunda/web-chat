import { useEffect, useMemo, useRef, useState } from 'react'
import { subscribeMessages, sendMessage, getRoom } from '../lib/chat'

function formatTime(ts) {
  if (!ts) return ''
  // Firestore Timestamp
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Helper to get initials
function getInitials(name) {
  if (!name) return '?'
  return name.trim().slice(0, 2).toUpperCase()
}

// Helper to get a consistent background color based on string
function getAvatarColor(str) {
  if (!str) return '#00a884'
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    '#128c7e', '#075e54', '#34b7f1', '#25d366', 
    '#3b5998', '#ea4335', '#fbbc05', '#4285f4',
    '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
    '#009688', '#4caf50', '#ff5722', '#795548'
  ]
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

// Helper to get a consistent text color for senders in group chat
function getSenderColor(name) {
  if (!name) return '#00a884'
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
    '#009688', '#4caf50', '#ff5722', '#795548',
    '#00bcd4', '#03a9f4', '#2196f3', '#ff9800',
    '#ff5722', '#e040fb', '#00e676', '#ff3d00'
  ]
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

export default function ChatView({
  roomId,
  user,
  onRequireRoom,
  onBack,
}) {
  const [messages, setMessages] = useState([])
  const [room, setRoom] = useState(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    if (!roomId) {
      setRoom(null)
      return
    }
    getRoom(roomId).then((r) => {
      setRoom(r)
    })
  }, [roomId])

  useEffect(() => {
    if (!roomId) return
    const unsub = subscribeMessages(roomId, setMessages)
    return () => unsub?.()
  }, [roomId])

  useEffect(() => {
    // Scroll to bottom on new messages
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages.length])

  async function onSend(e) {
    e.preventDefault()
    if (!roomId) {
      onRequireRoom?.()
      return
    }
    if (!user) return

    const trimmed = text.trim()
    if (!trimmed) return

    try {
      setBusy(true)
      await sendMessage({
        roomId,
        text: trimmed,
        createdByUid: user.uid,
        createdByName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      })
      setText('')
    } finally {
      setBusy(false)
    }
  }

  if (!roomId) {
    return (
      <div className="landingScreen">
        <div className="landingContent">
          <div className="landingLogo">
            <svg viewBox="0 0 24 24" width="80" height="80" fill="currentColor">
              <path d="M12.003 2C6.477 2 2 6.477 2 12.003c0 1.91.537 3.692 1.466 5.213L2 22l4.902-1.286c1.47.814 3.15 1.289 4.935 1.289 5.526 0 10.003-4.477 10.003-10.003C21.84 6.477 17.363 2 12.003 2zm5.858 14.103c-.252.712-1.462 1.305-2.014 1.386-.502.074-1.158.133-3.356-.775-2.81-1.16-4.59-4.02-4.73-4.207-.14-.188-1.134-1.506-1.134-2.873 0-1.367.716-2.037.97-2.307.252-.27.55-.337.733-.337.183 0 .367.002.527.01.167.008.39-.063.61.465.226.54.773 1.884.84 2.02.067.137.11.297.018.48-.09.18-.137.29-.274.45-.137.16-.29.357-.413.48-.137.137-.28.287-.12.563.16.276.71 1.17 1.52 1.89.1.09.19.17.28.25.71.63 1.31.83 1.61.96.28.12.44.1.61-.09.17-.19.73-.85.92-1.14.19-.29.38-.24.64-.14.26.1.1.1 1.66.88.1.05.2.1.3.15.77.38 1.28.58 1.46.9.18.32.18 1.84-.07 2.55z"/>
            </svg>
          </div>
          <h1 className="landingTitle">GDG WhatsApp Group</h1>
          <p className="landingSubtitle">
            Send and receive messages in real-time. Keep your conversations synced across all devices.
          </p>
          <div className="landingDivider" />
          <div className="landingFooter">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            End-to-end encrypted
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat">
      {/* Chat Header */}
      <div className="chatHeader">
        <div className="chatHeaderLeft">
          <button 
            type="button" 
            className="chatHeaderBackBtn" 
            onClick={onBack}
            title="Back to chats"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <div 
            className="chatHeaderAvatar" 
            style={{ backgroundColor: getAvatarColor(room?.name) }}
          >
            {getInitials(room?.name)}
          </div>
          <div className="chatHeaderMeta">
            <div className="chatHeaderTitle">{room?.name || 'Loading...'}</div>
            <div className="chatHeaderSubtitle">Group Chat</div>
          </div>
        </div>
        <div className="chatHeaderRight">
          <button type="button" className="headerActionBtn" title="Search messages">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
          <button type="button" className="headerActionBtn" title="Menu">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chatMessages" ref={listRef}>
        {messages.length === 0 ? (
          <div className="empty">
            <span className="emptyText">No messages yet. Say hello!</span>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.createdByUid === user?.uid
            return (
              <div key={m.id} className={mine ? 'msgRow msgRow--mine' : 'msgRow'}>
                <div className={mine ? 'bubble bubble--mine' : 'bubble'}>
                  {!mine && (
                    <div 
                      className="bubbleSender" 
                      style={{ color: getSenderColor(m.createdByName) }}
                    >
                      {m.createdByName}
                    </div>
                  )}
                  <div className="bubbleText">{m.text}</div>
                  <div className="bubbleTimeRow">
                    <span className="bubbleTime">{formatTime(m.createdAt)}</span>
                    {mine && (
                      <span className="checkmark" title="Sent">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Chat Composer */}
      <form className="composer" onSubmit={onSend}>
        <div className="composerActions">
          <button type="button" className="composerActionBtn" title="Emojis">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14H11v-2h2v2zm0-4H11V7h2v5z"/>
            </svg>
          </button>
          <button type="button" className="composerActionBtn" title="Attach">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M16.5 6v11.5c0 2.21-2.24 4-5 4s-5-1.79-5-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H8v9.5c0 1.66 1.34 3 3 3s3-1.34 3-3V5c0-2.48-1.79-4.5-4-4.5S6 2.52 6 5v12.5c0 3.59 2.41 6.5 5.5 6.5s6.5-2.91 6.5-6.5V6h-1.5z"/>
            </svg>
          </button>
        </div>
        <input
          className="composerInput"
          placeholder="Type a message"
          value={text}
          disabled={busy}
          onChange={(e) => setText(e.target.value)}
        />
        <button 
          className="composerButton" 
          type="submit" 
          disabled={busy || !text.trim()}
          title="Send message"
        >
          {busy ? (
            <span className="sendingSpinner" />
          ) : (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          )}
        </button>
      </form>
    </div>
  )
}


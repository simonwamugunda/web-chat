import { useState, useEffect } from 'react'
import { subscribeRooms, createRoom } from '../lib/chat'
import { auth } from '../lib/firebase'

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

export default function Sidebar({ selectedRoomId, onSelectRoomId, user }) {
  const [rooms, setRooms] = useState([])
  const [activeTab, setActiveTab] = useState('rooms') // 'rooms' | 'create-room'
  const [searchQuery, setSearchQuery] = useState('')
  const [newRoomName, setNewRoomName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = subscribeRooms(setRooms)
    return () => unsub?.()
  }, [])

  const filteredRooms = rooms.filter((r) =>
    (r.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function handleCreateRoom(e) {
    e.preventDefault()
    if (!user) return
    const trimmed = newRoomName.trim()
    if (!trimmed) return

    try {
      setBusy(true)
      setError(null)
      const roomId = await createRoom({ name: trimmed, createdByUid: user.uid })
      setNewRoomName('')
      setActiveTab('rooms')
      onSelectRoomId(roomId)
    } catch (err) {
      setError(err?.message || 'Failed to create room')
    } finally {
      setBusy(false)
    }
  }

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      auth.signOut()
    }
  }

  return (
    <div className="sidebar">
      {activeTab === 'rooms' ? (
        <>
          {/* Sidebar Header */}
          <div className="sidebarHeader">
            <div className="userProfile">
              <div 
                className="userAvatar" 
                style={{ backgroundColor: getAvatarColor(user?.displayName || user?.email) }}
              >
                {getInitials(user?.displayName || user?.email || 'U')}
              </div>
              <div className="userInfo">
                <div className="userName">{user?.displayName || user?.email?.split('@')[0] || 'User'}</div>
                <div className="userStatus">Online</div>
              </div>
            </div>
            <div className="headerActions">
              <button 
                type="button" 
                className="actionBtn" 
                title="Create New Room"
                onClick={() => setActiveTab('create-room')}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
              <button 
                type="button" 
                className="actionBtn" 
                title="Sign Out"
                onClick={handleSignOut}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="searchBarContainer">
            <div className="searchBar">
              <svg className="searchIcon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="text"
                placeholder="Search or start a new chat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Rooms List */}
          <div className="roomsList">
            {filteredRooms.length === 0 ? (
              <div className="emptyState">
                <p>{searchQuery ? 'No rooms match your search' : 'No rooms available'}</p>
              </div>
            ) : (
              filteredRooms.map((r) => {
                const isActive = r.id === selectedRoomId
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={`roomItem ${isActive ? 'roomItem--active' : ''}`}
                    onClick={() => onSelectRoomId(r.id)}
                  >
                    <div 
                      className="roomAvatar" 
                      style={{ backgroundColor: getAvatarColor(r.name) }}
                    >
                      {getInitials(r.name)}
                    </div>
                    <div className="roomMeta">
                      <div className="roomNameRow">
                        <span className="roomName">{r.name}</span>
                        <span className="roomTime">Group</span>
                      </div>
                      <div className="roomLastMsg">Click to open this group chat</div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </>
      ) : (
        <>
          {/* Create Room Header */}
          <div className="sidebarHeader sidebarHeader--create">
            <button 
              type="button" 
              className="backBtn" 
              onClick={() => {
                setActiveTab('rooms')
                setError(null)
                setNewRoomName('')
              }}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            </button>
            <div className="sidebarHeaderTitle">New Group</div>
          </div>

          {/* Create Room Form */}
          <div className="createRoomContainer">
            <form onSubmit={handleCreateRoom} className="createRoomForm">
              <div className="avatarPreviewContainer">
                <div 
                  className="roomAvatar roomAvatar--large"
                  style={{ backgroundColor: getAvatarColor(newRoomName || 'New Group') }}
                >
                  {getInitials(newRoomName || 'NG')}
                </div>
              </div>

              <div className="inputGroup">
                <label htmlFor="roomNameInput">Group Subject</label>
                <input
                  id="roomNameInput"
                  type="text"
                  className="createRoomInput"
                  placeholder="Provide a group subject"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  disabled={busy}
                  maxLength={25}
                  required
                  autoFocus
                />
                <span className="charCount">{25 - newRoomName.length} characters remaining</span>
              </div>

              {error && <div className="formError">{error}</div>}

              <button 
                type="submit" 
                className="submitRoomBtn"
                disabled={busy || !newRoomName.trim()}
              >
                {busy ? (
                  'Creating...'
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Create Group
                  </>
                )}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

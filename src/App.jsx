import { useEffect, useState } from 'react'

import './App.css'

import { subscribeAuth } from './lib/firebase'

import Sidebar from './components/Sidebar'
import LoginPage from './components/LoginPage'
import ChatView from './components/ChatView'

export default function App() {
  const [user, setUser] = useState(null)
  const [selectedRoomId, setSelectedRoomId] = useState(null)

  useEffect(() => {
    const unsub = subscribeAuth((u) => {
      setUser(u)
    })

    return () => unsub?.()
  }, [])

  return (
    <div className="appContainer">
      {/* Green background strip behind the app on desktop */}
      <div className="appBackgroundStrip" />
      
      <div className={`appShell ${selectedRoomId ? 'appShell--room-selected' : ''}`}>
        {user ? (
          <>
            <Sidebar
              selectedRoomId={selectedRoomId}
              onSelectRoomId={setSelectedRoomId}
              user={user}
            />

            <div className="centerPanel">
              <ChatView
                roomId={selectedRoomId}
                user={user}
                onRequireRoom={() => {}}
                onBack={() => setSelectedRoomId(null)}
              />
            </div>
          </>
        ) : (
          <div className="loginWrap">
            <LoginPage />
          </div>
        )}
      </div>
    </div>
  )
}


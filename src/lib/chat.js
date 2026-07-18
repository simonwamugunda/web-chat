import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore'
import { onSnapshot } from 'firebase/firestore'
import {
  collection as fsCollection,
  query as fsQuery,
  orderBy as fsOrderBy,
  addDoc as fsAddDoc,
  serverTimestamp as fsServerTimestamp,
  doc as fsDoc,
  getDoc,
  limit as fsLimit,
} from 'firebase/firestore'

import { db } from './firebase'

// Data model
// rooms/{roomId} => { name, createdAt, createdByUid }
// rooms/{roomId}/messages/{messageId} => { text, createdAt, createdByUid, createdByName }

export const ROOMS_COLLECTION = 'rooms'
export const MESSAGES_SUBCOLLECTION = 'messages'

export function roomsQuery() {
  return fsQuery(
    fsCollection(db, ROOMS_COLLECTION),
    fsOrderBy('createdAt', 'desc'),
    fsLimit(50)
  )
}

export function subscribeRooms(callback) {
  return onSnapshot(roomsQuery(), (snap) => {
    const rooms = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(rooms)
  })
}

export async function createRoom({ name, createdByUid }) {
  const docRef = await fsAddDoc(fsCollection(db, ROOMS_COLLECTION), {
    name,
    createdAt: fsServerTimestamp(),
    createdByUid,
  })
  return docRef.id
}

export function messagesQuery(roomId) {
  return fsQuery(
    fsCollection(db, ROOMS_COLLECTION, roomId, MESSAGES_SUBCOLLECTION),
    fsOrderBy('createdAt', 'asc'),
    fsLimit(100)
  )
}

export function subscribeMessages(roomId, callback) {
  if (!roomId) return () => {}
  const q = messagesQuery(roomId)
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(messages)
  })
}

export async function sendMessage({ roomId, text, createdByUid, createdByName }) {
  if (!roomId) throw new Error('roomId is required')
  const trimmed = text.trim()
  if (!trimmed) return

  await fsAddDoc(
    fsCollection(db, ROOMS_COLLECTION, roomId, MESSAGES_SUBCOLLECTION),
    {
      text: trimmed,
      createdAt: fsServerTimestamp(),
      createdByUid,
      createdByName,
    }
  )
}

export async function getRoom(roomId) {
  const r = await getDoc(fsDoc(db, ROOMS_COLLECTION, roomId))
  if (!r.exists()) return null
  return { id: r.id, ...r.data() }
}


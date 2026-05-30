import { api } from './client'

// GET /events/recommended  → EventListResponseDTO[]
// { id, title, description, type, date }
export const getRecommended = () =>
  api.get('/events/recommended')

// GET /events/{id}  → EventDTO
// { id, title, description, type, date, ownerId, ownerName, participantsIds[] }
export const getEvent = (id) =>
  api.get(`/events/${id}`)

// GET /events/created_by/{userId}  → EventListResponseDTO[]
export const getCreatedBy = (userId) =>
  api.get(`/events/created_by/${userId}`)

// GET /events/participated_by/{userId}  → EventListResponseDTO[]
export const getParticipatedBy = (userId) =>
  api.get(`/events/participated_by/${userId}`)

// POST /events  → EventDTO
// body: { title, description, type, date (ISO), imageBase64? }
export const createEvent = ({ title, description, type, date, imageBase64 }) =>
  api.post('/events', { title, description, type, date, imageBase64 })

// PUT /events/{id}  → EventDTO
export const updateEvent = (id, { title, description, type, date, imageBase64 }) =>
  api.put(`/events/${id}`, { title, description, type, date, imageBase64 })

// DELETE /events/{id}  → 204
export const deleteEvent = (id) =>
  api.delete(`/events/${id}`)

// GET /events/{eventId}/participants  → ParticipantSummaryDTO[]
// { userId, name, email, avatarBase64, avatarUrl, accountType, joinedAt }
// Requires authenticated owner of the event
export const getEventParticipants = (eventId) =>
  api.get(`/events/${eventId}/participants`)

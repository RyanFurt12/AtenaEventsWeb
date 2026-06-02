import { api } from './client'

// GET /events/{eventId}/whiteboard → WhiteboardDTO
// { activated, active, expired, activatedAt, expiresAt, myPostItCount, postIts[] }
export const getWhiteboard = (eventId) =>
  api.get(`/events/${eventId}/whiteboard`)

// POST /events/{eventId}/whiteboard/activate → WhiteboardDTO (owner-only, one-time)
export const activateWhiteboard = (eventId) =>
  api.post(`/events/${eventId}/whiteboard/activate`, {})

// POST /events/{eventId}/whiteboard/postits → PostItResponseDTO
// body: { type: 'TEXT'|'PHOTO', text, imageBase64, xPct, yPct }
export const createPostIt = (eventId, body) =>
  api.post(`/events/${eventId}/whiteboard/postits`, body)

// PUT /events/{eventId}/whiteboard/postits/{id} → PostItResponseDTO
export const movePostIt = (eventId, id, { xPct, yPct }) =>
  api.put(`/events/${eventId}/whiteboard/postits/${id}`, { xPct, yPct })

// DELETE /events/{eventId}/whiteboard/postits/{id}
export const deletePostIt = (eventId, id) =>
  api.delete(`/events/${eventId}/whiteboard/postits/${id}`)

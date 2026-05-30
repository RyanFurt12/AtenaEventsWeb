import { api } from './client'

// GET /comments/event/{eventId}  → CommentResponseDTO[]
// { id, text, authorId, authorName, createdAt }
export const getComments = (eventId) =>
  api.get(`/comments/event/${eventId}`)

// POST /comments  → CommentResponseDTO
// body: { eventId, text }  — userId resolved server-side via JWT
export const createComment = (eventId, text) =>
  api.post('/comments', { eventId, text })

// PUT /comments/{id}  → CommentResponseDTO
export const updateComment = (id, text) =>
  api.put(`/comments/${id}`, { text })

// DELETE /comments/{id}
export const deleteComment = (id) =>
  api.delete(`/comments/${id}`)

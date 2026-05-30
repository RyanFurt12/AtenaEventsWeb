import { api } from './client'

// POST /participate/toggle/event/{eventId}/user/{userId}  → Boolean
export const toggleParticipation = (eventId, userId) =>
  api.post(`/participate/toggle/event/${eventId}/user/${userId}`)

// GET /participate/event/{eventId}/user/{userId}  → Boolean
export const isParticipating = (eventId, userId) =>
  api.get(`/participate/event/${eventId}/user/${userId}`)

// GET /participate/event/{eventId}  → ParticipateDTO[]
export const listByEvent = (eventId) =>
  api.get(`/participate/event/${eventId}`)

// GET /participate/user/{userId}  → ParticipateDTO[]
export const listByUser = (userId) =>
  api.get(`/participate/user/${userId}`)

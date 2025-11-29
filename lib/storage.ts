/**
 * In-Memory Storage for MVP
 * 
 * Simple Map-based storage for services, availability, and sport types.
 * Data persists during server session but resets on deployment.
 * 
 * TODO: Migrate to database tables in production for permanent storage.
 */

// Storage Maps
export const servicesStorage = new Map<string, any[]>()
export const availabilityStorage = new Map<string, any>()
export const sportTypeStorage = new Map<string, string>()

// Helper functions
export function getTrainerServices(trainerId: string) {
  return servicesStorage.get(trainerId) || []
}

export function setTrainerServices(trainerId: string, services: any[]) {
  servicesStorage.set(trainerId, services)
}

export function getTrainerAvailability(trainerId: string) {
  return availabilityStorage.get(trainerId) || null
}

export function setTrainerAvailability(trainerId: string, availability: any) {
  availabilityStorage.set(trainerId, availability)
}

export function getTrainerSportType(trainerId: string) {
  return sportTypeStorage.get(trainerId) || "PERSONAL_TRAINING"
}

export function setTrainerSportType(trainerId: string, sportType: string) {
  sportTypeStorage.set(trainerId, sportType)
}


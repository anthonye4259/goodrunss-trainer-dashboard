/**
 * Mindbody API Integration
 * Docs: https://developers.mindbodyonline.com/
 * 
 * Mindbody uses OAuth 2.0 for authentication
 * Key APIs:
 * - Staff API — Get staff/trainers
 * - Clients API — Get customers
 * - Classes API — Get class schedules
 * - Appointments API — Get/create appointments (bookings)
 * - Sites API — Get location info
 */

export interface MindbodyConfig {
  apiKey: string;
  siteId: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface MindbodyAppointment {
  Id: number;
  StartDateTime: string;
  EndDateTime: string;
  StaffId: number;
  ClientId: string;
  LocationId: number;
  SessionTypeId: number;
  Status: string;
  Notes?: string;
}

export interface MindbodyClass {
  Id: number;
  ClassDescription: {
    Id: number;
    Name: string;
    Description: string;
  };
  StartDateTime: string;
  EndDateTime: string;
  StaffId: number;
  LocationId: number;
  MaxCapacity: number;
  TotalBooked: number;
  Active: boolean;
}

const MINDBODY_API_BASE = 'https://api.mindbodyonline.com/public/v6';

// Get OAuth access token
export async function getMindbodyAccessToken(
  apiKey: string,
  username: string,
  password: string,
  siteId: string
): Promise<{ access_token: string; refresh_token: string }> {
  const response = await fetch(`${MINDBODY_API_BASE}/usertoken/issue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': apiKey,
      'SiteId': siteId,
    },
    body: JSON.stringify({
      Username: username,
      Password: password,
    }),
  });

  if (!response.ok) {
    throw new Error(`Mindbody auth failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    access_token: data.AccessToken,
    refresh_token: data.RefreshToken || '',
  };
}

// Pull appointments (bookings) from Mindbody
export async function pullAppointmentsFromMindbody(
  config: MindbodyConfig,
  startDate: Date,
  endDate: Date
): Promise<MindbodyAppointment[]> {
  const response = await fetch(
    `${MINDBODY_API_BASE}/appointment/appointments?StartDateTime=${startDate.toISOString()}&EndDateTime=${endDate.toISOString()}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': config.apiKey,
        'SiteId': config.siteId,
        'Authorization': `Bearer ${config.accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Mindbody appointments: ${response.statusText}`);
  }

  const data = await response.json();
  return data.Appointments || [];
}

// Pull classes from Mindbody
export async function pullClassesFromMindbody(
  config: MindbodyConfig,
  startDate: Date,
  endDate: Date
): Promise<MindbodyClass[]> {
  const response = await fetch(
    `${MINDBODY_API_BASE}/class/classes?StartDateTime=${startDate.toISOString()}&EndDateTime=${endDate.toISOString()}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': config.apiKey,
        'SiteId': config.siteId,
        'Authorization': `Bearer ${config.accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Mindbody classes: ${response.statusText}`);
  }

  const data = await response.json();
  return data.Classes || [];
}

// Push booking to Mindbody (create appointment)
export async function pushBookingToMindbody(
  config: MindbodyConfig,
  booking: {
    staffId: number;
    clientId: string;
    locationId: number;
    sessionTypeId: number;
    startTime: Date;
    endTime: Date;
    notes?: string;
  }
): Promise<MindbodyAppointment> {
  const response = await fetch(`${MINDBODY_API_BASE}/appointment/addappointment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': config.apiKey,
      'SiteId': config.siteId,
      'Authorization': `Bearer ${config.accessToken}`,
    },
    body: JSON.stringify({
      StaffId: booking.staffId,
      ClientId: booking.clientId,
      LocationId: booking.locationId,
      SessionTypeId: booking.sessionTypeId,
      StartDateTime: booking.startTime.toISOString(),
      EndDateTime: booking.endTime.toISOString(),
      Notes: booking.notes,
      SendEmail: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create Mindbody appointment: ${response.statusText}`);
  }

  const data = await response.json();
  return data.Appointment;
}

// Cancel appointment in Mindbody
export async function cancelMindbodyAppointment(
  config: MindbodyConfig,
  appointmentId: number
): Promise<void> {
  const response = await fetch(`${MINDBODY_API_BASE}/appointment/updateappointment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': config.apiKey,
      'SiteId': config.siteId,
      'Authorization': `Bearer ${config.accessToken}`,
    },
    body: JSON.stringify({
      AppointmentId: appointmentId,
      Status: 'Cancelled',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel Mindbody appointment: ${response.statusText}`);
  }
}

// Get staff (trainers) from Mindbody
export async function getMindbodyStaff(config: MindbodyConfig) {
  const response = await fetch(`${MINDBODY_API_BASE}/staff/staff`, {
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': config.apiKey,
      'SiteId': config.siteId,
      'Authorization': `Bearer ${config.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Mindbody staff: ${response.statusText}`);
  }

  const data = await response.json();
  return data.StaffMembers || [];
}

// Get locations from Mindbody
export async function getMindbodyLocations(config: MindbodyConfig) {
  const response = await fetch(`${MINDBODY_API_BASE}/site/locations`, {
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': config.apiKey,
      'SiteId': config.siteId,
      'Authorization': `Bearer ${config.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Mindbody locations: ${response.statusText}`);
  }

  const data = await response.json();
  return data.Locations || [];
}


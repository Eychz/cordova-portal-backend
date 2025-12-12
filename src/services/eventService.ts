import prisma from '../config/database';

interface SaveEventData {
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  eventTime?: string;
  location?: string;
  notifyBefore?: number;
}

export const saveEvent = async (userId: number, data: SaveEventData) => {
  // Check if event already saved
  const existing = await prisma.userEvent.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId: data.eventId,
      },
    },
  });

  if (existing) {
    const error: any = new Error('Event already saved to calendar');
    error.statusCode = 400;
    throw error;
  }

  const userEvent = await prisma.userEvent.create({
    data: {
      userId,
      eventId: data.eventId,
      eventTitle: data.eventTitle,
      eventDate: data.eventDate,
      eventTime: data.eventTime,
      location: data.location,
      notifyBefore: data.notifyBefore || 24,
    },
  });

  return userEvent;
};

export const getUserEvents = async (userId: number) => {
  const events = await prisma.userEvent.findMany({
    where: { userId },
    orderBy: { eventDate: 'asc' },
  });

  return events;
};

export const getUpcomingEvents = async (userId: number) => {
  const now = new Date();
  const events = await prisma.userEvent.findMany({
    where: {
      userId,
      eventDate: {
        gte: now,
      },
    },
    orderBy: { eventDate: 'asc' },
  });

  return events;
};

export const deleteUserEvent = async (userId: number, eventId: number) => {
  // Verify event belongs to user
  const event = await prisma.userEvent.findFirst({
    where: {
      id: eventId,
      userId,
    },
  });

  if (!event) {
    const error: any = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }

  await prisma.userEvent.delete({
    where: { id: eventId },
  });

  return { message: 'Event removed from calendar' };
};

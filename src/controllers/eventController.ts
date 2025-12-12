import { Request, Response } from 'express';
import { saveEvent, getUserEvents, getUpcomingEvents, deleteUserEvent } from '../services/eventService';

export const addEventToCalendar = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { eventId, eventTitle, eventDate, eventTime, location, notifyBefore } = req.body;

    console.log(`[Add Event] userId=${userId}, eventId=${eventId}, eventTitle=${eventTitle}, eventDate=${eventDate}`);

    if (!eventId || !eventTitle || !eventDate) {
      return res.status(400).json({ error: 'Event ID, title, and date are required' });
    }

    const userEvent = await saveEvent(userId, {
      eventId,
      eventTitle,
      eventDate: new Date(eventDate),
      eventTime,
      location,
      notifyBefore,
    });

    console.log(`[Add Event] Success:`, userEvent);

    res.json({
      success: true,
      message: 'Event added to calendar',
      event: userEvent,
    });
  } catch (error: any) {
    console.error('[Add Event] Error:', error);
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to add event',
    });
  }
};

export const getMyEvents = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { upcoming } = req.query;

    const events = upcoming === 'true'
      ? await getUpcomingEvents(userId)
      : await getUserEvents(userId);

    res.json({
      success: true,
      events,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to fetch events',
    });
  }
};

export const removeEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const eventId = parseInt(req.params.id);

    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const result = await deleteUserEvent(userId, eventId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to remove event',
    });
  }
};

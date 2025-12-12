"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeEvent = exports.getMyEvents = exports.addEventToCalendar = void 0;
const eventService_1 = require("../services/eventService");
const addEventToCalendar = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { eventId, eventTitle, eventDate, eventTime, location, notifyBefore } = req.body;
        console.log(`[Add Event] userId=${userId}, eventId=${eventId}, eventTitle=${eventTitle}, eventDate=${eventDate}`);
        if (!eventId || !eventTitle || !eventDate) {
            return res.status(400).json({ error: 'Event ID, title, and date are required' });
        }
        const userEvent = await (0, eventService_1.saveEvent)(userId, {
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
    }
    catch (error) {
        console.error('[Add Event] Error:', error);
        res.status(error.statusCode || 500).json({
            error: error.message || 'Failed to add event',
        });
    }
};
exports.addEventToCalendar = addEventToCalendar;
const getMyEvents = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { upcoming } = req.query;
        const events = upcoming === 'true'
            ? await (0, eventService_1.getUpcomingEvents)(userId)
            : await (0, eventService_1.getUserEvents)(userId);
        res.json({
            success: true,
            events,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message || 'Failed to fetch events',
        });
    }
};
exports.getMyEvents = getMyEvents;
const removeEvent = async (req, res) => {
    try {
        const userId = req.user.userId;
        const eventId = parseInt(req.params.id);
        if (isNaN(eventId)) {
            return res.status(400).json({ error: 'Invalid event ID' });
        }
        const result = await (0, eventService_1.deleteUserEvent)(userId, eventId);
        res.json({
            success: true,
            message: result.message,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message || 'Failed to remove event',
        });
    }
};
exports.removeEvent = removeEvent;

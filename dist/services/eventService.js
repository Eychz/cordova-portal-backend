"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserEvent = exports.getUpcomingEvents = exports.getUserEvents = exports.saveEvent = void 0;
const database_1 = __importDefault(require("../config/database"));
const saveEvent = async (userId, data) => {
    // Check if event already saved
    const existing = await database_1.default.userEvent.findUnique({
        where: {
            userId_eventId: {
                userId,
                eventId: data.eventId,
            },
        },
    });
    if (existing) {
        const error = new Error('Event already saved to calendar');
        error.statusCode = 400;
        throw error;
    }
    const userEvent = await database_1.default.userEvent.create({
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
exports.saveEvent = saveEvent;
const getUserEvents = async (userId) => {
    const events = await database_1.default.userEvent.findMany({
        where: { userId },
        orderBy: { eventDate: 'asc' },
    });
    return events;
};
exports.getUserEvents = getUserEvents;
const getUpcomingEvents = async (userId) => {
    const now = new Date();
    const events = await database_1.default.userEvent.findMany({
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
exports.getUpcomingEvents = getUpcomingEvents;
const deleteUserEvent = async (userId, eventId) => {
    // Verify event belongs to user
    const event = await database_1.default.userEvent.findFirst({
        where: {
            id: eventId,
            userId,
        },
    });
    if (!event) {
        const error = new Error('Event not found');
        error.statusCode = 404;
        throw error;
    }
    await database_1.default.userEvent.delete({
        where: { id: eventId },
    });
    return { message: 'Event removed from calendar' };
};
exports.deleteUserEvent = deleteUserEvent;

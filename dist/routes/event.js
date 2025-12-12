"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const eventController_1 = require("../controllers/eventController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/events', auth_1.authenticateToken, eventController_1.addEventToCalendar);
router.get('/events', auth_1.authenticateToken, eventController_1.getMyEvents);
router.delete('/events/:id', auth_1.authenticateToken, eventController_1.removeEvent);
exports.default = router;

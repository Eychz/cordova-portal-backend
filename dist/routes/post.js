"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = require("../controllers/postController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/', postController_1.postController.getAllPosts);
router.get('/upcoming-events', postController_1.postController.getUpcomingEvents);
router.get('/featured', postController_1.postController.getFeaturedPosts);
router.get('/:id', postController_1.postController.getPostById);
// Admin-only routes (protected)
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRole)('admin', 'official'), postController_1.postController.createPost);
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRole)('admin', 'official'), postController_1.postController.updatePost);
router.put('/:id/featured', auth_1.authenticateToken, (0, auth_1.authorizeRole)('admin'), postController_1.postController.toggleFeaturedPost);
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRole)('admin', 'official'), postController_1.postController.deletePost);
exports.default = router;

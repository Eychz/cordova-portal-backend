"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postController = void 0;
const postService_1 = require("../services/postService");
const database_1 = __importDefault(require("../config/database"));
const notificationService_1 = require("../services/notificationService");
exports.postController = {
    async getAllPosts(req, res) {
        try {
            const { type, status } = req.query;
            const posts = await postService_1.postService.getAllPosts(type, status);
            res.json(posts);
        }
        catch (error) {
            console.error('Error fetching posts:', error);
            res.status(500).json({ error: 'Failed to fetch posts' });
        }
    },
    async getPostById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const post = await postService_1.postService.getPostById(id);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.json(post);
        }
        catch (error) {
            console.error('Error fetching post:', error);
            res.status(500).json({ error: 'Failed to fetch post' });
        }
    },
    async createPost(req, res) {
        try {
            const { title, content, imageUrl, type, priority, status, location, eventDate, eventTime, category, eventStatus } = req.body;
            // Validation
            if (!title || !content || !type) {
                return res.status(400).json({ error: 'Title, content, and type are required' });
            }
            const validTypes = ['news', 'announcement', 'event'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({ error: 'Invalid post type' });
            }
            // Get user ID and info from authenticated request
            const createdBy = req.user?.userId;
            // Fetch user details to create authorName
            const user = await database_1.default.user.findUnique({
                where: { id: createdBy }
            });
            const authorName = user ? `${user.firstName} ${user.lastName}` : undefined;
            console.log(`[Post Create] type=${type}, eventStatus=${eventStatus}`);
            const post = await postService_1.postService.createPost({
                title,
                content,
                imageUrl,
                type,
                priority,
                status,
                location,
                eventDate: eventDate ? new Date(eventDate) : undefined,
                eventTime,
                createdBy,
                category,
                authorName,
                isFeatured: req.body.isFeatured || false,
                eventStatus
            });
            console.log(`[Post Create] Success:`, post);
            // Send notification if post is featured and published
            if (post.isFeatured && post.status === 'published') {
                (0, notificationService_1.notifyFeaturedPost)(post.id, post.title, post.type).catch(err => console.error('Failed to send featured post notifications:', err));
            }
            res.status(201).json(post);
        }
        catch (error) {
            console.error('Error creating post:', error);
            res.status(500).json({ error: 'Failed to create post' });
        }
    },
    async updatePost(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { title, content, imageUrl, type, priority, status, location, eventDate, eventTime, category, eventStatus } = req.body;
            console.log(`[Post Update] ID=${id}, eventStatus=${eventStatus}, status=${status}`);
            // Check if post exists
            const existingPost = await postService_1.postService.getPostById(id);
            if (!existingPost) {
                return res.status(404).json({ error: 'Post not found' });
            }
            const updateData = {};
            if (title !== undefined)
                updateData.title = title;
            if (content !== undefined)
                updateData.content = content;
            if (imageUrl !== undefined)
                updateData.imageUrl = imageUrl;
            if (type !== undefined)
                updateData.type = type;
            if (priority !== undefined)
                updateData.priority = priority;
            if (status !== undefined)
                updateData.status = status;
            if (location !== undefined)
                updateData.location = location;
            if (eventDate !== undefined)
                updateData.eventDate = new Date(eventDate);
            if (eventTime !== undefined)
                updateData.eventTime = eventTime;
            if (category !== undefined)
                updateData.category = category;
            if (eventStatus !== undefined)
                updateData.eventStatus = eventStatus;
            console.log(`[Post Update] Update data:`, updateData);
            const post = await postService_1.postService.updatePost(id, updateData);
            console.log(`[Post Update] Success:`, post);
            res.json(post);
        }
        catch (error) {
            console.error('Error updating post:', error);
            res.status(500).json({ error: 'Failed to update post' });
        }
    },
    async deletePost(req, res) {
        try {
            const id = parseInt(req.params.id);
            // Check if post exists
            const existingPost = await postService_1.postService.getPostById(id);
            if (!existingPost) {
                return res.status(404).json({ error: 'Post not found' });
            }
            await postService_1.postService.deletePost(id);
            res.json({ message: 'Post deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).json({ error: 'Failed to delete post' });
        }
    },
    async getUpcomingEvents(req, res) {
        try {
            const events = await postService_1.postService.getUpcomingEvents();
            res.json(events);
        }
        catch (error) {
            console.error('Error fetching upcoming events:', error);
            res.status(500).json({ error: 'Failed to fetch upcoming events' });
        }
    },
    async getFeaturedPosts(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            const posts = await postService_1.postService.getFeaturedPosts(limit);
            res.json(posts);
        }
        catch (error) {
            console.error('Error fetching featured posts:', error);
            res.status(500).json({ error: 'Failed to fetch featured posts' });
        }
    },
    async toggleFeaturedPost(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { isFeatured } = req.body;
            if (typeof isFeatured !== 'boolean') {
                return res.status(400).json({ error: 'isFeatured must be a boolean' });
            }
            const post = await postService_1.postService.toggleFeaturedPost(id, isFeatured);
            // Send notification if post is being featured and is published
            if (isFeatured && post.status === 'published') {
                (0, notificationService_1.notifyFeaturedPost)(post.id, post.title, post.type).catch(err => console.error('Failed to send featured post notifications:', err));
            }
            res.json(post);
        }
        catch (error) {
            console.error('Error toggling featured post:', error);
            res.status(error.message.includes('Maximum') ? 400 : 500).json({
                error: error.message || 'Failed to toggle featured post'
            });
        }
    }
};

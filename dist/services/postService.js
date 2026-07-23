"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.postService = {
    async getAllPosts(type, status, page = 1, limit = 30, search, date, category) {
        const where = {};
        if (type)
            where.type = type;
        if (status)
            where.status = status;
        if (category)
            where.category = category;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (date) {
            const startDate = new Date(date);
            if (!isNaN(startDate.getTime())) {
                const endDate = new Date(date);
                endDate.setDate(endDate.getDate() + 1);
                where.createdAt = {
                    gte: startDate,
                    lt: endDate
                };
            }
        }
        const parsedLimit = Math.min(Math.max(1, limit), 100);
        const skip = (page - 1) * parsedLimit;
        const [posts, total] = await Promise.all([
            database_1.default.post.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: parsedLimit
            }),
            database_1.default.post.count({ where })
        ]);
        return {
            posts,
            pagination: {
                total,
                page,
                limit: parsedLimit,
                totalPages: Math.ceil(total / parsedLimit),
                hasNextPage: page * parsedLimit < total,
                hasPrevPage: page > 1
            }
        };
    },
    async getPostById(id) {
        return await database_1.default.post.findUnique({
            where: { id }
        });
    },
    async createPost(data) {
        return await database_1.default.post.create({
            data: {
                title: data.title,
                content: data.content,
                imageUrl: data.imageUrl,
                type: data.type,
                priority: data.priority || 'normal',
                status: data.status || 'published',
                location: data.location,
                eventDate: data.eventDate,
                eventTime: data.eventTime,
                createdBy: data.createdBy,
                category: data.category,
                authorName: data.authorName,
                isFeatured: data.isFeatured || false,
                eventStatus: data.eventStatus
            }
        });
    },
    async updatePost(id, data) {
        return await database_1.default.post.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
    },
    async deletePost(id) {
        return await database_1.default.post.delete({
            where: { id }
        });
    },
    async getPostsByType(type) {
        return await database_1.default.post.findMany({
            where: {
                type,
                status: 'published'
            },
            orderBy: { createdAt: 'desc' }
        });
    },
    async getUpcomingEvents() {
        return await database_1.default.post.findMany({
            where: {
                type: 'event',
                status: 'published',
                eventDate: {
                    gte: new Date()
                }
            },
            orderBy: { eventDate: 'asc' }
        });
    },
    async getFeaturedPosts(limit = 5) {
        return await database_1.default.post.findMany({
            where: {
                isFeatured: true,
                status: 'published'
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    },
    async toggleFeaturedPost(id, isFeatured) {
        // If setting to featured, check limit
        if (isFeatured) {
            const featuredCount = await database_1.default.post.count({
                where: {
                    isFeatured: true,
                    status: 'published',
                    id: { not: id } // Exclude current post from count
                }
            });
            if (featuredCount >= 5) {
                throw new Error('Maximum 5 featured posts allowed. Please unfeature another post first.');
            }
        }
        return await database_1.default.post.update({
            where: { id },
            data: {
                isFeatured,
                updatedAt: new Date()
            }
        });
    },
    async getPostBySlug(slug) {
        const posts = await database_1.default.post.findMany({
            where: { status: 'published' }
        });
        return posts.find(p => {
            const postSlug = p.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            return postSlug === slug;
        }) || null;
    }
};

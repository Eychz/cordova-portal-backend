import prisma from '../config/database';

export interface CreatePostData {
    title: string;
    content: string;
    imageUrl?: string;
    type: string; // 'news', 'announcement', 'event'
    priority?: string;
    status?: string;
    location?: string;
    eventDate?: Date;
    eventTime?: string;
    createdBy?: number;
    category?: string;
    authorName?: string;
    isFeatured?: boolean;
    eventStatus?: string; // 'upcoming' or 'done'
}

export interface UpdatePostData {
    title?: string;
    content?: string;
    imageUrl?: string;
    type?: string;
    priority?: string;
    status?: string;
    location?: string;
    eventDate?: Date;
    eventTime?: string;
    category?: string;
    authorName?: string;
    eventStatus?: string; // 'upcoming' or 'done'
}

export const postService = {
    async getAllPosts(type?: string, status?: string, page = 1, limit = 30, search?: string, date?: string, category?: string) {
        const where: any = {};
        
        if (type) where.type = type;
        if (status) where.status = status;
        if (category) where.category = category;
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

        const parsedLimit = Math.min(limit, 30);
        const skip = (page - 1) * parsedLimit;

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: parsedLimit
            }),
            prisma.post.count({ where })
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

    async getPostById(id: number) {
        return await prisma.post.findUnique({
            where: { id }
        });
    },

    async createPost(data: CreatePostData) {
        return await prisma.post.create({
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

    async updatePost(id: number, data: UpdatePostData) {
        return await prisma.post.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
    },

    async deletePost(id: number) {
        return await prisma.post.delete({
            where: { id }
        });
    },

    async getPostsByType(type: string) {
        return await prisma.post.findMany({
            where: { 
                type,
                status: 'published'
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    async getUpcomingEvents() {
        return await prisma.post.findMany({
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

    async getFeaturedPosts(limit: number = 5) {
        return await prisma.post.findMany({
            where: {
                isFeatured: true,
                status: 'published'
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    },

    async toggleFeaturedPost(id: number, isFeatured: boolean) {
        // If setting to featured, check limit
        if (isFeatured) {
            const featuredCount = await prisma.post.count({
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

        return await prisma.post.update({
            where: { id },
            data: {
                isFeatured,
                updatedAt: new Date()
            }
        });
    },

    async getPostBySlug(slug: string) {
        const posts = await prisma.post.findMany({
            where: { status: 'published' }
        });
        return posts.find(p => {
            const postSlug = p.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            return postSlug === slug;
        }) || null;
    }
};

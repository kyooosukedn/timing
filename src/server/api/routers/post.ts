import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
	hello: publicProcedure
		.input(z.object({ text: z.string() }))
		.query(({ input }) => {
			return {
				greeting: `Hello ${input.text}`,
			};
		}),

	// Create a new post
	create: protectedProcedure
		.input(z.object({ name: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.post.create({
				data: {
					name: input.name,
					createdBy: { connect: { id: ctx.session.user.id } },
				},
			});
		}),

	// Get all posts for the current user
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.post.findMany({
			where: { createdById: ctx.session.user.id },
			orderBy: { createdAt: "desc" },
		});
	}),

	// Get a single post by id for the current user
	getById: protectedProcedure
		.input(z.object({ id: z.number().int().positive() }))
		.query(async ({ ctx, input }) => {
			const post = await ctx.db.post.findFirst({
				where: { id: input.id, createdById: ctx.session.user.id },
			});
			if (!post) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Post not found",
				});
			}
			return post;
		}),

	// Update a post by id for the current user
	update: protectedProcedure
		.input(z.object({ id: z.number().int().positive(), name: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			const updated = await ctx.db.post.updateMany({
				where: { id: input.id, createdById: ctx.session.user.id },
				data: { name: input.name },
			});

			if (updated.count === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Post not found",
				});
			}

			const post = await ctx.db.post.findFirst({
				where: { id: input.id, createdById: ctx.session.user.id },
			});

			if (!post) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Post not found",
				});
			}

			return post;
		}),

	// Delete a post by id for the current user
	delete: protectedProcedure
		.input(z.object({ id: z.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			const post = await ctx.db.post.deleteMany({
				where: { id: input.id, createdById: ctx.session.user.id },
			});
			if (post.count === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Post not found",
				});
			}
			return { success: true };
		}),

	getLatest: protectedProcedure.query(async ({ ctx }) => {
		const post = await ctx.db.post.findFirst({
			orderBy: { createdAt: "desc" },
			where: { createdBy: { id: ctx.session.user.id } },
		});
		return post ?? null;
	}),

	getSecretMessage: protectedProcedure.query(() => {
		return "you can now see this secret message!";
	}),
});

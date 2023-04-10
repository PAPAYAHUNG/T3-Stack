import type { User } from "@clerk/nextjs/dist/api";
import type { Post } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { RouterOutputs } from "~/utils/api";

type PostWithUser = RouterOutputs["post"]["getAll"];

const filerUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
  };
};

const addUserDataToPosts = async (posts: Post[]) => {
  const authorIdList = posts.map((post) => post.authorId);

  const users = (
    await clerkClient.users.getUserList({
      userId: authorIdList,
      limit: 100,
    })
  ).map(filerUserForClient);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);

    if (!author) {
      console.error("AUTHOR NOT FOUND", post);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Author for post not found. Post ID: ${post.id}`,
      });
    }

    return {
      post,
      author,
    };
  });
};

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.prisma.post.findMany({
      take:100,
      orderBy:{
        createdAt:'desc'
      }
    });
    return addUserDataToPosts(post);
  }),

  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content
        },
      });

      return post
    }),
});

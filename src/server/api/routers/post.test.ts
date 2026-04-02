import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it } from "vitest";

import { createCaller } from "~/server/api/root";

type PostRecord = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
};

type PostCreateArgs = {
  data: {
    name: string;
    createdBy: {
      connect: {
        id: string;
      };
    };
  };
};

type PostFindManyArgs = {
  where: {
    createdById: string;
  };
};

type PostFindFirstArgs = {
  where: {
    id: number;
    createdById: string;
  };
};

type PostUpdateManyArgs = {
  where: {
    id: number;
    createdById: string;
  };
  data: {
    name: string;
  };
};

type PostDeleteManyArgs = {
  where: {
    id: number;
    createdById: string;
  };
};

function createMockDb() {
  let nextId = 1;
  const posts: PostRecord[] = [];

  return {
    post: {
      create: async ({ data }: PostCreateArgs) => {
        const now = new Date();
        const post: PostRecord = {
          id: nextId++,
          name: data.name,
          createdAt: now,
          updatedAt: now,
          createdById: data.createdBy.connect.id,
        };
        posts.push(post);
        return post;
      },
      findMany: async ({ where }: PostFindManyArgs) => {
        return posts
          .filter((post) => post.createdById === where.createdById)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      },
      findFirst: async ({ where }: PostFindFirstArgs) => {
        return (
          posts.find(
            (post) =>
              post.id === where.id && post.createdById === where.createdById,
          ) ?? null
        );
      },
      updateMany: async ({ where, data }: PostUpdateManyArgs) => {
        const target = posts.find(
          (post) => post.id === where.id && post.createdById === where.createdById,
        );

        if (!target) return { count: 0 };

        target.name = data.name;
        target.updatedAt = new Date();
        return { count: 1 };
      },
      deleteMany: async ({ where }: PostDeleteManyArgs) => {
        const originalLength = posts.length;
        const kept = posts.filter(
          (post) => !(post.id === where.id && post.createdById === where.createdById),
        );
        posts.length = 0;
        posts.push(...kept);
        return { count: originalLength - posts.length };
      },
    },
  };
}

function getAuthedCaller(userId = "user-1") {
  const db = createMockDb();
  const caller = createCaller({
    db: db as never,
    session: { user: { id: userId } },
    headers: new Headers(),
  });

  return { caller };
}

describe("postRouter", () => {
  let caller: ReturnType<typeof getAuthedCaller>["caller"];

  beforeEach(() => {
    caller = getAuthedCaller().caller;
  });

  it("creates and lists posts for the current user", async () => {
    const created = await caller.post.create({ name: "My first post" });
    const posts = await caller.post.getAll();

    expect(created.name).toBe("My first post");
    expect(posts).toHaveLength(1);
    expect(posts[0]?.name).toBe("My first post");
  });

  it("updates a post owned by the current user", async () => {
    const created = await caller.post.create({ name: "Initial" });
    const updated = await caller.post.update({ id: created.id, name: "Updated" });

    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe("Updated");
  });

  it("deletes a post owned by the current user", async () => {
    const created = await caller.post.create({ name: "Delete me" });
    const result = await caller.post.delete({ id: created.id });
    const posts = await caller.post.getAll();

    expect(result.success).toBe(true);
    expect(posts).toHaveLength(0);
  });

  it("throws NOT_FOUND when updating a missing post", async () => {
    await expect(
      caller.post.update({ id: 999, name: "Missing" }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    } satisfies Partial<TRPCError>);
  });

  it("rejects protected procedures for unauthenticated users", async () => {
    const db = createMockDb();
    const unauthCaller = createCaller({
      db: db as never,
      session: null,
      headers: new Headers(),
    });

    await expect(unauthCaller.post.getAll()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    } satisfies Partial<TRPCError>);
  });
});

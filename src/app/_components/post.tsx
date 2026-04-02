"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function LatestPost() {
  const utils = api.useUtils();
  const postsQuery = api.post.getAll.useQuery();

  const [newPostName, setNewPostName] = useState("");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingPostName, setEditingPostName] = useState("");

  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setNewPostName("");
    },
  });

  const updatePost = api.post.update.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setEditingPostId(null);
      setEditingPostName("");
    },
  });

  const deletePost = api.post.delete.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
    },
  });

  const posts = postsQuery.data ?? [];

  const combinedErrorMessage =
    postsQuery.error?.message ??
    createPost.error?.message ??
    updatePost.error?.message ??
    deletePost.error?.message;

  return (
    <div className="w-full max-w-xl space-y-4">
      <div className="rounded-lg bg-white/10 p-4">
        {postsQuery.isLoading ? (
          <p>Loading posts...</p>
        ) : posts.length > 0 ? (
          <ul className="space-y-2">
            {posts.map((post) => {
              const isEditing = editingPostId === post.id;

              return (
                <li
                  key={post.id}
                  className="flex flex-col gap-2 rounded-md bg-black/20 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingPostName}
                      onChange={(event) => setEditingPostName(event.target.value)}
                      className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
                    />
                  ) : (
                    <span className="truncate">{post.name}</span>
                  )}

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            updatePost.mutate({
                              id: post.id,
                              name: editingPostName,
                            })
                          }
                          className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
                          disabled={updatePost.isPending}
                        >
                          {updatePost.isPending ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPostId(null);
                            setEditingPostName("");
                          }}
                          className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPostId(post.id);
                            setEditingPostName(post.name);
                          }}
                          className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePost.mutate({ id: post.id })}
                          className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
                          disabled={deletePost.isPending}
                        >
                          {deletePost.isPending ? "Deleting..." : "Delete"}
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>You have no posts yet.</p>
        )}
      </div>

      {combinedErrorMessage ? (
        <p className="rounded-md bg-red-500/20 p-3 text-sm text-red-100">
          {combinedErrorMessage}
        </p>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          createPost.mutate({ name: newPostName });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Title"
          value={newPostName}
          onChange={(event) => setNewPostName(event.target.value)}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Creating..." : "Create post"}
        </button>
      </form>
    </div>
  );
}

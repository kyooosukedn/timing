import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const invalidateMock = vi.fn(async () => undefined);
const createMutateMock = vi.fn((_input: { name: string }) => undefined);
const updateMutateMock = vi.fn();
const deleteMutateMock = vi.fn();

vi.mock("~/trpc/react", () => {
  return {
    api: {
      useUtils: () => ({
        post: {
          invalidate: invalidateMock,
        },
      }),
      post: {
        getAll: {
          useQuery: () => ({
            data: [{ id: 1, name: "Existing post" }],
            isLoading: false,
            error: null,
          }),
        },
        create: {
          useMutation: (opts?: { onSuccess?: () => Promise<void> | void }) => ({
            mutate: (input: { name: string }) => {
              createMutateMock(input);
              void opts?.onSuccess?.();
            },
            isPending: false,
            error: null,
          }),
        },
        update: {
          useMutation: () => ({
            mutate: updateMutateMock,
            isPending: false,
            error: null,
          }),
        },
        delete: {
          useMutation: () => ({
            mutate: deleteMutateMock,
            isPending: false,
            error: null,
          }),
        },
      },
    },
  };
});

import { LatestPost } from "~/app/_components/post";

describe("LatestPost", () => {
  it("renders posts and submits new post input", async () => {
    render(<LatestPost />);

    expect(screen.getByText("Existing post")).toBeInTheDocument();

    const input = screen.getByPlaceholderText("Title");
    fireEvent.change(input, { target: { value: "New title" } });

    const formButton = screen.getByRole("button", { name: "Create post" });
    fireEvent.click(formButton);

    expect(createMutateMock).toHaveBeenCalledWith({ name: "New title" });
    expect(invalidateMock).toHaveBeenCalled();
  });
});

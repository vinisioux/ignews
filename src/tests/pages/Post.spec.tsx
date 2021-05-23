import { render, screen } from "@testing-library/react";
import { getSession } from "next-auth/client";
import { mocked } from "ts-jest/utils";
import Post, { getServerSideProps } from "../../pages/posts/[slug]";
import { getPrismicClient } from "../../services/prismic";

const post = {
  slug: "my-post-test",
  title: "My Post Test",
  content: "<p>Post excerpt</p>",
  updatedAt: "22 de abril",
};

jest.mock("next-auth/client");
jest.mock("../../services/prismic");

describe("Post page", () => {
  it("renders correctly", () => {
    render(<Post post={post} />);

    expect(screen.getByText("My Post Test")).toBeInTheDocument();
    expect(screen.getByText("Post excerpt")).toBeInTheDocument();
  });

  it("redirects user if no subscription is found", async () => {
    const getSessionMocked = mocked(getSession);

    getSessionMocked.mockResolvedValueOnce(null);

    const response = await getServerSideProps({
      params: {
        slug: "my-post-test",
      },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: "/",
        }),
      })
    );
  });

  it("loads initial data", async () => {
    const getSessionMocked = mocked(getSession);
    const getPrismicClientMocked = mocked(getPrismicClient);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: "fake-active-subscription",
    } as any);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: "heading", text: "My Post Test" }],
          content: [{ type: "paragraph", text: "Post excerpt" }],
        },
        last_publication_data: "04-01-2021",
      }),
    } as any);

    const response = await getServerSideProps({
      params: {
        slug: "my-post-test",
      },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: expect.objectContaining({
            slug: "my-post-test",
            title: "My Post Test",
            content: "<p>Post excerpt</p>",
          }),
        },
      })
    );
  });
});

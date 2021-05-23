import { render, screen } from "@testing-library/react";
import { mocked } from "ts-jest/utils";
import Posts, { getStaticProps } from "../../pages/posts";
import { getPrismicClient } from "../../services/prismic";

const posts = [
  {
    slug: "my-post-test",
    title: "My Post Test",
    excerpt: "Post excerpt",
    updatedAt: "22 de abril",
  },
];

jest.mock("../../services/prismic");

describe("Posts page", () => {
  it("renders correctly", () => {
    render(<Posts posts={posts} />);

    expect(screen.getByText("My Post Test")).toBeInTheDocument();
  });

  it("loads initial data", async () => {
    const getPrimscClientMocked = mocked(getPrismicClient);

    getPrimscClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: "my-post-test",
            data: {
              title: [{ type: "heading", text: "My Post Test" }],
              content: [{ type: "paragraph", text: "Post excerpt" }],
            },
            last_publication_date: "04-01-2021",
          },
        ],
      }),
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: "my-post-test",
              title: "My Post Test",
              excerpt: "Post excerpt",
              updatedAt: "01 de abril de 2021",
            },
          ],
        },
      })
    );
  });
});

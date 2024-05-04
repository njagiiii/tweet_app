import { fetchPost } from "@/lib/actions/thread.actions";
import React from "react";
import { currentUser } from "@clerk/nextjs";
import ThreadCard from "@/components/cards/ThreadCard";

const Home = async () => {
  const result = await fetchPost(1, 30);
  const user = await currentUser();

  if (!user) return null;

  console.log(result);

  // Filter out comments by its parent id(meaning this is a top level comment)
  const topLevelThreads = result.posts.filter((post) => !post.parentId);

  return (
    <>
      <h1 className="head-text text-left">Home</h1>

      <section className="mt-9 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p className="no-result">No threads found</p>
        ) : (
          <>
            {topLevelThreads.map((post) => (
              <ThreadCard
                key={post._id}
                id={post._id}
                currentUserId={user.id}
                parentId={post.parentId}
                content={post.text}
                author={post.author}
                community={post.community}
                createdAt={post.createdAt}
                comments={post.children}
              />
            ))}
          </>
        )}
      </section>
    </>
  );
};

export default Home;

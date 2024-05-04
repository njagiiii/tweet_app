import React from "react";
import { ThreadTabsProps } from "@/types/treads.types";
import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";

const ThreadTabs = async ({
  currentUserId,
  accountId,
  accountType,
}: ThreadTabsProps) => {
  let result = await fetchUserPosts(accountId);
  if (!result) redirect("/");
  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.threads.map((thread: any) => (
        <ThreadCard
          key={thread._id}
          id={thread._id}
          currentUserId={currentUserId}
          parentId={thread.parentId}
          content={thread.text}

          //  if the thread is of the user render it else if it of another account type get data directly from thread itself
          author={
            accountType === 'User'
              ? { name: result.name, image: result.image, id: result.id }
              : {
                  name: thread.author.name,
                  image: thread.author.image,
                  id: thread.author.id,
                }
          }
          community={thread.community} // TODO: Update to know if the thread belongs to a community
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      ))}
    </section>
  );
};

export default ThreadTabs;

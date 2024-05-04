import React from "react";
import { currentUser } from "@clerk/nextjs";
import { fetchUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import ThreadCard from "@/components/cards/ThreadCard";
import CommentPage from "@/components/forms/Comment";

const Page = async ({ params }: { params: { id: string } }) => {
  const user = await currentUser();
  if (!user) return null;

  // get the user info if the user exists
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  // fetch threadsbyid
  const threads = await fetchThreadById(params.id);

  return (
    <section className="relative">
      <div>
        <ThreadCard
          key={threads._id}
          id={threads._id}
          currentUserId={user.id}
          parentId={threads.parentId}
          content={threads.text}
          author={threads.author}
          community={threads.community}
          createdAt={threads.createdAt}
          comments={threads.children}
        />
      </div>

      <div className="mt-7">
        <CommentPage
          threadId={params.id}
          currentUserImg={userInfo.image}
          currentUserId={JSON.stringify(userInfo._id)}
        />
      </div>

      {/* loop through the children to display the comments */}
      <div className='mt-10'>
        {threads.children.map((childItem: any) => (
          <ThreadCard
            key={childItem._id}
            id={childItem._id}
            currentUserId={childItem?.id || ""}
            parentId={childItem.parentId}
            content={childItem.text}
            author={childItem.author}
            community={childItem.community}
            createdAt={childItem.createdAt}
            comments={childItem.children}
            isComment
          />
        ))}
      </div>
    </section>
  );
};

export default Page;

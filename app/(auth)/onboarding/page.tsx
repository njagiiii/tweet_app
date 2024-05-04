import AccountProfile from "@/components/forms/AccountProfile";
import React from "react";
import { currentUser } from "@clerk/nextjs";
import { fetchUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

const Onboardingpage = async() => {
  // get current user
  const user = await currentUser()
  if (!user) return null; 

  // get the current users info from db
  const userInfo = await fetchUser(user.id);
  if (userInfo?.onboarded) redirect("/");

  // get the users current data
  const userData = {
    id: user.id,
    objectId: userInfo?._id,
    username: userInfo ? userInfo?.username : user.username,
    name: userInfo ? userInfo?.name : user.firstName ?? "",
    bio: userInfo ? userInfo?.bio : "",
    image: userInfo ? userInfo?.image : user.imageUrl,
  };

  return (
    <main className="mx-auto flex flex-col max-w-3xl px-10 py-20">
      <h1 className="head-text">Onboarding</h1>
      <p className="mt-3 text-base-regular text-light-2">
        Complete your profile to use Threads
      </p>

      <section className="mt-9 bg-dark-2 p-10">
        <AccountProfile user={userData} btnTitle="Continue"/>
      </section>
    </main>
  );
};

export default Onboardingpage;

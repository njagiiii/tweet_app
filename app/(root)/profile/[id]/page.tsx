import React from "react";
import { currentUser } from "@clerk/nextjs";
import { fetchUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileTabs } from "@/constants";
import Image from "next/image";
import ThreadTabs from "@/components/shared/ThreadTabs";

const ProfilePage = async ({ params }: { params: { id: string } }) => {
  const user = await currentUser();
  if (!user) return null;

  // if user is there get the info
  const userInfo = await fetchUser(params.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  return (
    <section>
      <ProfileHeader
        accountId={userInfo.id} // this is to get the account looked at
        authUserId={user.id} // this is to help us know that the user logged in is the one looking at their profile or somebody else
        name={userInfo.name}
        imageUrl={userInfo.image}
        username={userInfo.username}
        bio={userInfo.bio}
      />

      <div className="mt-9">
        <Tabs defaultValue="threads" className="w-full">
          <TabsList className="tab">
            {profileTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className="tab">
                <Image 
                src={tab.icon}
                alt={tab.label}
                width={24}
                height={24}
                className="object-contain"
                />
                <p className="max-sm:hidden">{tab.label}</p>

                {tab.label === 'Threads' && (
                  <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                    {userInfo?.threads?.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {profileTabs.map((tab) => (
            <TabsContent key={`content-${tab.label}`} value={tab.value}
            className="w-full text-light-1">
              <ThreadTabs 
              currentUserId={user.id}
              accountId={userInfo.id}
              accountType='User'
              />

            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default ProfilePage;

"use server"

import { connectToDB} from "../mongoose"
import User from "../models/user.model";
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";

import { FilterQuery } from "mongoose";

// update user

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string | null;
  path: string;
}

export async function updateUser({
  userId,
  bio,
  name,
  path,
  username,
  image,
}: Params): Promise<void> {
  try {
    connectToDB();

    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

// fetch users info

export async function fetchUser(userId:string){
  try{
    connectToDB();

    return await User
    .findOne({id : userId})
    // .populate({
    //   path:'communities',
    //   model:Community
    // })
  }catch(error:any){
    throw new Error(`Failed to fetch user:${error.message}`)
  }
}

// /function to fetch user post(threads)

export async function fetchUserPosts(userId :string){
 
  try{
    connectToDB();

    // TODO: POPULATE COMMUNITY

    // 1. find all post authored by the user with the given user id
    const threads = await User.findOne({id: userId})
    // populate the threads table
    .populate({
      path: 'threads',
      model:Thread,
      populate:{
        path:'children',
        model:Thread,
        populate:{
          path: 'author',
          model:User,
          select:"name image id"
        }
      


      }
    })
    return threads;

  }catch(error:any){
    throw new Error(`Failed to fetch user posts: ${error.message}`)

  }
}

// fetch all users(search functionality)

export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize= 20,
  sortBy = "desc",
} : {
  userId:string;
  searchString ?: string;
  pageNumber? : number;
  pageSize ? :number;
  sortBy?: "asc" | "desc";
}){
  try{
    connectToDB();

    // pagination(number of pages to skip based on the page size)
    const skipAmount = (pageNumber - 1) * pageSize

    // case insensitive when seraching for users(regex)
    const regex = new RegExp(searchString, "i")

    // create an initial query object to filter users
    const query : FilterQuery<typeof User> = {
      id: {$ne: userId}, // Exclude the current user from the results.
    }

    // if the search string exists, use the or operator to match either their namr or username
    if(searchString.trim() !== ""){
      query.$or = [
        {username: {$regex : regex}},
        {name: {$regex : regex}},
      ];
    }

    // Define the sort option based on the sortBy parameter
    const sortOptions: { [key: string]: "asc" | "desc" } = {};
    if (sortBy === "asc" || sortBy === "desc") {
      sortOptions.createdAt = sortBy;
    }
     
    // find user and sort
    const userQuery = User.find(query)
    .sort(sortOptions)
    .skip(skipAmount)
    .limit(pageSize)

    // count the total number of users that match the search critea(without pagination)

    const totalUsersCount = await User.countDocuments(query);
    const users = await userQuery.exec();

    // check if there are more users beyond the current page
    const isNext = totalUsersCount > skipAmount + users.length

    return {users, isNext}

  }catch(error){
    console.error("Error fetching users:", error);
    throw error;
    
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();

    // find all threads created bt the user
    const userThreads= await Thread.find({author: userId})

    // collect all the child threads id(replies(comments)) from the children field
    const childThreadIds= userThreads.reduce((acc, userThreads) => {
      return acc.concat(userThreads.children)
    }, [])

    // get all the replies excluding the ones created by the user
    const replies = await Thread.find({
      _id: {$in: childThreadIds},
      author: {$ne : userId}
    }).populate({
      path :"author",
      model: User,
      select:" name image _id"
    })

    return replies; 
  }catch(error: any){
    throw new Error(`Failed to fetch activity: ${error.message} `)
  }
}
  


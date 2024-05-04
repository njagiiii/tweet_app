"use server";

import { Params } from "@/types/treads.types";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  connectToDB();

  try {
    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    // update user model after a thread has been made
    // then push the thread to the specific user who created it
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

// fetchThreads

export async function fetchPost(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // calculate the number of post to skip depending on the page we are
  const skipAmount = (pageNumber - 1) * pageSize;

  // 1. fetch post that have no parents(top-levels post)or without comments
  const postsQuery = Thread.find({ parentid: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: "author", model: User }) //populate the author table to have the new posts
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id name parentId image",
      },
    }); //populate the comments if they have which comes from the parentID(parent comment) having innercomments

  // total post count
  const totalPostsCount = await Thread.countDocuments({
    parentid: { $in: [null, undefined] },
  });
  const posts = await postsQuery.exec();

  // if the totalposts of the user has exceeded our page limit count
  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

// fetch thread by id
export async function fetchThreadById(threadId: string) {
  connectToDB();

  try {
    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }) // Populate the author field with _id and username
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (err) {
    console.error("Error while fetching thread:", err);
    throw new Error("Unable to fetch thread");
  }
}

// create a comment
export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // Find the original thread by its ID
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // Create the new comment thread
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId, // Set the parentId to the original thread's ID
    });

    // Save the comment thread to the database
    const savedCommentThread = await commentThread.save();

    // Add the comment thread's ID to the original thread's children array
    originalThread.children.push(savedCommentThread._id);

    // Save the updated original thread to the database
    await originalThread.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}

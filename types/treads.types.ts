export interface Params {
   text:string,
   author:string,
   communityId:string | null 
   path:string
}

export interface ThreadCardProps {
  id: string;
  currentUserId: string;
  parentId: string | null;
  content: string;
  author: {
    name: string;
    image: string;
    id: string;
  };
  community: {
    id: string;
    name: string;
    image: string;
  } | null;
  createdAt: string;
  comments: {
    author: {
      image: string;
    };
  }[];
  isComment?: boolean;

}

export interface CommentProps {
  threadId: string;
  currentUserImg : string;
  currentUserId: string
}

export interface ThreadTabsProps {
  currentUserId:string;
  accountId:string;
  accountType:string;
}
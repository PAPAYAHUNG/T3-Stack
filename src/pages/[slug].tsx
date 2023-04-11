import Head from "next/head";
import React from "react";
import Loading from "~/components/Loading";
import { api } from "~/utils/api";
import Image from "next/image";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
const PostingList = ({ userId }: { userId: string }) => {
  const { data } = api.post.getPostByUserId.useQuery({
    userId,
  });

  console.log("data from new", data);
  
  return (
    <div className="flex flex-col">
      {data?.map((item) => {
        const { post, author } = item || {};
        return (
          <div className="flex items-center justify-start gap-3" key={post.id}>
            <Image
              src={author.profileImageUrl}
              alt="user-logo"
              className="h-12 w-12 rounded-full"
              width={48}
              height={48}
            />

            <div>{post.content}</div>

            <div className="font-thin text-slate-300">
              {dayjs(post.createdAt).fromNow()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Profile = () => {
  //   console.log({ username });
  const router = useRouter();
  const { slug } = router.query;

  if (!slug) return null;
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username: slug as string,
  });

  if (isLoading) {
    console.log("im loading");
    return <Loading />;
  }

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <div>profile page</div>
      <div className="flex items-center justify-start gap-3 border-b-4 border-gray-300 p-4">
        <Image
          src={data?.profileImageUrl}
          alt="user-logo"
          className="h-12 w-12 rounded-full"
          width={48}
          height={48}
        />
        <div>{data?.username}</div>
      </div>
      <PostingList userId={data.id} />
    </>
  );
};

// export const getStaticProps = async (context: GetStaticPropsContext) => {
//   const ssg = createProxySSGHelpers({
//     router: appRouter,
//     transformer: SuperJSON,
//     ctx: { prisma, userId: null },
//   });

//   const slug = context?.params?.slug;

//   console.log({ slug });

//   if (typeof slug !== "string") throw new Error("no slug");

//   const username = slug.replace("@", "");

//   await ssg.profile.getUserByUsername.prefetch({ username });

//   return {
//     props: {
//       trpcState: ssg.dehydrate(),
//       username: username,
//     },
//   };
// };

// export const getStaticPaths: GetStaticPaths = () => {
//   return {
//     paths: [],
//     fallback: "blocking",
//   };
// };

export default Profile;

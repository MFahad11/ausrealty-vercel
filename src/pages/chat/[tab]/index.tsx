
import ChatBotHandler from "@/components/chat/ChatBotHandler";

import NavBar from "@/components/layout/Navba";
import axios from "axios";
import React from "react";
import "react-toastify/dist/ReactToastify.css";

const ChatbotPage = (
  {data}: {data: any}
) => {

  return (
    <>
  <NavBar />
  <ChatBotHandler
      data={data}
    />
    </>
  );
};

export default ChatbotPage;
export const getStaticProps = async ({ params }:{
  params: { tab: string };
}) => {
  if (params.tab !== "moments-from-home") {
    return {
      props: {
        data: null,
      },
      revalidate: 86400, // 1 day
    };
  }

  const url = `https://graph.facebook.com/v21.0/17841401703973084?fields=media.limit(30){id,caption,like_count,comments_count,media_type,media_url,children{media_url,id}}&access_token=${process.env.FACEBOOK_ACCESS_TOKEN}`;
  try {
     const response = await axios.get(url);
  const data = response?.data;
  return {
    props: {
      data,
    },
    revalidate: 86400, // 1 day
  };
  } catch (error) {
    console.log("error", error);
    return {
      props: {
        data: null,
      },
      revalidate: 86400, // 1 day
    };
    
  }
 

  
};

export const getStaticPaths = async () => {
  return {
    paths: [{ params: { tab: "moments-from-home" } }],
    fallback: true,
  };
};

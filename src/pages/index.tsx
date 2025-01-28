import Button from "@/components/ui/Button";
import { useRouter } from "next/router";
import axios from "axios";
import ChatBotHandler from "@/components/chat/ChatBotHandler";
import Head from "next/head";
import { useIsMessageStore } from "@/store/isMessageStore";
import { useEffect } from "react";
import NavBar from "@/components/layout/Navbar";

export default function Index({data}: {data: any}) {
  const navigate=useRouter();
  const setIsMessage=useIsMessageStore((state) => state.setIsMessage);
  const isMessage=useIsMessageStore((state) => state.isMessage);
useEffect(() => {
  if(localStorage.getItem("INDEX_PROMPT")){
    localStorage.removeItem("INDEX_PROMPT");
    setIsMessage(false);
  }

}, [])
  return (
    <>
    <Head>
    <title>
      Ausrealty
    </title>
    </Head>
    {
      !isMessage ? (<div className="max-w-md mx-auto px-4 flex flex-col items-center md:mt-4">
<div className="relative w-full max-w-[417px] h-[656px] md:h-[670px] flex-shrink-0">
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="w-full h-full object-cover"
      >
        <source 
          src="https://ausrealty-next.s3.ap-southeast-2.amazonaws.com/STARTS+WITH+BELIEF+(5).mp4" 
          type="video/mp4" 
        />
      </video>
    </div>
    
    
    
    <div>
    {/* @ts-ignore */}
      
      <ChatBotHandler
      data={data}
      indexPage={true}
    /></div>
    
    <div></div>
  </div>):(<><NavBar /> <div
  className="mt-10">
    {/* @ts-ignore */}
    
    <ChatBotHandler
      data={data}
      indexPage={true}
    /></div></>)
    }
  
</>

    
  )
}

import Button from "@/components/ui/Button";
import { useRouter } from "next/router";
import axios from "axios";
import ChatBotHandler from "@/components/chat/ChatBotHandler";

export default function Index({data}: {data: any}) {
  const navigate=useRouter();
  return (
    <>
  <div className="max-w-md mx-auto px-4 flex flex-col space-y-8 items-center md:mt-4">
    {/* Video Container */}
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
    
    
    <div><ChatBotHandler
      data={data}
      indexPage={true}
    /></div>
    
    <div></div>
  </div>
</>

    
  )
}

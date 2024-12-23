import Button from "@/components/ui/Button";
import { useRouter } from "next/router";
import ChatbotPage from "./chat/[[...tab]]";
import axios from "axios";

export default function Index({data}: {data: any}) {
  const navigate=useRouter();
  return (
    <>
  <div className="max-w-md mx-auto px-4 flex flex-col space-y-2 items-center md:mt-4 h-screen md:space-y-4 md:items-start md:space-x-4 md:flex-row md:justify-center md:space-y-0">
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
    
    {/* Button */}
    {/* <button
      onClick={() => navigate.push('/chat')}
      className="w-full max-w-[417px] py-4 bg-black text-white font-abchanel text-center"
    >
      Find what you need
    </button> */}
    <div><ChatbotPage 
      data={data}
    /></div>
    
    <div></div>
  </div>
</>

    
  )
}


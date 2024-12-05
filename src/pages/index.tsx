import Button from "@/components/ui/Button";
import { useRouter } from "next/router";

export default function PhotoLayout() {
  const navigate=useRouter();
  return (
    <>
  <div className="max-w-md mx-auto px-4 flex flex-col space-y-2 items-center">
    {/* Video Container */}
    <div className="relative w-full max-w-[417px] h-[656px]">
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
    <button
      onClick={() => navigate.push('/chat')}
      className="w-full max-w-[417px] py-4 bg-black text-white font-abchanel text-center"
    >
      Find what you need
    </button>
    <div></div>
  </div>
</>

    
  )
}

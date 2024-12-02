import Button from "@/components/ui/Button";
import { useRouter } from "next/router";

export default function PhotoLayout() {
  const navigate=useRouter();
  return (
    <>
    <div className="max-w-md mx-auto flex flex-col sm:py-4 py-8">
      <div className="relative aspect-[3/4]">
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
      <div className="px-4 bg-white">
        <Button
          onClick={() => 
            navigate.push('/chat')
          }
          className="w-full bg-black text-white py-6 font-abchanel"
        >
          Find what you need
        </Button>
      </div>
    </div></>
    
  )
}

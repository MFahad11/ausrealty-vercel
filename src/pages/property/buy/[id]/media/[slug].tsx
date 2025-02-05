import NavBar from "@/components/layout/Navbar";
import Modal from "@/components/ui/Modal";
import { TabGroup } from "@/components/ui/TabGroup";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePropertyStore } from "@/store/propertyStore";
import { GetStaticProps } from "next";
import axiosInstance from "@/utils/axios-instance";
import PageLoader from "@/components/ui/PageLoader";
import { IoSend } from "react-icons/io5";
import { toast } from "react-toastify";
import { handleIdentifyIntent } from "@/utils/openai";
import PropertyDetails from "@/components/property/PropertyDetails";
import AgentsPage from "@/components/property/AgentDetails";
import Button from "@/components/ui/Button";
import ChatWindow from "@/components/chat/ChatWindow/index";
import ChatBotHandler from "@/components/chat/ChatBotHandler";
import { IoIosArrowForward,IoIosArrowBack } from "react-icons/io";
import Head from "next/head";
export default function ImageGallery({ id, 
  initialPropertyData,
  canonicalUrl,
  imageUrl }: { id: string;
    initialPropertyData: any;
    canonicalUrl: string;
    imageUrl: string; }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [intentExtracting, setIntentExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState("images");
  const router = useRouter();
  const {slug} = router.query;
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [botThinking, setBotThinking] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const images = initialPropertyData?.media.filter((item:{type:string}) => item.type === "photo");
  const handlePrev = () => {
    setSelectedImage((prevImage)=>{
      const currentIndex = images.findIndex((item:{url:string}) => item.url === prevImage);
      const prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        return images[images.length - 1].url;
      }
      return images[prevIndex].url;
    })
  };
  
  const handleNext = () => {
    setSelectedImage((prevImage)=>{
      const currentIndex = images.findIndex((item:{url:string}) => item.url === prevImage);
      const nextIndex = currentIndex + 1;
      if (nextIndex >= images.length) {
        return images[0].url;
      }
      return images[nextIndex].url;
    }
    )
  };
  useEffect(() => {
    if (!isOpen) return; // Don't add event listener if modal is not open

    const handleKeyDown = (e:any) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    // Add event listener when modal is open
    window.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener on component unmount or when modal is closed
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };
  const searchData = async (userInput: string) => {
    const data = await handleIdentifyIntent(userInput);
      if (data?.response) {
        const { redirect = "/" ,page} = JSON.parse(data?.response);
        setIntentExtracting(false);
        if(page==="chat"){
          router.push(`/chat/${redirect}`);
        }else{
          router.push(`/property/${id}/media/${redirect}`);
        }
        
        // router.push(`/${data?.response?.redirect}`)
      }
  };
  const handleSend = () => {
    if (!inputValue.trim()) {
        toast.error("Please type something");
        return;
   }
   const userMessage = { role: "user", content: inputValue };
   setIntentExtracting(true);
    setInputValue("");
        try {
          searchData(userMessage?.content);
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "An unexpected error occurred";
          toast.error(errorMessage);
          setIntentExtracting(false);
        }
  };
  useEffect(() => {
    if (slug) {
      activeTab !== slug && setActiveTab(slug as string);
    
    }
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: initialPropertyData?.addressParts?.displayAddress,
          text: initialPropertyData?.details,
          url: window.location.href,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error));
    } else {

    }
  }
  if (!initialPropertyData) {
    return <PageLoader />;
  }
  if(router.isFallback){
    return <PageLoader />
  }
  return (
    <>
      <NavBar backgroundColor="black" showBackButton={true} 
      backButtonLink={`/chat/looking-to-buy`}
      />
      {/* @ts-ignore */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="max-w-[800px]"
      >
        <div className="relative aspect-[16/9]">
          <img
            src={selectedImage}
            alt="Property image"
            // fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {
            activeTab==='images' && (<><button
      onClick={handlePrev}
    
      className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
    >
      <IoIosArrowBack /> {/* Right Arrow */}
    
    </button>
    <button
      onClick={handleNext}
      className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
    >
      <IoIosArrowForward /> {/* Left Arrow */}
    </button></>)
          }
    
        </div>
      </Modal>
      <div className="max-w-4xl mx-auto mt-20">
        {
          // make a stcky share button to right center of the screen to share the property
        }
        

      <div className="pl-2 py-2 fixed top-[4.4rem] z-50 bg-white overflow-x-auto whitespace-nowrap box-scrollbar scroll-smooth w-full">
          <TabGroup
            tabs={[
              {
                id: "images",
                label: "Images",
                route: "/images",
              },
              {
                id: "floorplan",
                label: "Floorplan",
                route: "/floorplan",
              },
              {
                id: "video",
                label: "Video",
                route: "/video",
              },
              {
                id:"details",
                label:"Details",
                route:"/details"
              },
              {
                id:"contact",
                label:"Contact",
                route:"/contact"
              }
            ]}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleShare={handleShare}
            route="buy"
          />
        </div>
        <div className="mt-32 mb-6 container mx-auto px-1 pb-24 pt-0">
          {
            activeTab === 'details' && (
              // <div className="p-4">
              //   <h2 className="text-2xl font-semibold mb-2">details</h2>
              //   <p>{initialPropertyData?.details}</p>
              // </div>
              <PropertyDetails property={initialPropertyData} />
            )
          }
          {
            activeTab === 'contact' && (
              <AgentsPage 
              agents={initialPropertyData?.agentInfo || []}
              address={initialPropertyData?.addressParts?.displayAddress}
              />
            )
          }
          {
            (activeTab==='images' || activeTab==='floorplan' || activeTab==='video') && (<div className="grid grid-cols-2 gap-1">
              {initialPropertyData?.media &&
                initialPropertyData?.media.length > 0 &&
                initialPropertyData?.media.map(
                  (
                    item: {
                      url: string;
                      category: string;
                      type: string;
                    },
                    index: number
                  ) => {
                    const layoutType = index % 4;
                    const isFullWidth = layoutType === 0 || layoutType === 3;
    
                    return (
                      <>
                        {item?.type === "photo" && activeTab === "images" && (
                          <div
                            key={index}
                            className={`${isFullWidth ? "col-span-2 relative aspect-[16/9] overflow-hidden" : "relative aspect-square overflow-hidden"}`}
                            onClick={() => {
                              setSelectedImage(item.url);
                              setIsOpen(true);
                            }}
                          >
                            <img
                              src={item.url}
                              alt={item.category || "Property image"}
                              // fill
                              className="w-full h-full object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              loading="lazy"
                            />
                          </div>
                        )}
  
                        {item?.type === "floorplan" &&
                          activeTab === "floorplan" && (
                            <div
                            key={index}
                            className="col-span-2 relative aspect-[16/9] overflow-hidden"
                            onClick={() => {
                              setSelectedImage(item.url);
                              setIsOpen(true);
                            }}
                          >
                            <img
                              src={item.url}
                              alt={item.category || "Property image"}
                              // fill
                              className="w-full h-full object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              loading="lazy"
                            />
                          </div>
                        )}
                        {item?.type === "youtube" && activeTab === "video" && (
                          <div
                            key={index}
                            className="col-span-2 relative aspect-[16/9] overflow-hidden"
                          >
                            <iframe
  src={`https://www.youtube.com/embed/${item.url.split('/').pop()}`}
  className="w-full h-full object-cover"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
                          </div>
                        )}
                        
                      </>
                    );
                  }
                )}
                {initialPropertyData?.media.filter((item:{
                  type:string
                }) => item.type === 'photo').length === 0 && activeTab === 'images' && (
        <div className="col-span-2 text-center p-4"><p>No images available.</p></div>
      )}
      {initialPropertyData?.media.filter((item:{
       type:string
      }) => item.type === 'floorplan').length === 0 && activeTab === 'floorplan' && (
        <div className="col-span-2 text-center p-4"><p>No floor plans available.</p></div>
      )}
      {initialPropertyData?.media.filter((item:{ type:string }) => item.type === 'youtube').length === 0 && activeTab === 'video' && (
        <div className="col-span-2 text-center p-4"><p>No videos available.</p></div> 
      )}
            </div>)
          }
          
          
        </div>
        <ChatBotHandler
        messages={messages}
        setMessages={setMessages}
        defaultSettings={false}
        data={{
          objective:initialPropertyData?.objective,
          status:initialPropertyData?.status,
          saleMode:initialPropertyData?.saleMode,
          channel:initialPropertyData?.channel,
          id:initialPropertyData?.id,
          addressParts:initialPropertyData?.addressParts,
          bathrooms:initialPropertyData?.bathrooms,
          bedrooms:initialPropertyData?.bedrooms,
          carspaces:initialPropertyData?.carspaces,
          dateAvailable:initialPropertyData?.dateAvailable,
          dateUpdated:initialPropertyData?.dateUpdated,
          dateListed:initialPropertyData?.dateListed,
          description:initialPropertyData?.description,
          geoLocation:initialPropertyData?.geoLocation,
          headline:initialPropertyData?.headline,
          inspectionDetails:initialPropertyData?.inspectionDetails,
          isNewDevelopment:initialPropertyData?.isNewDevelopment,
          priceDetails:initialPropertyData?.priceDetails,
          propertyId:initialPropertyData?.propertyId,
          propertyTypes:initialPropertyData?.propertyTypes,
          rentalDetails:initialPropertyData?.rentalDetails,
          agentInfo:initialPropertyData?.agentInfo,
          company:{
            email:'ausrealty.gmail.com',
            name:'AusRealty',
            phone:'123456789',
            website:'www.ausrealty.com.au'
          }
        }}
        setBotThinking={setBotThinking}
        botThinking={botThinking}
        isTyping={isTyping}
        setIsTyping={setIsTyping}
        setChatOpen={setIsChatOpen}
        chatOpen={isChatOpen}
        handleShare={handleShare}
        />
      
      </div>
      <ChatWindow
      botThinking={botThinking}
      setBotThinking={setBotThinking}
      isOpen={isChatOpen}
      setIsOpen={setIsChatOpen}
      messages={messages}
      isTyping={isTyping}
      />
    </>
  );
}



export const getServerSideProps: GetStaticProps = async ({ params }) => {
  if (!params || !params.id) {
    return {
      notFound: true,
    };
  }

  try {
    // Fetch the property data at build time
    const response = await axiosInstance.get(`/api/domain/listings/${params.id}`);
    const propertyData = response?.data?.data;

    // Get the base URL for absolute URLs
    const baseUrl = 'https://devausrealty.vercel.app';

    return {
      props: {
        id: params.id as string,
        // Pass initial property data
        initialPropertyData: propertyData,
        // Pass the full URL for meta tags
        canonicalUrl: `${baseUrl}/property/buy/${params.id}`,
        // Ensure image URL is absolute
        imageUrl: propertyData?.media[0]?.url
      },
    };
  } catch (error) {
    console.error('Error fetching property:', error);
    return {
      notFound: true,
    };
  }
}

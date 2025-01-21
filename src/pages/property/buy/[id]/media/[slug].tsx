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
import { NextSeo } from 'next-seo';
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
  const property = usePropertyStore((state) => state.propertyData);
  const router = useRouter();
  const {slug} = router.query;
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [botThinking, setBotThinking] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const setProperty = usePropertyStore((state) => state.setPropertyData);
  const images = property?.media.filter((item:{type:string}) => item.type === "photo");
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
  const getListing = async (id: string) => {
    try {
      const response = await axiosInstance.get(`/api/domain/listings/${id}`);
      if (response?.data?.success) {
        setProperty(response?.data?.data);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };
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
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getListing(id);
    }
  }, [id]);
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: property?.headline,
          text: property?.details,
          url: window.location.href,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error));
    } else {
      console.log("Web share not supported");
    }
  }
  if (isLoading || !property) {
    return <PageLoader />;
  }
  return (
    <>
    <Head>
        <title>{initialPropertyData?.addressParts?.displayAddress || `Property ${id}`}</title>
        <meta name="description" content={initialPropertyData.description || `Details for property ${id}`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={initialPropertyData?.addressParts?.displayAddress || `Property ${id}`} />
        <meta property="og:description" content={initialPropertyData.description || `Details for property ${id}`} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={initialPropertyData?.addressParts?.displayAddress || `Property ${id}`} />
        <meta name="twitter:description" content={initialPropertyData.description || `Details for property ${id}`} />
        <meta name="twitter:image" content={imageUrl} />
      </Head>
    
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
        

      <div className="pl-4 py-4 fixed top-[4.4rem] z-50 bg-white overflow-x-auto whitespace-nowrap box-scrollbar scroll-smooth w-full">
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
        <div className="mt-40 mb-6 container mx-auto px-1 pb-24 pt-0">
          {
            activeTab === 'details' && (
              // <div className="p-4">
              //   <h2 className="text-2xl font-semibold mb-2">details</h2>
              //   <p>{property?.details}</p>
              // </div>
              <PropertyDetails property={property} />
            )
          }
          {
            activeTab === 'contact' && (
              <AgentsPage />
            )
          }
          {
            (activeTab==='images' || activeTab==='floorplan' || activeTab==='video') && (<div className="grid grid-cols-2 gap-1">
              {property?.media &&
                property?.media.length > 0 &&
                property.media.map(
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
                        {item?.type === "youtube" && activeTab === "video" && (
                          <div
                            key={index}
                            className={`${isFullWidth ? "col-span-2 relative aspect-[16/9]" : "relative aspect-square"}`}
                          >
                            <iframe
                              src={item.url}
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
                {property?.media.filter((item:{
                  type:string
                }) => item.type === 'photo').length === 0 && activeTab === 'images' && (
        <div className="col-span-2 text-center p-4"><p>No images available.</p></div>
      )}
      {property?.media.filter((item:{
       type:string
      }) => item.type === 'floorplan').length === 0 && activeTab === 'floorplan' && (
        <div className="col-span-2 text-center p-4"><p>No floor plans available.</p></div>
      )}
      {property?.media.filter((item:{ type:string }) => item.type === 'youtube').length === 0 && activeTab === 'video' && (
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
          objective:property?.objective,
          status:property?.status,
          saleMode:property?.saleMode,
          channel:property?.channel,
          id:property?.id,
          addressParts:property?.addressParts,
          bathrooms:property?.bathrooms,
          bedrooms:property?.bedrooms,
          carspaces:property?.carspaces,
          dateAvailable:property?.dateAvailable,
          dateUpdated:property?.dateUpdated,
          dateListed:property?.dateListed,
          description:property?.description,
          geoLocation:property?.geoLocation,
          headline:property?.headline,
          inspectionDetails:property?.inspectionDetails,
          isNewDevelopment:property?.isNewDevelopment,
          priceDetails:property?.priceDetails,
          propertyId:property?.propertyId,
          propertyTypes:property?.propertyTypes,
          rentalDetails:property?.rentalDetails,
          agents:[{
            name:'John Doe',
            phone:'123456789',
            email:'test@test.com'
          }],
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

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
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
      revalidate: 60, // Revalidate pages every 60 seconds
    };
  } catch (error) {
    console.error('Error fetching property:', error);
    return {
      notFound: true,
    };
  }
};

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
export default function ImageGallery({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [intentExtracting, setIntentExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState("images");
  const property = usePropertyStore((state) => state.propertyData);
  const router = useRouter();
  const {slug} = router.query;

  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const setProperty = usePropertyStore((state) => state.setPropertyData);
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
  if (isLoading || !property) {
    return <PageLoader />;
  }
  return (
    <>
      <NavBar backgroundColor="black" showBackButton={true} 
      backButtonLink={`/chat/looking-to-buy`}
      />
      {/* 
    @ts-ignore */}

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
        </div>
      </Modal>
      <div className="max-w-4xl mx-auto mt-20">
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
                id:"description",
                label:"Description",
                route:"/description"
              },
              {
                id:"contact",
                label:"Contact",
                route:"/contact"
              }
            ]}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        <div className="mt-40 mb-6 container mx-auto px-1 pb-24 pt-0">
          {
            activeTab === 'description' && (
              // <div className="p-4">
              //   <h2 className="text-2xl font-semibold mb-2">Description</h2>
              //   <p>{property?.description}</p>
              // </div>
              <PropertyDetails property={property} />
            )
          }
          {
            activeTab === 'Contact' && (
              <div className="p-4">
                <h2 className="text-2xl font-semibold mb-2">Contact</h2>
                <p>{property?.contact}</p>
              </div>
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
        <div
                className={`z-10 w-full fixed left-0 right-0 bg-white px-6 bottom-0 py-4 text-center`}
              >
                <div className="flex flex-col gap-6">
                  <div className="w-full max-w-md mx-auto relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder={"How can we help? Tell us here"}
                      // disabled={indexPage ? intentExtracting : false}
                      autoCapitalize="on"
                      
                      className="start-campaign-input w-full  z-10 flex-grow p-2 bg-lightgray rounded-md py-5 pl-3 pr-8 outline-none focus:outline-none resize-none overflow-y-hidden"
                    />
                    <button
                      onClick={handleSend}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black"
                    >
                      <IoSend title="Send" 
                      className="w-5 h-5"
                      />
                    </button>
                   
                    
                    
                  </div>
      </div>
      </div>
      </div>
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

  return {
    props: {
      id: params.id as string,
    },
  };
};

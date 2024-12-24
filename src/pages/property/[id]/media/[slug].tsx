import NavBar from "@/components/layout/Navba";
import Modal from "@/components/ui/Modal";
import { TabGroup } from "@/components/ui/TabGroup";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePropertyStore } from "@/store/propertyStore";
import { GetStaticProps } from "next";
import axiosInstance from "@/utils/axios-instance";
import PageLoader from "@/components/ui/PageLoader";
export default function ImageGallery({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [activeTab, setActiveTab] = useState("images");
  const property = usePropertyStore((state) => state.propertyData);
  const router = useRouter();
  // const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
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
  useEffect(() => {
    if (id && !property) {
      setIsLoading(true);
      getListing(id);
    }
  }, [id]);
  if (isLoading || !property) {
    return <PageLoader />;
  }
  return (
    <>
      <NavBar backgroundColor="black" showBackButton={true} />
      {/* 
    @ts-ignore */}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="max-w-[800px]"
      >
        <div className="relative aspect-[16/9]">
          <Image
            src={selectedImage}
            alt="Property image"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Modal>
      <div className="max-w-4xl mx-auto">
        <div className="mt-4 mb-6 ml-4">
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
            ]}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        <div className="container mx-auto px-1 pb-8 mt-0 pt-0">
          <div className="grid grid-cols-2 gap-1">
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
                          className={`${isFullWidth ? "col-span-2 relative aspect-[16/9]" : "relative aspect-square"}`}
                          onClick={() => {
                            setSelectedImage(item.url);
                            setIsOpen(true);
                          }}
                        >
                          <Image
                            src={item.url}
                            alt={item.category || "Property image"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {item?.type === "floorplan" &&
                        activeTab === "floorplan" && (
                          <div
                            key={index}
                            className={`${isFullWidth ? "col-span-2 relative aspect-[16/9]" : "relative aspect-square"}`}
                            onClick={() => {
                              setSelectedImage(item.url);
                              setIsOpen(true);
                            }}
                          >
                            <Image
                              src={item.url}
                              alt={item.category || "Property image"}
                              fill
                              className="object-cover"
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

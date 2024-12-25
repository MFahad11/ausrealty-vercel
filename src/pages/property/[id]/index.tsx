import NavBar from '@/components/layout/Navbar'
import PageLoader from '@/components/ui/PageLoader';
import axiosInstance from '@/utils/axios-instance';
import dayjs from 'dayjs';
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { usePropertyStore } from '@/store/propertyStore';
export default function PropertyListing(
  {id}: {id: string}
) {
  const router=useRouter();
  // const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const setProperty = usePropertyStore((state) => state.setPropertyData);
  const property = usePropertyStore((state) => state.propertyData);
const getListing = async (id:string) => {
  try {
    const response= await axiosInstance.get(`/api/domain/listings/${id}`);
    if(response?.data?.success){
      setProperty(response?.data?.data);
    }
  } catch (error) {
    console.log("error", error);
  } finally {
    setIsLoading(false);
  }
}
  useEffect(() => {
    if(id){
      setIsLoading(true);
      getListing(id);
    }
  }, [id])
  if(isLoading || !property){
    return <PageLoader/>
  }

  return (
    <>
    <NavBar
    showBackButton={true}
    />
    <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center">
      {
        property?.media && property?.media.length > 0 && (
          <div className="relative min-w-[437px] w-full cursor-pointer"
          onClick={() => {
            router.push(`/property/${id}/media/images`)
          }}
          >
          {property?.media[0]?.category ===
            "image" ? (
              <img
                src={property?.media[0]?.url}
                alt={property?.headline}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={property?.media[0]?.url}
                className="w-full h-full object-cover"
                controls
              />
            )}
            </div>
        )
      }
      

      <div className="py-6 ml-6">
        <div className="mb-2">
          <h3 className="mb-3 tracking-wide font-semibold">
          FOR {property?.objective.toUpperCase()}
          </h3>
          <h4
          className='text-black'
          >
          {property?.addressParts.displayAddress}
          </h4>
        </div>

        {/* Property Details */}
        <div className="mb-6 text-sm">
        <h4 className="text-black mb-0">
                                          {/* 4B 4B 2C | House */}
                                          {property?.bedrooms}B{" "}
                                          {property?.bathrooms}B{" "}
                                          {property?.carspaces}C |{" "}
                                          {property?.propertyTypes?.length > 0
                                            ? property?.propertyTypes?.join(",")
                                            : "N/A"}
                                        </h4>
          <p
          className="leading-7"
          >Inspection {dayjs(property?.dateAvailable)?.format("DD/MM/YYYY")}</p>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h4 className=" text-black mb-6 uppercase leading-7">
            {property?.headline}
          </h4>
          <p className="leading-7">
            {property?.description}
          </p>
        </div>
      </div></div>
    </div></>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [], // Pre-render no pages initially
    fallback: true, // Enable fallback for on-demand generation
  };
};

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

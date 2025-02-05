import Button from "@/components/ui/Button";
import { useRouter } from "next/router";
import axios from "axios";
import ChatBotHandler from "@/components/chat/ChatBotHandler";
import Head from "next/head";
import { useIsMessageStore } from "@/store/isMessageStore";
import { useEffect, useState } from "react";
import NavBar from "@/components/layout/Navbar";
import { usePropertyStore } from "@/store/propertyStore";
import { useAgentStore } from "@/store/agentStore";
import axiosInstance from "@/utils/axios-instance";

export default function Index({ data }: { data: any }) {
  const navigate = useRouter();
  const setIsMessage = useIsMessageStore((state) => state.setIsMessage);
  const isMessage = useIsMessageStore((state) => state.isMessage);
  const fetchedProperties = usePropertyStore((state) => state.propertyData);
  const setFetchedProperties = usePropertyStore((state) => state.setPropertyData);
  const agents = useAgentStore((state) => state.agents);
  const setAgents = useAgentStore((state) => state.setAgents);
  const [fetchingAgents, setFetchingAgents] = useState(false);
  const [fetchingProperties, setFetchingProperties] = useState(false);
  const fetchAgents = async () => {
    setFetchingAgents(true);
    try {
      const response = await axiosInstance.get("/api/agent");
      if (response?.data?.success) {
        setAgents(response?.data?.data);
      }
    } catch (error) {}
  };

  const getAllProperties = async () => {
    try {
      const response = await axiosInstance.post("/api/domain/listings");
      if (response.data.success) {
        const properties = response.data.data;
        if (properties.length > 0) {
          setFetchedProperties(properties);
        }
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };
  useEffect(() => {
    if (agents?.length === 0 && !fetchingAgents) {
      fetchAgents();
    }
    if (fetchedProperties?.length === 0 && !fetchingProperties) {
      getAllProperties();
    }
  
    if (localStorage.getItem("INDEX_PROMPT")) {
      localStorage.removeItem("INDEX_PROMPT");
      setIsMessage(false);
    }
  }, []);
  
  return (
    <div className="overflow-hidden">
      <Head>
        <title key={"title"}>{`Ausrealty`}</title>
      </Head>
      {!isMessage ? (
        <div className=" max-w-4xl mx-auto px-4 flex flex-col items-center md:mt-4 overflow-hidden">
          <div className="relative w-full">
          <video
  autoPlay
  loop
  muted
  playsInline
  className="w-full h-full object-cover block sm:hidden"
>
  {/* Portrait Video for Mobile */}
  <source
    src="https://ausrealty-next.s3.ap-southeast-2.amazonaws.com/uploads/f14ab7af-2c31-4bce-963b-9085f7b3d1ad-ausrealty_website_reel.mp4"
    type="video/mp4"
  />
</video>

<video
  autoPlay
  loop
  muted
  playsInline
  className="w-full h-full object-cover hidden sm:block"
>
  {/* Landscape Video for Desktop */}
  <source
    src="https://ausrealty-next.s3.ap-southeast-2.amazonaws.com/uploads/6e4c15ba-ce8d-4e4c-94ef-97beeba83479-ausrealty_website_reel.mp4"
    type="video/mp4"
  />
</video>

          </div>

          <div>
            {/* @ts-ignore */}

            <ChatBotHandler data={data} indexPage={true} />
          </div>

          <div></div>
        </div>
      ) : (
        <>
          <NavBar />{" "}
          <div className="mt-10">
            {/* @ts-ignore */}

            <ChatBotHandler data={data} indexPage={true} />
          </div>
        </>
      )}
    </div>
  );
}

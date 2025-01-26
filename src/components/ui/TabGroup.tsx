import { useState } from "react"
import { useRouter } from "next/router"
import { cn } from "@/utils/helpers"
import Button from "./Button"
import { LuShare2 } from "react-icons/lu"
import Link from "next/link"
interface TabGroupProps {
  tabs: {
    id: string
    label: string
    route: string
  }[]
  defaultTab?: string
  activeTab?: string
  setActiveTab: (tab: string) => void
  handleShare: () => void
  route: string
  address?: string
}

export function TabGroup({ tabs, defaultTab,activeTab, setActiveTab,handleShare,route,address }: TabGroupProps) {
  
  const navigate=useRouter()
  return (
    // <div className="flex gap-4 p-1 w-fit rounded-lg justify-start">
    //   {tabs.map((tab) => (
    //     <button
    //       key={tab.id}
    //       onClick={() => {
    //         setActiveTab(tab.id)
    //         navigate.push(
    //           `/property/${route}/${navigate.query.id}/media/${tab.route}`
    //         )
    //       }}
    //       className={cn(
    //         "px-6 py-2 text-sm rounded-lg transition-colors",
    //         "hover:bg-mediumgray",
    //         activeTab === tab.id ? "bg-mediumgray" : "border border-black"
    //       )}
          
    //     >
    //       {tab.label}
    //     </button>
    //   ))}
    //   <Button
    //             // key={tab.id}
    //             onClick={handleShare}
    //             className="hidden bg-black text-white px-6 gap-2 py-2 rounded-lg text-sm transition-colors md:flex justify-center items-center"
                
    //           >
    //             <LuShare2/>
    //             Share
    //           </Button>
    //     {
    //       route!=="buy" && (<Link
    //           target="_blank"
    //           href={`https://2apply.com.au/Form?AgentAccountName=ausrealty&Address=${address}`}
    //             // key={tab.id}
    //             // onClick={handleShare}
    //             className="hidden bg-black text-white px-6 gap-2 py-2 rounded-lg text-sm transition-colors md:flex justify-center items-center">
    //             Apply
    //           </Link>)
    //     }
              
    // </div>
    <div className="bg-white p-1 w-full flex justify-center">
        <div className="max-w-4xl mx-auto flex overflow-x-auto whitespace-nowrap box-scrollbar scroll-smooth my-scroll-container">
          {tabs.map((tab, index) => (
            <div
              key={index}
              data-id={tab.id} // Attach data-id for easy selection
              className={`cursor-pointer rounded flex-shrink-0 inline-flex flex-col items-center mr-2 py-2 px-4 relative
              ${activeTab === tab.id ? "bg-mediumgray" : "bg-lightgray"}
            `}
              onClick={() => {
                setActiveTab(tab.id)
                  navigate.push(
                    `/property/${route}/${navigate.query.id}/media/${tab.route}`
                  )
              }}
            >
              <div className="relative text-center">
                <div className="text-xs m-0">
                  <div className="flex items-center">
                    <h6 className="text-capitalize">
                    {tab.label}
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
  )
}

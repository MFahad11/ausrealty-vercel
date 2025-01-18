import { useState } from "react"
import { useRouter } from "next/router"
import { cn } from "@/utils/helpers"
import Button from "./Button"
import { LuShare2 } from "react-icons/lu"
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
}

export function TabGroup({ tabs, defaultTab,activeTab, setActiveTab,handleShare,route }: TabGroupProps) {
  
  const navigate=useRouter()
  return (
    <div className="flex gap-4 p-1 w-fit rounded-lg justify-start">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id)
            navigate.push(
              `/property/${route}/${navigate.query.id}/media/${tab.route}`
            )
          }}
          className={cn(
            "px-6 py-2 text-sm rounded-lg transition-colors",
            "hover:bg-mediumgray",
            activeTab === tab.id ? "bg-mediumgray" : "border border-black"
          )}
          
        >
          {tab.label}
        </button>
      ))}
      <Button
          // key={tab.id}
          onClick={handleShare}
          className="bg-black text-white px-6 gap-2 py-2 text-sm rounded-lg transition-colors flex justify-center items-center"
          
        >
          <LuShare2/>
          Share
        </Button>
    </div>
  )
}

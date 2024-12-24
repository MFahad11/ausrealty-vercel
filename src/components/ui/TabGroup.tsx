import { useState } from "react"
import { cn } from "../lib/utils"
import { useRouter } from "next/router"
interface TabGroupProps {
  tabs: {
    id: string
    label: string
    route: string
  }[]
  defaultTab?: string
  activeTab?: string
  setActiveTab: (tab: string) => void
}

export function TabGroup({ tabs, defaultTab,activeTab, setActiveTab }: TabGroupProps) {
  
  const navigate=useRouter()
  return (
    <div className="flex gap-4 p-1 w-fit rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id)
            navigate.push(
              `/property/${navigate.query.id}/media/${tab.route}`
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
    </div>
  )
}

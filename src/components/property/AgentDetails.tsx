import Image from 'next/image'
import Link from 'next/link'
import { LuFacebook, LuGlobe, LuLinkedin, LuMail, LuPhone, LuTwitter } from 'react-icons/lu'
import AgentCard from './AgentCard'
import { useState } from 'react'
import BookingOverlay from '../chat/BookApraisal/Overlay'
interface Agent {
    dateUpdated?: string
    agencyId?: number
    agentId?: number
    email?: string
    firstName?: string
    mobile?: string
    picture?: string
    lastName?: string
    isActiveProfilePage?: string
    phone?: string
    saleActive?: boolean
    rentalActive?: boolean
    secondaryEmail?: string
    facebookUrl?: string
    twitterUrl?: string
    agentVideo?: string
    profileText?: string
    isHideSoldLeasedListings?: boolean
    googlePlusUrl?: string
    personalWebsiteUrl?: string
    linkedInUrl?: string
    fax?: string
    mugShotURL?: string
    mugShotNew?: string
    contactTypeCode?: number
    receivesRequests?: boolean
    creAgentVideoURL?: string
    receiveScheduledReportEmail?: boolean
    profileUrl?: string
    jobPosition?: string
  }
// Mock data - replace with your actual data fetching


export default function AgentsPage({agents,address}:{
  agents:any,
  address:any
}) {
    const [isOverlayOpen, setIsOverlayOpen] = useState(false)
    const [agent, setAgent] = useState(null)

  return (
    <><BookingOverlay isOpen={isOverlayOpen} onClose={() => {
      setIsOverlayOpen(false)
      setAgent(null)
    }} 
          agent={agent} availableAgents={agents} address={address}
          /><div className="container mx-auto px-4 pb-24">
        <h1 className="tracking-wider text-center mb-12 uppercase">
          Our Agents
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent:any, index:number) => (
            <AgentCard
              index={index}
              agent={agent}
              showLinks={true}
              isOverlayOpen={isOverlayOpen}
              setIsOverlayOpen={setIsOverlayOpen}
              totalAgents={agents.length}
              setAgent={setAgent}
              />
          ))}
        </div>
      </div></>
    
  )
}

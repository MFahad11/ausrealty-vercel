import Image from 'next/image'
import Link from 'next/link'
import { LuFacebook, LuGlobe, LuLinkedin, LuMail, LuPhone, LuTwitter } from 'react-icons/lu'
import AgentCard from './AgentCard'
import { useState } from 'react'
interface Agent {
    dateUpdated?: string
    agencyId?: number
    agentId?: number
    email?: string
    firstName?: string
    mobile?: string
    photo?: string
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
const agents: Agent[] = [
    {
        firstName: "John",
        lastName: "Smith",
        jobPosition: "Senior Sales Agent",
        email: "john.smith@ausrealty.com",
        phone: "0400 000 000",
        profileText: "With over 10 years of experience in Sydney's premium real estate market...",
        photo:"https://ausrealty-next.s3.ap-southeast-2.amazonaws.com/uploads/79b2b285-31c5-4100-8e20-07952460b80d-Chris%20-%20Web.jpg",
        mugShotURL: "https://ausrealty-next.s3.ap-southeast-2.amazonaws.com/uploads/79b2b285-31c5-4100-8e20-07952460b80d-Chris%20-%20Web.jpg",
        facebookUrl: "https://facebook.com",
        twitterUrl: "https://twitter.com",
        linkedInUrl: "https://linkedin.com",
        personalWebsiteUrl: "https://example.com",
        saleActive: true,
        rentalActive: true
      },
      {
        firstName: "John",
        lastName: "Smith",
        jobPosition: "Senior Sales Agent",
        email: "john.smith@ausrealty.com",
        phone: "0400 000 000",
        profileText: "With over 10 years of experience in Sydney's premium real estate market...",
        photo:"https://ausrealty-next.s3.ap-southeast-2.amazonaws.com/uploads/79b2b285-31c5-4100-8e20-07952460b80d-Chris%20-%20Web.jpg",
        mugShotURL: "https://ausrealty-next.s3.ap-southeast-2.amazonaws.com/uploads/79b2b285-31c5-4100-8e20-07952460b80d-Chris%20-%20Web.jpg",
        facebookUrl: "https://facebook.com",
        twitterUrl: "https://twitter.com",
        linkedInUrl: "https://linkedin.com",
        personalWebsiteUrl: "https://example.com",
        saleActive: true,
        rentalActive: true
      }
  // Add more agents as needed
]

export default function AgentsPage() {
    const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  return (
    <div className="container mx-auto px-4 py-12">
        <h1 className="tracking-wider text-center mb-12 uppercase">
          Our Agents
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent, index) => (
            <AgentCard


              index={index}
              agent={agent}
              showLinks={true}
              isOverlayOpen={isOverlayOpen}
              setIsOverlayOpen={setIsOverlayOpen}
              />
          ))}
        </div>
      </div>
  )
}

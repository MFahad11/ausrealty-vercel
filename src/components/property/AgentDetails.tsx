import Image from 'next/image'
import Link from 'next/link'
import { LuFacebook, LuGlobe, LuLinkedin, LuMail, LuPhone, LuTwitter } from 'react-icons/lu'
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
  return (
    <div className="container mx-auto px-4 py-12">
        <h1 className="tracking-wider text-center mb-12 uppercase">
          Our Agents
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent, index) => (
            <div key={index} className="bg-white border border-darkgray rounded-md shadow-md">
              <div className="relative aspect-[3/4] w-full">
                <img
                  src={agent.photo || "/placeholder.svg"}
                  alt={`${agent.firstName} ${agent.lastName}`}
                //   fill
                  className="object-cover"
                />
              </div>
              
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-light tracking-wider uppercase">
                    {agent.firstName} {agent.lastName}
                  </h2>
                  {agent.jobPosition && (
                    <p className="text-sm text-gray-600 mt-1">
                      {agent.jobPosition}
                    </p>
                  )}
                </div>

                {agent.profileText && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {agent.profileText}
                  </p>
                )}

                <div className="space-y-2">
                  {agent.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <LuPhone className="w-4 h-4" />
                      <a href={`tel:${agent.phone}`} className="hover:underline">
                        {agent.phone}
                      </a>
                    </div>
                  )}
                  
                  {agent.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <LuMail className="w-4 h-4" />
                      <a href={`mailto:${agent.email}`} className="hover:underline">
                        {agent.email}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-4 pt-4 border-t">
                  {agent.facebookUrl && (
                    <Link href={agent.facebookUrl} className="text-gray-600 hover:text-black">
                      <LuFacebook className="w-5 h-5" />
                    </Link>
                  )}
                  {agent.twitterUrl && (
                    <Link href={agent.twitterUrl} className="text-gray-600 hover:text-black">
                      <LuTwitter className="w-5 h-5" />
                    </Link>
                  )}
                  {agent.linkedInUrl && (
                    <Link href={agent.linkedInUrl} className="text-gray-600 hover:text-black">
                      <LuLinkedin className="w-5 h-5" />
                    </Link>
                  )}
                  {agent.personalWebsiteUrl && (
                    <Link href={agent.personalWebsiteUrl} className="text-gray-600 hover:text-black">
                      <LuGlobe className="w-5 h-5" />
                    </Link>
                  )}
                </div>

                <div className="flex justify-center gap-4 text-xs">
                  {agent.saleActive && (
                    <span className="px-3 py-1 bg-black text-white uppercase">
                      Sales
                    </span>
                  )}
                  {agent.rentalActive && (
                    <span className="px-3 py-1 bg-black text-white uppercase">
                      Rentals
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
  )
}

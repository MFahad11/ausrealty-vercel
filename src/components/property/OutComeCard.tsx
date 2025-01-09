'use client'

import Image from 'next/image'
import { IoBed, IoBusiness } from "react-icons/io5"
import { FaParking } from "react-icons/fa"
import Button from '../ui/Button'

export default function OutComeCard({
  index,
  total
}:{
  index:number,
  total:number
}) {
  return (
    <div className="overflow-hidden bg-white shadow">
      {/* Image container with relative positioning for the Sold badge */}
      <div className="relative">
        <img
          src="https://b.domainstatic.com.au/2019513413_1_1_240924_031040-w1000-h750"
          alt="House exterior"
        //   width={400}
        //   height={300}
          className="w-full object-cover"
        />
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <p className="text-sm m-0 p-0">Sold</p>
        </div>
        <div className="absolute top-4 right-4 bg-black text-white backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
          
          <span className="text-sm">
            {index} of {total}
          </span>
        </div>
      </div>

      {/* Property details */}
      <div className="px-2 py-4 space-y-3">
        <div className="">
          <h2 className="mb-1 p-0">$2,030,000</h2>
          <p className="text-gray-600">3 Lime Kid Road, Lugarno</p>
        </div>

        {/* Icons row */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <IoBed className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">5</span>
          </div>
          <div className="flex items-center gap-1">
            <IoBusiness className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">2</span>
          </div>
          <div className="flex items-center gap-1">
            <FaParking className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">2</span>
          </div>
          <div className="text-sm text-gray-600">House</div>
        </div>

        <p className="text-sm text-gray-500">Sold 24 Dec 2024</p>


        
      </div>
    </div>
  )
}

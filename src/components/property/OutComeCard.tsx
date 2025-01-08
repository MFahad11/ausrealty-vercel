'use client'

import Image from 'next/image'
import { IoBed, IoBusiness } from "react-icons/io5"
import { FaParking } from "react-icons/fa"

export default function OutComeCard() {
  return (
    <div className=" overflow-hidden bg-white shadow">
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
          <span className="text-sm">Sold</span>
        </div>
      </div>

      {/* Property details */}
      <div className="p-4">
        <div className="mb-2">
          <h2 className="text-2xl font-semibold">$2,030,000</h2>
          <p className="text-gray-600">3 Lime Kid Road, Lugarno</p>
        </div>

        {/* Icons row */}
        <div className="flex items-center gap-6 mb-2">
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

        <p className="text-sm text-gray-500 mb-4">Sold 24 Dec 2024</p>

        {/* Reserve button */}
        <button className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition-colors">
          RESERVE APPOINTMENT
        </button>
      </div>
    </div>
  )
}


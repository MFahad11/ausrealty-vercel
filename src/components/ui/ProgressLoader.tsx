

import React, { useEffect, useState } from 'react'

interface ProgressLoaderProps {
  duration?: number
}

const ProgressLoader: React.FC<ProgressLoaderProps> = ({ duration = 1000 }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval)
          return 100
        }
        return prevProgress + 1
      })
    }, duration / 100)

    return () => clearInterval(interval)
  }, [duration])

  return (
    <div className="w-64">
    <div className="w-full h-1 bg-lightgray rounded-full overflow-hidden">
      <div
        className="h-full bg-black transition-all duration-100 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div></div>
  )
}

export default ProgressLoader


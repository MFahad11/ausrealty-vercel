import React from 'react'
import Loader from './Loader'
import ProgressLoader from './ProgressLoader'

const PageLoader = ({duration}:{
  duration?: number
}) => {
  return (
    <div
    className='fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white z-50'
    ><ProgressLoader
    duration={duration}
    /></div>
  )
}

export default PageLoader

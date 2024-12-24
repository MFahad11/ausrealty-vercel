import React from 'react'
import Loader from './Loader'

const PageLoader = () => {
  return (
    <div
    className='fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white z-50'
    ><Loader/></div>
  )
}

export default PageLoader

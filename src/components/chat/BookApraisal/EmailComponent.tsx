import GooglePlacesAutocomplete from '@/components/GooglePlacesAutoComplete'
import Button from '@/components/ui/Button'
import { showToast } from '@/components/ui/toast'
import axiosInstance from '@/utils/axios-instance'
import { useState } from 'react'

interface EmailComponentProps {
  // onSubmit: (email: string) => void
  onBack: () => void
    email: string
    setEmail: any
    setStep: any
    name: string
    setName: any
    setAddress: any
    address: string
}

export default function EmailComponent({  onBack,email, setEmail,setStep,
  name,setName,setAddress,address
}: EmailComponentProps) {
  const [mailError, setMailError] = useState('')
  const [nameError,setNameError]=useState('')
  const [loading, setLoading] = useState(false)
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleSubmit = async () => {
    setMailError('')
    setNameError('')
    
    if (!email) {
      setMailError('Email is required')
      return
    }

    if (!validateEmail(email)) {
      setMailError('Please enter a valid email')
      return
    }
    if (!name) {
      setNameError('Name is required')
      return
    }


setStep(4)
  }

  return (
    <div className="w-full">
       
      <form className="space-y-4 mt-2">
          <div>
            <input
              type="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="form-input border border-darkgray w-full"
            />
            {nameError && <span className="text-red-500 text-sm mt-1">{nameError}</span>}
          </div>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="form-input border border-darkgray w-full"
            />
            {mailError && <span className="text-red-500 text-sm mt-1">{mailError}</span>}
          </div>
          <div
          className='booking'
          >
            <GooglePlacesAutocomplete
              onSelectAddress={setAddress}
              address={address}
              setAddress={setAddress}
              placeholder="Enter your address"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={onBack}
              className="gray-button"
              disabled={loading}
            >
              Back
            </Button>
            <Button
              // type="submit"
              loading={loading}
              disabled={loading}
              onClick={handleSubmit}
              className="black-button"
            >
              Next
            </Button>
          </div>
        </form>

        
      </div>
  )
}


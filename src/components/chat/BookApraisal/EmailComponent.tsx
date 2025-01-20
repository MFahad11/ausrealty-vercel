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
}

export default function EmailComponent({  onBack,email, setEmail,setStep }: EmailComponentProps) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleSubmit = async () => {
    setError('')
    
    if (!email) {
      setError('Email is required')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email')
      return
    }
// setLoading(true)
//     try {
//       const response= await axiosInstance.post('/api/auth/sendOtp', { email })
//       if(response?.data?.success){
//         setLoading(false)
//         setStep(4)
//         showToast('success','OTP sent successfully')
//       }
//     } catch (error) {
//       showToast('error','Error sending OTP. Please try again')
//       setLoading(false)
//       setError('Error sending OTP. Please try again')
//     }
setStep(4)
  }

  return (
    <div className="w-full">
        <h4>Enter your email</h4>
        <p>We'll send you an OTP to verify your email</p>
      <form className="space-y-4 mt-2">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="form-input border border-darkgray w-full"
            />
            {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
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


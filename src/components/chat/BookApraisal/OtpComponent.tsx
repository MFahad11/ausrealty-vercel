import Button from '@/components/ui/Button'
import { showToast } from '@/components/ui/toast'
import axiosInstance from '@/utils/axios-instance'
import { useState, useRef, useEffect } from 'react'
import { FaSpinner } from 'react-icons/fa'

interface OTPComponentProps {
  onBack: () => void
  onResend: () => void
  email: string
  setStep: any
}

export default function OTPComponent({ setStep, onBack, onResend, email }: OTPComponentProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const [isResending, setIsResending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async () => {

    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      setError('Please enter all digits')
      return
    }
    setOtp(['', '', '', '', '', ''])
    setIsVerifying(true)
    try {
      const response= await axiosInstance.post('/api/auth/verifyOtp', { email, otp: otpString })
      if(response?.data?.success){
        setIsVerifying(false)
        setStep(5)
        showToast('success','OTP verified successfully')
      }
    } catch (error) {
      setIsVerifying(false)
      showToast('error','Error verifying OTP. Please try again')
      setError('Error verifying OTP. Please try again')
      
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      const response= await axiosInstance.post('/api/auth/sendOtp', { email })
      if(response?.data?.success){
        setResendTimer(60)
        setIsResending(false)
      }
    } catch (error) {
      console.error('Error re-sending OTP:', error)
      setIsResending(false)
      setError('Error re-sending OTP. Please try again')
    }
  }

  return (
    <div className="w-full">
        

    <p className="text-black text-sm mb-2">
      Enter the verification code sent to your email
    </p>

    <form className="space-y-6">
      <div className="flex justify-between">
        {otp.map((digit, index) => (
          <input
            key={index}
            // @ts-ignore
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 text-center border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-darkgray text-lg"
          />
        ))}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-gray-500">
            Resend code in {resendTimer} seconds
          </p>
        ) : (
          isResending ? (
            <FaSpinner className="animate-spin text-black mx-auto" />
          ):(<button
            type="button"
            onClick={handleResend}
            className="text-black underline"
          >
            Resend code
          </button>)
          
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          onClick={onBack}
          disabled={isVerifying}
          className={`${resendTimer > 0 ? 'gray-button' : 'black-button'}`}
        >
          Back
        </Button>
        {
          resendTimer > 0 && (<Button
          onClick={() => {
            handleSubmit()
          }}
          loading={isVerifying}
          disabled={isVerifying}
          type="submit"
          className="black-button"
        >
          Verify
        </Button>)
        }
        
      </div>
    </form>
  </div>
  )
}


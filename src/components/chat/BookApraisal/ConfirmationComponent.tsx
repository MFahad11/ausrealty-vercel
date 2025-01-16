
interface BookingDetails {
  date: Date
  startTime: string
  endTime: string
  email: string
  agentName: string
  agentEmail: string
  agentIds: string[]
}

interface ConfirmationComponentProps {
  details: BookingDetails
  onBack: () => void
  setStep: (step: number) => void
  onClose: any
}
import axiosInstance from "@/utils/axios-instance"
import { showToast } from "../../ui/toast";
import dayjs from "dayjs"
import Button from "@/components/ui/Button"
import { useState } from "react"
export default function ConfirmationComponent({
  details,
  onBack,
  setStep,
  onClose
}: ConfirmationComponentProps) {
  const [isCreating, setIsCreating] = useState(false);
  const onConfirm = async () => {
    setIsCreating(true);
    const res = await axiosInstance.post('/api/booking/addBooking', details);
    if (res.data.success) {
      showToast('success','Booking confirmed!');
      onClose();
      setStep(1);
      setIsCreating(false);
    } else {
      showToast('error','Failed to confirm booking');
      setIsCreating(false);
    }
  };
  return (
    <><div className="w-full">
      <h2>CONFIRM BOOKING</h2>
        <div className="space-y-4 mb-6">
          <div className="border-b pb-4">
            <h4 className="text-sm text-gray-500 mb-1">DATE</h4>
            <p >{
              dayjs(details.date).format('MMMM D, YYYY')
              }</p>
          </div>

          <div className="border-b pb-4">
            <h4 className="text-sm text-gray-500 mb-1">TIME</h4>
            <p >
              {details.startTime} - {details.endTime}
            </p>
          </div>

          <div className="border-b pb-4">
            <h4 className="text-sm text-gray-500 mb-1">YOUR EMAIL</h4>
            <p >{details.email}</p>
          </div>

          <div className="border-b pb-0">
            <h4 className="text-sm text-gray-500 mb-1">AGENT</h4>
            <p >{details.agentName}</p>
            <p className="text-sm text-gray-500">{details.agentEmail}</p>
          </div>
        </div>

        <div className="bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-lg">
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              By confirming this booking, you agree to our terms and conditions.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={onBack}
              diabled={isCreating}
              className="grey-button"
            >
              Back
            </Button>
            <Button
              onClick={onConfirm}
              className="black-button"
              loading={isCreating}
              disabled={isCreating}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </div></>
    
  )
}

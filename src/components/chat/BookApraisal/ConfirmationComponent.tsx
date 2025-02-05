
interface BookingDetails {
  date: Date
  startTime: string
  // endTime: string
  email: string
  name:string
  agentName: string
  agentEmail: string
  agentId: string
  address: string
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
              {details.startTime}
            </p>
          </div>

          <div className="border-b pb-4">
            <h4 className="text-sm text-gray-500 mb-1">YOUR EMAIL</h4>
            <p >{details.email}</p>
          </div>
          <div className="border-b pb-4">
            <h4 className="text-sm text-gray-500 mb-1">YOUR NAME</h4>
            <p >{details.name}</p>
          </div>
          <div className="border-b pb-4">
            <h4 className="text-sm text-gray-500 mb-1">PROPERTY ADDRESS</h4>
            <p >{details.address}</p>
          </div>
          <div className="border-b pb-0">
            <h4 className="text-sm text-gray-500 mb-1">AGENT</h4>
            <p >{details.agentName}</p>
            <p className="text-sm text-gray-500">{details.agentEmail}</p>
          </div>
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
      </div></>
    
  )
}

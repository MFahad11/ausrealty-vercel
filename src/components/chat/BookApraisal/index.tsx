import Button from "../../ui/Button";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiMinus } from "react-icons/fi";
import { FaPlus } from "react-icons/fa6";
import Calendar from "react-calendar";
import axiosInstance from "@/utils/axios-instance";
import "react-calendar/dist/Calendar.css";

import Modal from "../../ui/Modal";
import EditableField from "../../ui/EditableField";
import { showToast } from "../../ui/toast";
import { Autocomplete } from "@react-google-maps/api"; // Removed useJsApiLoader
import { IoSend } from "react-icons/io5";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import EmailComponent from "./EmailComponent";
import OTPComponent from "./OtpComponent";
import ConfirmationComponent from "./ConfirmationComponent";



const tileDisabled = ({ date, view }:{
    date: Date
    view: string
}) => {
  if (view === "month") {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight
    date.setHours(0, 0, 0, 0); // Normalize to midnight
    return date < today; // Disable dates before today
  }
  return false; // Do not disable other views
};

const BookAppraisalList = ({
  bookAppraisalData,
  setBookAppraisalData,
  onUpdateBookingView,
}:{
    bookAppraisalData: any[]
    setBookAppraisalData: (arg0: any) => void
    onUpdateBookingView: (arg0: boolean) => void
}) => {
  const navigate = useRouter()
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [bookingToReschedule, setBookingToReschedule] = useState(null);
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [endTimes, setEndTimes] = useState<string[]>([]);
  const [date, setDate] = useState(new Date());

  const [limitBooking, setLimitBooking] = useState(false);
  const [loading, setLoading] = useState(false);
 
  const handleChangeBookingView = () => {
    // Count the number of active bookings
    const activeBookingsCount = bookAppraisalData.filter(
      (booking) => booking.status === "Active"
    ).length;

    // Check if there is more than one active booking
    if (activeBookingsCount > 0) {
      setLimitBooking(true); // Show the modal if more than 1 active booking
    } else {
      onUpdateBookingView(false); // Proceed with booking creation if 1 or 0 active bookings exist
    }
  };

  const handleEndTimeChange = (e:any) => {
    setNewEndTime(e.target.value);
  };

  // const handleCancelModalSubmit = async () => {
  //   if (!bookingToCancel) return;

  //   try {
  //     setLoading(true);
  //     const response = await axiosInstance.put(`/bookings/cancel/${bookingToCancel}`);

  //     // Remove the canceled booking from the state
  //     setBookAppraisalData((prevData:{
  //       _id: string
  //     }[]) =>
  //       prevData.filter((booking) => booking._id !== bookingToCancel)
  //     );

  //     setIsCancelModalOpen(false);
  //   } catch (error) {
  //     console.error("Error canceling booking:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleRescheduleModalSubmit = async () => {
    if (!bookingToReschedule || !newStartTime || !newEndTime) {
      console.error("Start time and End time are required.");
      return;
    }

    try {
      setLoading(true);
      const formattedDate = dayjs(date).format("YYYY-MM-DD");
      const startTime = dayjs(
        `${formattedDate} ${newStartTime}`,
        "YYYY-MM-DD h:mm a"
      ).format("YYYY-MM-DDTHH:mm:ssZ");
      const endTime = dayjs(
        `${formattedDate} ${newEndTime}`,
        "YYYY-MM-DD h:mm a"
      ).format("YYYY-MM-DDTHH:mm:ssZ");

      // const response = await axiosInstance.put(`/bookings/${bookingToReschedule}`, {
      //   newStartTime: startTime,
      //   newEndTime: endTime,
      // });

      // console.log("Reschedule response:", response.data);

      // // Update the booking data in the UI
      // setBookAppraisalData((prevData:{
      //   _id: string
      // }[]) =>
      //   prevData.map((booking) =>
      //     booking._id === bookingToReschedule
      //       ? { ...booking, startTime, endTime }
      //       : booking
      //   )
      // );

      setIsRescheduleModalOpen(false);
    } catch (error) {
      console.error("Error rescheduling booking:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimes = (start:number, end:number) => {
    const times = [];
    let currentTime = new Date();
    currentTime.setHours(start, 0, 0, 0); // start time (Sydney timezone)
    const endTime = new Date();
    endTime.setHours(end, 0, 0, 0); // end time (Sydney timezone)

    while (currentTime <= endTime) {
      times.push(
        currentTime.toLocaleTimeString("en-AU", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          // timeZone: 'Australia/Sydney',
        })
      );
      currentTime.setMinutes(currentTime.getMinutes() + 15); // 30-minute interval
    }
    return times;
  };

  const startTimes = generateTimes(6, 21);

  // BookAppraisalList Component

  const handleStartTimeChange = (e:any) => {
    setNewStartTime(e.target.value);
    const selectedTime = e.target.value;

    // Split selected time into time and period (AM/PM)
    const [time, period] = selectedTime.split(" ");
    const [hours, minutes] = time.split(":").map(Number);

    // Convert to 24-hour format
    let adjustedHours = hours;
    if (period.toLowerCase() === "pm" && hours < 12) {
      adjustedHours = hours + 12;
    } else if (period.toLowerCase() === "am" && hours === 12) {
      adjustedHours = 0;
    }

    // Create a Date object for the selected time
    const startTimeDate = new Date();
    startTimeDate.setHours(adjustedHours, minutes, 0, 0);

    // Helper function to format time with AM/PM correctly
    const formatTime = (date:Date) => {
      return date
        .toLocaleTimeString("en-AU", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace("AM", "am")
        .replace("PM", "pm");
    };

    // Generate end time options: +15 mins, +30 mins, +45 mins, +60 mins
    const newEndTimes = [];

    // Calculate and format times: +15, +30, +45, +60 minutes
    const fifteenMinutes = new Date(startTimeDate);
    fifteenMinutes.setMinutes(fifteenMinutes.getMinutes() + 15);
    newEndTimes.push(formatTime(fifteenMinutes));

    const thirtyMinutes = new Date(startTimeDate);
    thirtyMinutes.setMinutes(thirtyMinutes.getMinutes() + 30);
    newEndTimes.push(formatTime(thirtyMinutes));

    const fortyFiveMinutes = new Date(startTimeDate);
    fortyFiveMinutes.setMinutes(fortyFiveMinutes.getMinutes() + 45);
    newEndTimes.push(formatTime(fortyFiveMinutes));

    const sixtyMinutes = new Date(startTimeDate);
    sixtyMinutes.setMinutes(sixtyMinutes.getMinutes() + 60);
    newEndTimes.push(formatTime(sixtyMinutes));

    // Set the end time options in state
    setEndTimes(newEndTimes);
  };

  const [isVendorDetails, setIsVendorDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{
    _id: string
    vendors: {
      firstName: string
      lastName: string
      email: string
      mobile: string
    }[] | null
  }>
    // @ts-ignore
  (null);

  const showVendorDetails = (booking:any
  ) => {
    setSelectedBooking(booking);
    setIsVendorDetails(true);
  };

  const handleSave = async (fieldPath:string, newValue:string, bookingId:string) => {
    try {
      // Dynamically create the request body with the correct fieldPath as the key
      const updateData = {
        [fieldPath]: newValue,
      };

      // Update the selectedBooking state locally to reflect the change instantly
      setSelectedBooking((prev) => {
        // Create a deep copy of the selectedBooking
        const updatedBooking = { ...prev };

        // Split the fieldPath into parts to handle nested updates
        const fields = fieldPath.split(".");

        // Traverse the object and update the correct field
        let current = updatedBooking;
        for (let i = 0; i < fields.length - 1; i++) {
    // @ts-ignore
          
          current = current[fields[i]];
        }

        // Update the field with the new value
    // @ts-ignore

        current[fields[fields.length - 1]] = newValue;

        return updatedBooking;
      });

      // Make the PUT request with the dynamic field update
      await axiosInstance.put(`/bookings/edit/${bookingId}`, updateData);

      console.log("Booking updated successfully");
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  return (
    <>
      <div className="container">
        {bookAppraisalData?.[0]?.userId?.name && (
          <p className="mb-4 text-darkgray text-center">
            Agent: {bookAppraisalData?.[0]?.userId?.name}
          </p>
        )}

        <div className="flex items-center justify-end mb-4">
          <Button className="black-button" onClick={handleChangeBookingView}>
            Create New
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {bookAppraisalData
            .filter((booking) => booking.status !== "Cancelled")
            .map((booking) => {
              const formattedDate = dayjs(booking.startTime).format(
                "DD/MM/YYYY"
              );
              const formattedStartTime = dayjs(booking.startTime).format(
                "h:mm a"
              );
              const formattedEndTime = dayjs(booking.endTime).format("h:mm a");

              return (
                <div
                  key={booking.googleEventId}
                  className="bg-white rounded-md border border-mediumgray p-4 flex flex-col gap-4 items-center"
                >
                  <h3 className="text-sm font-semibold text-center">
                    {booking.address}
                  </h3>
                  <p className="text-center m-0">
                    {formattedDate}
                    <br />
                    {`${formattedStartTime} - ${formattedEndTime}`}
                  </p>
                  <p
                    className="underline cursor-pointer"
                    onClick={() => showVendorDetails(booking)}
                  >
                    Vendor Details
                  </p>

                  <p className="m-0">
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        booking.status === "Completed"
                          ? "bg-black text-white"
                          : "bg-mediumgray text-black"
                      }`}
                      style={{ fontSize: "11px" }}
                    >
                      {booking.status}
                    </span>
                  </p>
                  <div className="flex justify-center gap-2 w-full">
                    {booking.status !== "Completed" && (
                      <>
                        <Button
                          className="gray-button"
                          onClick={() => {
                            setBookingToCancel(booking._id);
                            setIsCancelModalOpen(true);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="gray-button"
                          onClick={() => {
                            setBookingToReschedule(booking._id);
                            setDate(new Date(booking.startTime));
                            setNewStartTime(
                              dayjs(booking.startTime).format("h:mm a")
                            );
                            setNewEndTime(
                              dayjs(booking.endTime).format("h:mm a")
                            );
                            setIsRescheduleModalOpen(true);
                          }}
                        >
                          Reschedule
                        </Button>
                      </>
                    )}
                    <Button
                      className="black-button"
                      onClick={() =>
                        navigate.push(
                          `/chat/${encodeURIComponent(
                            booking.address
                          )}?tab=price-and-process`
                        )
                      }
                    >
                      View
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Booking"
      >
        <div className="flex flex-col items-center justify-center">
          <p>Are you sure you want to cancel this booking?</p>
          <div className="w-full flex gap-2 justify-end py-4">
            <Button
              onClick={() => setIsCancelModalOpen(false)}
              className="gray-button"
            >
              No
            </Button>
            <Button
    // @ts-ignore

              onClick={handleCancelModalSubmit}
              className="black-button"
              loading={loading}
            >
              Yes
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        title="Reschedule Booking"
      >
        <div className="flex flex-col items-center justify-center py-4">
          <Calendar
            tileDisabled={tileDisabled}
            prev2Label={null}
            next2Label={null}
    // @ts-ignore

            onChange={setDate}
            value={date}
          />

          <p className="py-4">
            {date.toLocaleDateString("en-AU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          {/* <Button onClick={confirmDate} className="black-button w-4/5 my-2">
            Select
          </Button> */}
        </div>

        <div className="flex flex-col items-center justify-center">
          <label className="form-label py-2">Start Time</label>
          <select
            className="form-select border"
            onChange={handleStartTimeChange}
          >
            <option value="">{newStartTime}</option>
            {startTimes.map((time, index) => (
              <option key={index} value={time}>
                {time}
              </option>
            ))}
          </select>
          <label className="form-label py-2">End Time</label>
          <select className="form-select border" onChange={handleEndTimeChange}>
            <option value="">{newEndTime}</option>
            {endTimes.map((time, index) => (
              <option key={index} value={time}>
                {time}
              </option>
            ))}
          </select>
          <div className="flex flex-row gap-2 justify-center items-center py-4">
            <Button
              onClick={() => setIsRescheduleModalOpen(false)}
              className="gray-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRescheduleModalSubmit}
              className="black-button"
              loading={loading}
            >
              Reschedule
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={limitBooking}
        onClose={() => setLimitBooking(false)}
        title=""
      >
        <div className="flex flex-col items-center justify-center">
          <p>You can only have one booking at a time</p>
        </div>
      </Modal>

      <Modal
        isOpen={isVendorDetails}
        onClose={() => setIsVendorDetails(false)}
        title="Vendor Details"
      >
        <div className="flex flex-col">
          {selectedBooking && selectedBooking.vendors && (
            <>
              {selectedBooking.vendors.map((vendor, index) => (
                <div key={index} className="mb-4">
                  <p className="flex items-center gap-1">
                    First Name:{" "}
                    <EditableField
                      value={vendor.firstName}
                      onSave={(newValue) => {
                        handleSave(
                          `vendors.${index}.firstName`,
                          newValue,
                          selectedBooking._id
                        );
                      }}
                    />
                  </p>

                  <p className="flex items-center gap-1">
                    Last Name:{" "}
                    <EditableField
                      value={vendor.lastName}
                      onSave={(newValue) => {
                        handleSave(
                          `vendors.${index}.lastName`,
                          newValue,
                          selectedBooking._id
                        );
                      }}
                    />
                  </p>
                 
                  <p className="flex items-center gap-1">
                    Email:{" "}
                    {/* <a href={`mailto:${vendor.email}`} className="underline"> */}
                      <EditableField
                        value={vendor.email}
                        onSave={(newValue) => {
                          handleSave(
                            `vendors.${index}.email`,
                            newValue,
                            selectedBooking._id
                          );
                        }}
                      />
                    {/* </a> */}
                  </p>
                  <p className="flex items-center gap-1">
                    Mobile:{" "}
                    {/* <a href={`tel:${vendor.mobile}`} className="underline"> */}
                      <EditableField
                        value={vendor.mobile}
                        onSave={(newValue) => {
                          handleSave(
                            `vendors.${index}.mobile`,
                            newValue,
                            selectedBooking._id
                          );
                        }}
                      />
                    {/* </a> */}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

const BookAppraisal = ({ property
  , setStep,step,onClose,
  agent,
  address:searchedAddress,
  availableAgents
 }:{
    property:{
        address: string
        propertyType: string
        waterViews: string
        developmentPotential: string
    }
    step: number
    , setStep: (arg0: number) => void,
    onClose: () => void
    agent: any,
    address?: string
    availableAgents: any[]
}) => {
  const [vendors, setVendors] = useState([{ id: 1 }]);
  const [bookings, setBookings] = useState(false);
  const [bookAppraisalData, setBookAppraisalData] = useState([]);
  const [bookingConfirmationScreen, setBookingConfirmationScreen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [selecteddate, setSelectedDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [endTimes, setEndTimes] = useState([]);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState(searchedAddress || '');
  const [timeSlots, setTimeSlots] = useState([]);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(agent || null);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
  const handleDateChange = async (date:Date) => {
    setSelectedDate(date);
    setTimeSlotsLoading(true);
 try {
            const response = await axiosInstance.post('/api/agent/calendar/availability', {
              agentId: agent._id, 
              date: date.toISOString()
            })
            if(response?.data?.success){
                setTimeSlots(response.data.data)
                setStep(2);
            }
        } catch (error:any) {
            console.error('Error fetching time slots:', error.message);
        }finally{
            setTimeSlotsLoading(false);
        }
};
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axiosInstance.get(
  //         `/bookings/address/${encodeURIComponent(property.address)}`
  //       );

  //       let bookingEntries = response.data.data;
  //       setBookAppraisalData(bookingEntries);
  //       if (bookingEntries.length > 0) {
  //         setBookings(true);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching area dynamics:", error);
  //     }
  //   };

  //   fetchData();
  // }, [property.address]);

  // useEffect(() => {
  //   const url = new URL(window.location.href);
  //   const searchParams = new URLSearchParams(url.search);

  //   // Check if the 'tab' parameter is set to 'book-appraisal'
  //   if (searchParams.get("tab") === "book-appraisal") {
  //     const styleSheets = document.styleSheets;
  //     for (let i = 0; i < styleSheets.length; i++) {
  //       try {
  //         const rules = styleSheets[i].cssRules;
  //         for (let j = 0; j < rules.length; j++) {
  //           // Find the rule that applies to .pac-container.pac-logo and remove it
  //           if (rules[j].selectorText === ".pac-container.pac-logo") {
  //             styleSheets[i].deleteRule(j);
  //             break;
  //           }
  //         }
  //       } catch (e) {
  //         // Ignore cross-origin or inaccessible stylesheets
  //         if (e.name !== "SecurityError") {
  //           console.error(e);
  //         }
  //       }
  //     }
  //   }
  // }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    unregister,
    setValue, // Used to set field value programmatically
    trigger,
  } = useForm<{
    propertyType: string
    waterViews: string
    developmentPotential: string
    followers: any[]
    meetingLocation: string
    otherLocation: string
    starttime: string
    endtime: string
    form_1: string
    form_2: string
    form_3: string
    form_4: string
    form_5: string
    form_6: string
    form_7: string
    form_8: string
    form_9: string
    form_10: string
    agent: string
  }>({
    defaultValues: {
      propertyType: property?.propertyType || "",
      waterViews: property?.waterViews || "",
      developmentPotential: property?.developmentPotential || "",
      followers: [], // Initialize followers
    },
  });

  const [isOtherLocation, setIsOtherLocation] = useState(false); // State to control the appearance of the input box
    // @ts-ignore

  const handleMeetingLocationChange = (e) => {
    const value = e.target.value;
    setValue("meetingLocation", value); // Update the meeting location field

    // Show input box if "Other" is selected
    if (value === "Other") {
      setIsOtherLocation(true);
    } else {
      setIsOtherLocation(false);
      setValue("otherLocation", ""); // Reset the 'other' input if not selected
    }
    trigger("meetingLocation"); // Manually trigger validation for meetingLocation
  };
    // @ts-ignore

  const handleBookingView = (newValue) => {
    setBookings(newValue);
  };
    // @ts-ignore

  const onSubmit = async (data) => {
    // setShowDiv(false);
    // setIsEmailModalOpen(true);
    setStep(3);
    if (data.meetingLocation === "Other") {
      data.meetingLocation = address;
    }
    setFormData(data);
  };

  const handleModalSubmit = async () => {
    if (!formData) return; // Ensure formData exists

    const dateFormatted = selecteddate.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    // @ts-ignore

    const starttimeString = formData.starttime;
    const starttime = dayjs(starttimeString, "hh:mm a");
    const startformattedTime = starttime.format("HH:mm");
    // @ts-ignore

    const endtimeString = formData.endtime;
    const endtime = dayjs(endtimeString, "hh:mm a");
    const endformattedTime = endtime.format("HH:mm");

    const startdateTime = dayjs(
      `${dateFormatted} ${startformattedTime}`,
      "D MMMM YYYY HH:mm"
    );
    const isostartTime = startdateTime.toISOString();

    const enddateTime = dayjs(
      `${dateFormatted} ${endformattedTime}`,
      "D MMMM YYYY HH:mm"
    );
    const isoendTime = enddateTime.toISOString();

    // Collect property data
    // const propertyData = {
    //   propertyType: formData.propertyType,
    //   developmentPotential: formData.developmentPotential,
    //   waterViews: formData.waterViews,
    // };

    // Collect vendors data
    const vendorData = vendors.map((vendor) => formData[`form_${vendor.id}`]);

    // const newBookingDetails = {
    //   vendorData,
    //   propertyData,
    //   showstarttime: formData.starttime,
    //   showendtime: formData.endtime,
    //   date: dateFormatted,
    //   propertyAddress: property.address,
    // };

    try {
      setLoading(true);
      // const response = await axios.post("/bookings", {
      //   followers: formData.followers,
      //   vendors: vendorData,
      //   startTime: isostartTime,
      //   endTime: isoendTime,
      //   address: property.address,
      //   property: propertyData,
      //   meetingLocation: formData.meetingLocation,
      // });

      // if (response.data.success) {
      //   try {
      //     await axios.put("/userProperty", {
      //       address: property.address,
      //       vendorDetails: vendorData,
      //       followers: formData.followers,
      //     });
      //   } catch (error) {
      //     console.log(error.message);
      //   }

      //   const newBooking = response.data.data;
      //   setBookAppraisalData((prevData) => [...prevData, newBooking]);
      //   setBookingDetails(newBookingDetails);
      //   setBookingConfirmationScreen(true);

      //   // Reset the form fields
      //   reset({
      //     propertyType: property?.propertyType || "",
      //     waterViews: property?.waterViews || "",
      //     developmentPotential: property?.developmentPotential || "",
      //     starttime: "", // Reset startTime
      //     endtime: "", // Reset endTime
      //   });

      //   // Alternatively, to reset all fields to default:
      //   // reset();
      // }

      // console.log("Booking response:", response.data);
    } catch (error) {
      console.error("Error booking:", error);
      // Handle error appropriately
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }

    // Reset additional state variables
    setDate(new Date());
    setSelectedStartTime(null); // Reset selectedStartTime state
    setEndTimes([]); // Reset endTimes state
  };

  // Add a new vendor
  const addVendor = () => {
    setVendors((prevVendors) => [
      ...prevVendors,
      { id: prevVendors.length + 1 },
    ]);
  };

  const  confirmDate = () => {
    handleDateChange(date);
    
    // setShowDiv(false);
  };
  useEffect(() => {
    console.log('Current Step:', step===1);
}, [step]);
  const backBookingHandle = () => {
    // setShowDiv(true);
    setStep(1);
  };
 



  const handleStartTimeChange = (e:any) => {
    const selectedTime = e.target.value;
    setSelectedStartTime(selectedTime);

    // Split selected time into time and period (AM/PM)
    const [time, period] = selectedTime.split(" ");
    const [hours, minutes] = time.split(":").map(Number);

    // Convert to 24-hour format
    let adjustedHours = hours;
    if (period.toLowerCase() === "pm" && hours < 12) {
      adjustedHours = hours + 12;
    } else if (period.toLowerCase() === "am" && hours === 12) {
      adjustedHours = 0;
    }

    // Create a Date object for the selected time
    const startTimeDate = new Date();
    startTimeDate.setHours(adjustedHours, minutes, 0, 0);

    // Helper function to format time with AM/PM correctly
    // @ts-ignore

    const formatTime = (date) => {
      return date
        .toLocaleTimeString("en-AU", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace("AM", "am")
        .replace("PM", "pm");
    };

    // Generate end time options: +15 mins, +30 mins, +45 mins, +60 mins
    // @ts-ignore

    const newEndTimes = [];

    // Calculate and format times: +15, +30, +45, +60 minutes
    const intervals = [15, 30, 45, 60];
    intervals.forEach((interval) => {
      const timeOption = new Date(startTimeDate);
      timeOption.setMinutes(timeOption.getMinutes() + interval);
      newEndTimes.push(formatTime(timeOption));
    });

    // Set the end time options in state
    // @ts-ignore
    setEndTimes(newEndTimes);
  };
  const handleAgentChange=(e:any)=>{
    const selectedAgentId = e.target.value;
    const selectedAgent = availableAgents.find(
      (agent) => agent._id === selectedAgentId
    );
    setSelectedAgent(selectedAgent);
  }
  const tileDisabled = ({ date, view }:{
    date: Date
    view: string
  }) => {
    if (view === "month") {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to midnight
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0); // Normalize to midnight
      return checkDate < today; // Disable dates before today
    }
    return false; // Do not disable other views
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center text-center space-y-2 px-4 booking-form">
      

      <div className="flex flex-col w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full  text-start">
          
        {step===0 && (
            <div className="flex flex-col w-full">
            <div className="text-start py-2">
              <label className="form-label">
                Available Agents
              </label>
              {availableAgents.length === 0 ? (
                <p>
                  No available agents. Please try again later or contact support.
                </p>
              ) : (
                <select
                  className={`form-select border ${
                    errors.agent
                      ? "border-red-500"
                      : "border-mediumgray"
                  }`}
                  {...register("agent")}
                  onChange={handleAgentChange}
                >
                  <option value="">
                    Select Agent
                  </option>
                  {availableAgents.map((agent, index) => (
                    <option key={index} value={agent._id}>
                      {agent.firstName} {agent.lastName}
                    </option>
                  ))}
                </select>
              )}
              {errors.agent && (
                <span className="form-error-message">
                  {errors.agent.message}
                </span>
              )}
            </div>

            {/* <div className="text-start py-2">
              <label className="form-label">End Time</label>
              <select
                className={`form-select border ${
                  errors.endtime ? "border-red-500" : "border-mediumgray"
                }`}
                {...register("endtime", {
                  required: "End time selection is required",
                })}
                disabled={!selectedStartTime}
              >
                <option value="">Select End Time</option>
                {endTimes.map((time, index) => (
                  <option key={index} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.endtime && (
                <span className="form-error-message">
                  {errors.endtime.message}
                </span>
              )}
            </div> */}
          </div>
          ) 
          }
          
          {step===1 && (
            <>
              <h5 className="text-center">DATE AND TIME</h5>
              <div className="flex flex-col items-center justify-center py-2">
                <Calendar
                  tileDisabled={tileDisabled}
                  prev2Label={null}
                  next2Label={null}
    // @ts-ignore

                  onChange={setDate}
                  value={date}
                />
                <div className="w-full flex items-center justify-between py-6">
                  <p className="text-sm">
                    {date.toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>

                  <Button
                    type="button"
                    onClick={confirmDate}
                    className="black-button"
                    loading={timeSlotsLoading}
                    disabled={timeSlotsLoading}
                  >
                    Select
                  </Button>
                </div>
              </div>
            </>
          ) 
          }
          {
            step===2 && ((
              <>
                <div className="flex flex-col items-center justify-center py-2 w-full">
                  <p className="py-4">
                    {selecteddate.toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
  
                  <div className="flex flex-col w-full">
                    <div className="text-start py-2">
                      <label className="form-label">Start Time</label>
                      {timeSlots.length === 0 ? (
                        <p>
                          No available times for the selected date. Please choose
                          another date.
                        </p>
                      ) : (
                        <select
                          className={`form-select border ${
                            errors.starttime
                              ? "border-red-500"
                              : "border-mediumgray"
                          }`}
                          {...register("starttime", {
                            required: "Start time selection is required",
                          })}
                          onChange={handleStartTimeChange}
                        >
                          <option value="">Select Start Time</option>
                          {timeSlots.map((time, index) => (
                            <option key={index} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      )}
                      {errors.starttime && (
                        <span className="form-error-message">
                          {errors.starttime.message}
                        </span>
                      )}
                    </div>
  
                    {/* <div className="text-start py-2">
                      <label className="form-label">End Time</label>
                      <select
                        className={`form-select border ${
                          errors.endtime ? "border-red-500" : "border-mediumgray"
                        }`}
                        {...register("endtime", {
                          required: "End time selection is required",
                        })}
                        disabled={!selectedStartTime}
                      >
                        <option value="">Select End Time</option>
                        {endTimes.map((time, index) => (
                          <option key={index} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      {errors.endtime && (
                        <span className="form-error-message">
                          {errors.endtime.message}
                        </span>
                      )}
                    </div> */}
                  </div>
                </div>
  
                <div className="flex flex-row justify-end gap-2">
                  <button
                    type="button"
                    onClick={backBookingHandle}
                    className="gray-button"
                  >
                    Back
                  </button>
                  <button type="submit" className="black-button">
                    Next
                  </button>
                </div>
              </>
            ))
          }
          {
            step===3 &&(<EmailComponent
              // onSubmit={() => {
              //   setStep(4)
              // }}
              setStep={setStep}
              
              email={email}
              setName={setName}
              name={name}
              setEmail={setEmail}
              setAddress={setAddress}
              address={address}
              onBack={() => setStep(2)}
              />)
          }
          
          {
            step===4 && (
              <ConfirmationComponent
              setStep={setStep}
              onBack={() => setStep(3)}
              onClose={onClose}
              details={{
                date: selecteddate,
                // @ts-ignore
                startTime: selectedStartTime || formData?.starttime,
                // @ts-ignore
                // endTime: formData?.endtime,
                email: email,
                name: name,
                agentEmail: selectedAgent.email,
                agentName: selectedAgent.name,
                agentId: selectedAgent._id,
                address: address,
                
              }}
              />
            )
          }
        </form>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Booking"
      >
        <div className="flex flex-col">
          <p>Are you sure you want to confirm this booking?</p>
          <div className="w-full flex gap-2 justify-end py-4">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="gray-button"
            >
              No
            </Button>
            <Button
              onClick={handleModalSubmit}
              className="black-button"
              loading={loading}
            >
              Yes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookAppraisal;
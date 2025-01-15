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

const Followers = ({ onTagsChange }:{
    onTagsChange: (tags: any[]) => void
}) => {
  const [tags, setTags] = useState<{
        _id: string
        name: string
        picture: string
  }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Fetch users from /user endpoint on component mount
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const response = await axiosInstance.get("/user"); // Adjust the endpoint as necessary
  //       setAllUsers(response.data.data); // Assuming response.data.data is the array of user objects
  //     } catch (error) {
  //       console.error("Error fetching users:", error);
  //     }
  //   };

  //   fetchUsers();
  // }, []);

  const handleInputChange = (e:any) => {
    const value = e.target.value;
    setInputValue(value);

    // Filter suggestions based on input value
    if (value) {
      const filteredSuggestions = allUsers.filter(
        (user:{
            _id: string
            name: string
        }) =>
          user.name && user.name.toLowerCase().includes(value.toLowerCase()) // Filter by name
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleTagAdd = (user:{
        _id: string
        name: string
  }) => {
    // Check if the user has already been added to tags
    if (!tags.some((tag:{
        _id: string
    }) => tag._id === user._id)) {
    // @ts-ignore

      const updatedTags = [...tags, { ...user, picture: user.picture || '' }]; // Add the full user object with picture
      setTags(updatedTags); // Update local state
      onTagsChange(updatedTags); // Notify parent component with full user details
      setInputValue(""); // Clear input
      setSuggestions([]); // Clear suggestions
    }
  };

  const removeTag = (indexToRemove:number) => {
    const updatedTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(updatedTags);
    onTagsChange(updatedTags); // Notify parent component
  };

  return (
    <div className="w-full max-w-lg mx-auto my-2">
      <label className="form-label">Add Co-Agent</label>
      <input
        className="form-input border border-mediumgray"
        type="text"
        placeholder="Type to search agents"
        value={inputValue}
        onChange={handleInputChange}
      />

      {/* Show suggestions dropdown */}
      {suggestions.length > 0 && (
        <ul className="form-input border border-mediumgray bg-white w-full p-0 py-1 m-0 mt-2 list-none max-h-[120px] overflow-y-auto">
          {suggestions.map((suggestion:{
            _id: string
            name: string
          }) => (
            <li
              key={suggestion._id}
              onClick={() => handleTagAdd(suggestion)} // Pass full user object
              className="px-2 py-1 cursor-pointer hover:bg-lightgray m-0"
            >
              {suggestion.name} {/* Display user name */}
            </li>
          ))}
        </ul>
      )}

      {/* Display tags (multiple selected users) underneath the input */}
      <div className="mt-2">
        {tags.length > 0 &&
          tags.map((tag, index) => (
            <div
              key={tag._id}
              className="flex items-center justify-between bg-lightgray text-darkergray p-2 mb-2"
            >
              <div className="flex items-center">
                <img
                  src={tag.picture}
                  alt={tag.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span>{tag.name}</span> {/* Show name */}
              </div>
              <button
                onClick={() => removeTag(index)} // Remove tag when clicking the button
                className="text-darkergray hover:lightgray px-2"
              >
                ×
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

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

const BookAppraisal = ({ property }:{
    property:{
        address: string
        propertyType: string
        waterViews: string
        developmentPotential: string
    }
}) => {
  const [vendors, setVendors] = useState([{ id: 1 }]);
  const [bookings, setBookings] = useState(false);
  const [bookAppraisalData, setBookAppraisalData] = useState([]);
  const [bookingConfirmationScreen, setBookingConfirmationScreen] =
    useState(false);
  const [date, setDate] = useState(new Date());
  const [selecteddate, setSelectedDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [endTimes, setEndTimes] = useState([]);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [showDiv, setShowDiv] = useState(true);
  const [loading, setLoading] = useState(false);

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
    setIsModalOpen(true);
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

  // Delete a vendor by id
  // const deleteVendor = (id) => {
  //   if (vendors.length > 1) {
  //     unregister(`form_${id}`);
  //     setVendors((prevVendors) =>
  //       prevVendors.filter((vendor) => vendor.id !== id)
  //     );
  //   }
  // };

  const confirmDate = () => {
    setSelectedDate(date);
    setShowDiv(false);
  };

  const backBookingHandle = () => {
    setShowDiv(true);
  };
    // @ts-ignore

  const generateTimes = (startHour, endHour, selectedDate) => {
    const times = [];
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    let currentTime = new Date(selectedDate);

    if (isToday) {
      // Round up to the next 15-minute interval
      currentTime.setHours(now.getHours());
      currentTime.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
      currentTime.setSeconds(0);
      currentTime.setMilliseconds(0);

      // If minutes roll over to 60, adjust the hour and reset minutes to 0
      if (currentTime.getMinutes() === 60) {
        currentTime.setHours(currentTime.getHours() + 1);
        currentTime.setMinutes(0);
      }

      // Ensure the current time is not before the startHour
      if (currentTime.getHours() < startHour) {
        currentTime.setHours(startHour);
        currentTime.setMinutes(0);
      }
    } else {
      // Set to the start of the available time
      currentTime.setHours(startHour, 0, 0, 0);
    }

    const endTime = new Date(selectedDate);
    endTime.setHours(endHour, 0, 0, 0);

    while (currentTime <= endTime) {
      times.push(
        currentTime.toLocaleTimeString("en-AU", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
      currentTime.setMinutes(currentTime.getMinutes() + 15);
    }

    return times;
  };

  const startTimes = generateTimes(6, 21, selecteddate);
    // @ts-ignore

  const handleStartTimeChange = (e) => {
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

  const [autocomplete, setAutocomplete] = useState(null);
  const [address, setAddress] = useState("");

  if (bookings && bookAppraisalData.length > 0) {
    return (
      <BookAppraisalList
        bookAppraisalData={bookAppraisalData}
        setBookAppraisalData={setBookAppraisalData}
        onUpdateBookingView={handleBookingView}
      />
    );
  }

  if (bookingConfirmationScreen && bookingDetails) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center">
        <div className="relative">
          <i
            className="fas fa-chevron-left absolute top-1 left-2 cursor-pointer"
            onClick={() => {
              setBookingConfirmationScreen(false);
              setBookings(true);
            }}
          ></i>

          <div className="max-w-md mx-auto space-y-16">
            <h4>BOOKING CONFIRMATION</h4>
{/* 
            {bookingDetails.vendorData.map((vendor, index) => (
              <div
                key={index}
                className="border p-4 rounded-lg space-y-2 text-sm"
              > */}
                {/* Client Name */}
                {/* <div className="flex items-center space-x-3">
                  <i className="fas fa-user text-darkgray"></i>
                  <span>
                    {vendor.firstName} {vendor.lastName}
                  </span>
                </div> */}

                {/* Booking Time */}
                {/* <div className="flex space-x-3">
                  <i className="fas fa-calendar-alt text-darkgray"></i>
                  <div className="flex flex-col items-start">
                    <span>
                      Time: {bookingDetails.showstarttime} -{" "}
                      {bookingDetails.showendtime}
                    </span>
                    <span>Date: {bookingDetails.date}</span>
                  </div>
                </div> */}

                {/* Property Address */}
                {/* <div className="flex items-center space-x-3">
                  <i className="fas fa-map-marker-alt text-darkgray"></i>
                  <span>{bookingDetails.propertyAddress}</span>
                </div> */}
              {/* </div>
            ))} */}
          </div>
        </div>
      </div>
    );
  }

  // const onTagsChange = (tags) => {
  //   setValue("followers", tags); // Update the followers field in the form
  // };

  // const handleLoad = (autocompleteInstance) => {
  //   setAutocomplete(autocompleteInstance);
  // };

  // const handlePlaceChanged = async () => {
  //   if (autocomplete) {
  //     const place = autocomplete.getPlace();

  //     if (place && place.address_components && place.geometry) {
  //       let fullAddress = place.formatted_address;

  //       // Check if the address contains 'NSW'
  //       if (!fullAddress.includes("NSW")) {
  //         showToast("error", "Only NSW properties are allowed.");
  //         return;
  //       }

  //       // Set the final formatted address
  //       setAddress(fullAddress);
  //     } else {
  //       // Logic when the input is cleared or invalid place selected
  //       showToast("error", "Invalid place selected.");
  //     }
  //   }
  // };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center text-center space-y-8 px-4 booking-form">
      {/* <div className="w-full">
        <label className="form-label text-start">Property Address</label>
        <input
          type="text"
          className="form-input"
          value={property?.address}
          disabled
          readOnly
        />
      </div>

      {property?.media && property?.media[0]?.url ? (
        <div className="p-3">
          <img
            className="w-full h-auto"
            style={{ borderRadius: "12px" }}
            src={property?.media[0]?.url}
            alt="property"
          />
        </div>
      ) : property?.latitude && property?.longitude ? (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <GoogleMaps lat={property.latitude} lon={property.longitude} />
        </div>
      ) : null} */}

      <div className="flex flex-col w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full  text-start">
          {/* Property Information */}
          <div className="mb-8">
            <div className="text-start grid gap-6">
              {/* Property Type */}
              {/* <div className="col-span-12 relative">
                <label className="form-label">Property Type</label>
                <select
                  className={`form-input border ${
                    errors?.propertyType
                      ? "border-red-500"
                      : "border-mediumgray"
                  }`}
                  {...register("propertyType", {
                    required: "Property type is required",
                  })}
                  value={formData?.propertyType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      propertyType: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Property Type</option>
                  {[
                    "ApartmentUnitFlat",
                    "Duplex",
                    "House",
                    "Terrace",
                    "Townhouse",
                    "VacantLand",
                    "Villa",
                  ].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors?.propertyType && (
                  <span className="form-error-message text-start pt-1">
                    {errors?.propertyType.message}
                  </span>
                )}
              </div> */}

              {/* Water Views */}
              {/* <div className="col-span-12 relative">
                <label className="form-label">Water Views</label>
                <select
                  className={`form-input border ${
                    errors?.waterViews ? "border-red-500" : "border-mediumgray"
                  }`}
                  {...register("waterViews", {
                    required: "Water views selection is required",
                  })}
                  value={formData?.waterViews}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      waterViews: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Water Views</option>
                  {[
                    "No",
                    "Water views",
                    "Deep waterfront with jetty",
                    "Tidal waterfront with jetty",
                    "Waterfront reserve",
                  ].map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors?.waterViews && (
                  <span className="form-error-message text-start pt-1">
                    {errors?.waterViews.message}
                  </span>
                )}
              </div> */}

              {/* Development Potential */}
              {/* <div className="col-span-12 relative">
                <label className="form-label">Development Potential</label>
                <select
                  className="form-input border border-mediumgray"
                  {...register("developmentPotential")}
                  value={formData?.developmentPotential}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      developmentPotential: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Development Potential</option>
                  {[
                    "Childcare",
                    "Duplex site",
                    "Townhouse site",
                    "Unit site",
                  ].map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div> */}

              {/* Meeting Location */}
              <div className="col-span-12 relative">
                {/* <label className="form-label">Meeting at</label>
                <select
                  className={`form-input border ${
                    errors?.meetingLocation
                      ? "border-red-500"
                      : "border-mediumgray"
                  }`}
                  {...register("meetingLocation", {
                    required: "Meeting Location is required",
                  })}
                  onChange={handleMeetingLocationChange} // Update state on change
                >
                  <option value="">Select</option>
                  {["Property", "Other"].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors?.meetingLocation && (
                  <span className="form-error-message text-start pt-1">
                    {errors?.meetingLocation.message}
                  </span>
                )} */}

                {/* Conditionally render input box when 'Other' is selected */}
                {isOtherLocation && (
                  <>
                    {/* <input
                      type="text"
                      className={`mt-2 form-input border ${
                        errors?.otherLocation
                          ? "border-red-500"
                          : "border-mediumgray"
                      }`}
                      {...register("otherLocation", {
                        required: "Please specify the meeting location",
                      })}
                      placeholder="Enter meeting location"
                    /> */}
                    {/* <Autocomplete
                      onLoad={handleLoad}
                      onPlaceChanged={handlePlaceChanged}
                      options={{
                        componentRestrictions: { country: ["au"] },
                        fields: [
                          "address_components",
                          "geometry",
                          "formatted_address",
                        ],
                        types: ["geocode"],
                      }}
                      className="w-full"
                    >
                      <div className="max-w-md mx-auto relative text-xs">
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value);
                          }}
                          placeholder="Enter address here"
                          className={`mt-2 form-input border ${
                            !address ? "border-red-500" : "border-mediumgray"
                          }`}
                        />
                      </div>
                    </Autocomplete>
                    {!address && (
                      <span className="form-error-message text-start pt-1">
                        Meeting location is required
                      </span>
                    )} */}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          {vendors.map((vendor, index) => (
            <div key={vendor.id} className="mb-4">
              <div
                id="vendor-info"
                className="col-span-12 relative flex flex-col gap-4"
              >
                {/* <label className="form-label">Add Vendor</label>
                <div className="col-span-12 relative">
                  <label className="form-label text-start">First Name</label>
                  <input
                    type="text"
                    className={`form-input border ${
                      errors?.[`form_${vendor.id}`]?.firstName
                        ? "border-red-500"
                        : "border-mediumgray"
                    }`}
                    {...register(`form_${vendor.id}.firstName`, {
                      required: "First Name is required",
                    })}
                    placeholder="FIRST NAME"
                  />
                  {errors?.[`form_${vendor.id}`]?.firstName && (
                    <span className="form-error-message text-start pt-1">
                      {errors?.[`form_${vendor.id}`]?.firstName.message}
                    </span>
                  )}
                </div>

                <div className="col-span-12 relative">
                  <label className="form-label text-start">Last Name</label>
                  <input
                    type="text"
                    className={`form-input border ${
                      errors?.[`form_${vendor.id}`]?.lastName
                        ? "border-red-500"
                        : "border-mediumgray"
                    }`}
                    {...register(`form_${vendor.id}.lastName`, {
                      required: "Last Name is required",
                    })}
                    placeholder="LAST NAME"
                  />
                  {errors?.[`form_${vendor.id}`]?.lastName && (
                    <span className="form-error-message text-start pt-1">
                      {errors?.[`form_${vendor.id}`]?.lastName.message}
                    </span>
                  )}
                </div>

                <div className="col-span-12 relative">
                  <label className="form-label text-start">Email</label>
                  <input
                    type="email"
                    className={`form-input border ${
                      errors?.[`form_${vendor.id}`]?.email
                        ? "border-red-500"
                        : "border-mediumgray"
                    }`}
                    {...register(`form_${vendor.id}.email`, {
                      // required: "Email is required",
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Email is not valid",
                      },
                    })}
                    placeholder="ENTER EMAIL ADDRESS"
                  />
                  {errors?.[`form_${vendor.id}`]?.email && (
                    <span className="form-error-message text-start pt-1">
                      {errors?.[`form_${vendor.id}`]?.email.message}
                    </span>
                  )}
                </div>

                <div className="col-span-12 relative">
                  <label className="form-label text-start">Mobile</label>
                  <input
                    type="text"
                    className={`form-input border ${
                      errors?.[`form_${vendor.id}`]?.mobile
                        ? "border-red-500"
                        : "border-mediumgray"
                    }`}
                    {...register(`form_${vendor.id}.mobile`, {
                      required: "Mobile is required",
                      pattern: {
                        value:
                          /^(?:\+?(61))? ?(?:\((?=.*\)))?(0?[2-57-8])\)? ?(\d\d(?:[- ](?=\d{3})|(?!\d\d[- ]?\d[- ]))\d\d[- ]?\d[- ]?\d{3})$/,
                        message: "Mobile number is not valid",
                      },
                    })}
                    placeholder="ENTER MOBILE"
                  />
                  {errors?.[`form_${vendor.id}`]?.mobile && (
                    <span className="form-error-message text-start pt-1">
                      {errors?.[`form_${vendor.id}`]?.mobile.message}
                    </span>
                  )}
                </div> */}

                {/* Delete Vendor Button */}
                {/* {vendors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteVendor(vendor.id)}
                    className="black-button mt-2 w-max"
                  >
                    <FiMinus />
                  </button>
                )} */}
              </div>
            </div>
          ))}

          {/* Add Vendor Button */}
          {/* <div>
            <button
              type="button"
              onClick={addVendor}
              className="gray-button my-2"
            >
              <FaPlus />
            </button>
          </div> */}

          {/* <Followers onTagsChange={onTagsChange} /> */}

          <br></br>
          {showDiv ? (
            <>
              <h5 className="text-center">DATE AND TIME</h5>
              <div className="flex flex-col items-center justify-center py-4">
                <Calendar
                  tileDisabled={tileDisabled}
                  prev2Label={null}
                  next2Label={null}
    // @ts-ignore

                  onChange={setDate}
                  value={date}
                />
                <div className="w-full flex items-center justify-between py-8">
                  <p className="text-sm">
                    {date.toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>

                  <button
                    type="button"
                    onClick={confirmDate}
                    className="black-button"
                  >
                    Select
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center py-4 w-full">
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
                    {startTimes.length === 0 ? (
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
                        {startTimes.map((time, index) => (
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

                  <div className="text-start py-2">
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
                  </div>
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
                  Book
                </button>
              </div>
            </>
          )}
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
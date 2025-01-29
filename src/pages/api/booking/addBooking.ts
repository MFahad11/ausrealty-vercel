import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/components/lib/db';
import { sendEmail } from '@/utils/email';
import dayjs from 'dayjs';
import Booking from '@/models/booking';
import { google } from 'googleapis';
import Agent from '@/models/agent';

async function createGoogleCalendarEvent({
    agentAccessToken,
    calendarId,
    startTime,
    endTime,
    summary,
    description,
}:{
    agentAccessToken: string;
    calendarId: string;
    startTime: string;
    endTime: string;
    summary: string;
    description: string;
}) {
    
    const event = {
        summary,
        description,
        start: {
            dateTime: startTime,
            timeZone: "Australia/Sydney",
        },
        end: {
            dateTime: endTime,
            timeZone: "Australia/Sydney",
        },
    };

    try {
        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${agentAccessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(event),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error creating Google Calendar event:", errorData);
            throw new Error(`Failed to create Google Calendar event: ${errorData.error.message}`);
        }

        const createdEvent = await response.json();
        return createdEvent;
    } catch (error) {
        console.error("Error creating Google Calendar event:", error);
        throw error;
    }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      // Connect to MongoDB
      dbConnect();
      // Create a new booking
      const bookingData = req.body;
      const agent=await Agent.findOne({email:bookingData.agentEmail});
      const booking = await Booking.create({
        agentId:Array.isArray(bookingData.agentId)?bookingData.agentId:[bookingData.agentId],
        userEmail: bookingData.email,
        date: bookingData.date,
        userName: bookingData.name,
        address: bookingData.address,
        startTime: bookingData.startTime,
      });
     if(!booking){
        return res.status(400).json({ success: false });
     }
    

const summary = `Appointment with ${bookingData.email}`;
const description = `Booking confirmed for ${bookingData.email} at ${bookingData.startTime}`;

// Extract the date part from bookingData.date
const datePart = new Date(bookingData.date).toISOString().split("T")[0]; // Extracts YYYY-MM-DD

// Parse the time part and combine it with the date
const [time, meridian] = bookingData.startTime.split(" ");
let [hours, minutes] = time.split(":").map(Number);
if (meridian.toLowerCase() === "pm" && hours !== 12) hours += 12;
if (meridian.toLowerCase() === "am" && hours === 12) hours = 0;

// Combine date and time
const startTime = new Date(`${datePart}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`).toISOString();

// Calculate the end time (30 minutes later)
const endTime = new Date(new Date(startTime).getTime() + 30 * 60 * 1000).toISOString();

await createGoogleCalendarEvent({
    agentAccessToken: agent.accessToken,
    calendarId: agent.email, // Use agent's Google ID as the calendarId
    startTime: startTime,
    endTime: endTime, // Include the calculated end time
    summary,
    description,
});
sendEmail({to:bookingData.email,subject:'Booking Confirmation',text:`<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <table style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="background-color: #f4f4f4; padding: 20px; text-align: center;">
                <h1 style="color: #2c3e50; margin: 0;">Listing Appointment Confirmation</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px;">
                <p style="margin-bottom: 20px;">Dear <span style="font-weight: bold;">${bookingData.name}</span>,</p>
                <p style="margin-bottom: 20px;">Your appointment has been confirmed with the following details:</p>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Date:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${dayjs(bookingData.date)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Property Address:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${bookingData.address}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Agent Name:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${agent?.firstName} ${agent?.lastName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Agent Email:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${agent?.email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Start Time:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${dayjs(startTime)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>End Time:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${dayjs(endTime)}</td>
                    </tr>
                </table>
                <p style="margin-bottom: 20px;">Our agent will contact you shortly to discuss the details of your appointment.</p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 14px;">
                <p style="margin: 0;">This is an automated email. Please do not reply directly to this message.</p>
            </td>
        </tr>
    </table>
</body>`});
sendEmail({to:bookingData.agentEmail,subject:'Booking Confirmation',text:`<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <table style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="background-color: #f4f4f4; padding: 20px; text-align: center;">
                <h1 style="color: #2c3e50; margin: 0;">Listing Appointment Confirmation</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px;">
                <p style="margin-bottom: 20px;">Dear <span style="font-weight: bold;">${agent?.firstName} ${agent?.lastName}</span>,</p>
                <p style="margin-bottom: 20px;">Your appointment has been confirmed with the following details:</p>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Date:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${dayjs(bookingData.date)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Property Address:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${bookingData.address}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>User Name:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${bookingData.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Start Time:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${dayjs(startTime)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>End Time:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${dayjs(endTime)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>User Email:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${bookingData.email}</td>
                    </tr>
    
                </table>
                <p style="margin-bottom: 20px;">This event has been automatically added to your calendar.</p>
                <p style="margin-bottom: 20px;">Thank you for using our service!</p>
                <p style="margin-bottom: 0;">Best regards,<br>Your Listing Appointment Team</p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 14px;">
                <p style="margin: 0;">This is an automated email. Please do not reply directly to this message.</p>
            </td>
        </tr>
    </table>
</body>`});
      res.status(201).json({
        success: true,
        data: booking,
      });
      
      
    } catch (error:any) {
        console.log(error)
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default handler;

import Agent from "@/models/agent";
import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from "next";
export const refreshAccessToken = async (refreshToken: string) => {
    // @ts-ignore
    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
  
    try {
        auth.setCredentials({ refresh_token: refreshToken });
        const { token } = await auth.getAccessToken();

        return token; // Return the new access token
    } catch (error:any) {
        console.error('Error refreshing access token:', error.message);
        throw error;
    }
  };
  
  
  export const fetchAgentAvailability = async (agentGoogleId: string, accessToken: string, date: string) => {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
        const response = await calendar.freebusy.query({
            requestBody: {
                timeMin: startOfDay.toISOString(),
                timeMax: endOfDay.toISOString(),
                timeZone: 'UTC', // Explicitly set timezone
                items: [{ id: agentGoogleId }]
            }
        });

        console.log('Full response:', JSON.stringify(response.data, null, 2));
        
        const busySlots = response.data.calendars?.[agentGoogleId]?.busy || [];
        return busySlots;
    } catch (error) {
        console.error('Detailed error:', error);
        throw error;
    }
};
const handler = async (req:NextApiRequest, res:NextApiResponse) => {
    const { agentId, date } = req.body;

    if (!agentId || !date) {
        return res.status(400).json({ error: 'Agent ID and date are required.' });
    }


    try {
        // Fetch agent's tokens from the external database
        const agent = await Agent.findOne({ _id: agentId });
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found.' });
        }

        let { accessToken, refreshToken, googleId } = agent;
        console.log(accessToken, refreshToken, agent);
        // Refresh the access token if needed
        try {
            accessToken = await refreshAccessToken(refreshToken);
            // Optionally update the refreshed token in the database
            await Agent.updateOne(
                { _id: agentId },
                { $set: { accessToken } }
            );
        } catch (refreshError:any) {
            console.error('Error refreshing token:', refreshError.message);
            return res.status(500).json({ error: 'Failed to refresh access token.' });
        }

        // Fetch available time slots for the selected date
        const busySlots = await fetchAgentAvailability(agent?.email, accessToken, date);

        // Generate 30-minute time slots for the day
        const timeSlots = generateTimeSlots(date, (busySlots as any[]));

        res.status(200).json({ 
            success: true,
            data: timeSlots,
         });
    } catch (error:any) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
const generateAvailableTimes = (
    startHour: number,
    endHour: number,
    selectedDate: string,
    busySlots: { start: string; end: string }[]
) => {
    const times: string[] = [];
    const now = new Date();
    const selectedDateObj = new Date(selectedDate);
    const isToday = selectedDateObj.toDateString() === now.toDateString();

    let currentTime = new Date(selectedDateObj);

    if (isToday) {
        // Start from the next 30-minute interval
        currentTime.setHours(now.getHours());
        currentTime.setMinutes(Math.ceil(now.getMinutes() / 30) * 30);
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
        // Start at the beginning of the selected day's available time
        currentTime.setHours(startHour, 0, 0, 0);
    }

    const endTime = new Date(selectedDateObj);
    endTime.setHours(endHour, 0, 0, 0);

    while (currentTime <= endTime) {
        const isBusy = busySlots.some((slot) => {
            const busyStart = new Date(slot.start).getTime();
            const busyEnd = new Date(slot.end).getTime();
            const slotStart = currentTime.getTime();
            const slotEnd = slotStart + 30 * 60 * 1000; // 30-minute interval

            return busyStart < slotEnd && busyEnd > slotStart;
        });

        if (!isBusy) {
            times.push(
                currentTime.toLocaleTimeString("en-AU", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                })
            );
        }

        currentTime.setMinutes(currentTime.getMinutes() + 30); // 30-minute interval
    }

    return times;
};

const generateTimeSlots = (date: string, busySlots: { start: string; end: string }[]) => {
    const startHour = 9; // Start at 9:00 AM
    const endHour = 18; // End at 6:00 PM
    return generateAvailableTimes(startHour, endHour, date, busySlots);
};


export default handler;

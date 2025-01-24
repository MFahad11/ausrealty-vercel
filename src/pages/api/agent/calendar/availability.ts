import dbConnect from '@/components/lib/db';
import Agent from '@/models/agent';
import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId, date } = req.query;

    if (!userId || !date) {
        return res.status(400).json({ message: 'User ID and date are required' });
    }

    try {
        await dbConnect();
        

        // Retrieve user tokens by userId
        const user = await Agent.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { accessToken, refreshToken } = user;

        // Set up Google OAuth2 client
        const oAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
        oAuth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

        // Refresh token if access token is expired
        oAuth2Client.on('tokens', async (tokens) => {
            if (tokens.access_token) {
                await Agent.updateOne(
                    { _id: userId },
                    { $set: { accessToken: tokens.access_token } }
                );
            }
            if (tokens.refresh_token) {
                await Agent.updateOne(
                    { _id: userId },
                    { $set: { refreshToken: tokens.refresh_token } }
                );
            }
        });

        // Fetch events for the selected date
        const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
        const startOfDay = new Date(date as string);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const events = await calendar.events.list({
            calendarId: 'primary',
            timeMin: startOfDay.toISOString(),
            timeMax: endOfDay.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        // Generate 30-minute slots and filter out occupied ones
        const slots: string[] = [];
        let currentTime = new Date(startOfDay);

        while (currentTime < endOfDay) {
            const nextTime = new Date(currentTime);
            nextTime.setMinutes(currentTime.getMinutes() + 30);

            // Check if the slot overlaps with any event
            const isOccupied = events.data.items?.some((event) => {
                const eventStart = new Date(event.start?.dateTime || event.start?.date!);
                const eventEnd = new Date(event.end?.dateTime || event.end?.date!);
                return currentTime < eventEnd && nextTime > eventStart;
            });

            if (!isOccupied) {
                slots.push(currentTime.toISOString());
            }

            currentTime = nextTime;
        }

        res.status(200).json({ slots });
    } catch (error) {
        console.error('Error fetching calendar availability:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

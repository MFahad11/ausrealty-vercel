import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/components/lib/db';
import { sendEmail } from '@/utils/email';
import dayjs from 'dayjs';
import Booking from '@/models/booking';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      // Connect to MongoDB
      dbConnect();
      // Create a new booking
      const bookingData = req.body;
      const booking = await Booking.create({
        agentIds:bookingData.agentIds,
        userEmail: bookingData.email,
        date: bookingData.date,
        startTime: bookingData.startTime,
        
      });
     if(!booking){
        return res.status(400).json({ success: false });
     }
sendEmail({to:bookingData.email,subject:'Booking Confirmation',text:`<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f4;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
            <td style="padding: 40px 30px; background-color: #f8f9fa; text-align: center;">
                <h1 style="margin: 0; color: #2c3e50; font-size: 24px; font-weight: bold;">Meeting Confirmation</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 30px;">
                <p style="margin: 0 0 20px 0;">Hello,</p>
                
                <p style="margin: 0 0 20px 0;">Your meeting has been confirmed with the following details:</p>
                
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px; border: 1px solid #e0e0e0; width: 30%; font-weight: bold;">Date:</td>
                        <td style="padding: 10px; border: 1px solid #e0e0e0;">${dayjs(bookingData.date).format('MMMM D, YYYY')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Start Time:</td>
                        <td style="padding: 10px; border: 1px solid #e0e0e0;">${bookingData.startTime}</td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Agent Name:</td>
                        <td style="padding: 10px; border: 1px solid #e0e0e0;">${bookingData.agentName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Agent Email:</td>
                        <td style="padding: 10px; border: 1px solid #e0e0e0;">${bookingData.agentEmail}</td>
                    </tr>
                </table>
                
                <p style="margin: 0 0 20px 0;">Please add this meeting to your calendar. If you need to make any changes or have questions, please contact us.</p>
                
            </td>
        </tr>
        <tr>
            <td style="padding: 20px 30px; background-color: #f8f9fa; text-align: center; font-size: 12px; color: #666666;">
                <p style="margin: 0;">This is an automated message, please do not reply directly to this email.</p>
            </td>
        </tr>
    </table>
</body>`});
sendEmail({to:bookingData.agentEmail,subject:'Booking Confirmation',text:`<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f4;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <tr>
          <td style="padding: 40px 30px; background-color: #f8f9fa; text-align: center;">
              <h1 style="margin: 0; color: #2c3e50; font-size: 24px; font-weight: bold;">Meeting Confirmation</h1>
          </td>
      </tr>
      <tr>
          <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0;">Hello,</p>
              
              <p style="margin: 0 0 20px 0;">Your meeting has been confirmed with the following details:</p>
              
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px; border-collapse: collapse;">
                  <tr>
                      <td style="padding: 10px; border: 1px solid #e0e0e0; width: 30%; font-weight: bold;">Date:</td>
                      <td style="padding: 10px; border: 1px solid #e0e0e0;">${dayjs(bookingData.date).format('MMMM D, YYYY')}</td>
                  </tr>
                  <tr>
                      <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Start Time:</td>
                      <td style="padding: 10px; border: 1px solid #e0e0e0;">${bookingData.startTime}</td>
                  </tr>
                  
                  <tr>
                      <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">User Name</td>
                      <td style="padding: 10px; border: 1px solid #e0e0e0;">${bookingData.email}</td>
                  </tr>
                  
              </table>
              
              <p style="margin: 0 0 20px 0;">Please add this meeting to your calendar. If you need to make any changes or have questions, please contact us.</p>
              
          </td>
      </tr>
      <tr>
          <td style="padding: 20px 30px; background-color: #f8f9fa; text-align: center; font-size: 12px; color: #666666;">
              <p style="margin: 0;">This is an automated message, please do not reply directly to this email.</p>
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

import { NextApiRequest, NextApiResponse } from "next";
import { sendEmail, EmailOptions } from "../../utils/email";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { to, subject, text } = req.body as EmailOptions;

    try {
      await sendEmail({ to, subject, text });
      res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error sending email", error: (error as Error).message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

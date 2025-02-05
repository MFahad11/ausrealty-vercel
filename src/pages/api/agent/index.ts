import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from "@/components/lib/db";
import Agent from "@/models/agent";



// API handler
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Connect to the database
    await dbConnect();

    // Fetch all agents
    const agents = await Agent.find({}).lean();

    // Respond with the agents
    res.status(200).json({
        success: true,
        data: agents
    });
  } catch (error) {
    
    console.error("Error fetching agents:", error);
    res.status(500).json({ error: "Failed to fetch agents" });
  }
};

export default handler;

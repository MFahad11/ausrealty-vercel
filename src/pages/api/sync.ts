// File: /pages/api/syncAgents.ts

import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import axios from "axios";
import Agent from "@/models/agent";
import dbConnect from "@/components/lib/db";
import { AGENTS } from "@/constants/beleef.users";




const mergeAgents = (agents: any[]) => {
  const uniqueAgents: Record<string, any> = {};

  agents.forEach((agent) => {
    const uniqueKey = agent.email.toLowerCase();
    if (!uniqueAgents[uniqueKey]) {
      uniqueAgents[uniqueKey] = {
        ...agent,
        domainId: agent.domainId ? (Array.isArray(agent.domainId) ? agent.domainId : [agent.domainId]) : [],
        agencies: [{ agencyId: agent.agencyId, agencyName: agent.agencyName }],
      };
    } else {
      const existingAgent = uniqueAgents[uniqueKey];
      uniqueAgents[uniqueKey] = {
        ...existingAgent,
        ...agent,
        domainId: [...new Set([...(existingAgent.domainId || []), ...(agent.domainId ? (Array.isArray(agent.domainId) ? agent.domainId : [agent.domainId]) : [])])],
        agencies: [
          ...existingAgent.agencies,
          { agencyId: agent.agencyId, agencyName: agent.agencyName },
        ].filter((agency, index, self) =>
          index === self.findIndex((a) => a.agencyId === agency.agencyId)
        ),
        suburbs: [
          ...(existingAgent.suburbs || []),
          ...(agent.suburbs || []),
        ].filter(
          (suburb, index, self) =>
            self.findIndex(
              (s) =>
                s.suburb === suburb.suburb &&
                s.state === suburb.state &&
                s.postcode === suburb.postcode
            ) === index
        ),
      };
    }
  });

  return Object.values(uniqueAgents);
};

// API handler
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const allAgents: any[] = AGENTS;

    // Merge agents to remove duplicates
    const uniqueAgents = mergeAgents(allAgents);

    // Prepare bulk operations
    const bulkOps = uniqueAgents.map((agent) => {
      const updateAgent = { ...agent, beleefId: agent._id };
      delete updateAgent._id;

      return {
        updateOne: {
          filter: { email: agent.email.toLowerCase() }, // Match only by email
          update: { $set: updateAgent },
          upsert: true,
        },
      };
    });

    // Perform bulk write
    const result = await Agent.bulkWrite(bulkOps);
    

    res.status(200).json({
      message: "Agents synchronized successfully",
      count: uniqueAgents.length,
    });
  } catch (error: any) {
    console.error("Error syncing agents:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default handler;

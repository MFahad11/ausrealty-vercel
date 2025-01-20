// File: /pages/api/syncAgents.ts

import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import axios from "axios";
import Agent from "@/models/agent";
import dbConnect from "@/components/lib/db";
import { AGENTS } from "@/constants/beleef.users";


// List of agency IDs for Domain API
const agencyIds = [26715,35860,38331,38511];

// Fetch agents from Domain API
const fetchAgentsFromDomain = async (agencyId: number) => {
  try {
    const response = await axios.get(`https://api.domain.com.au/v1/agencies/${agencyId}`, {
      headers: {
        accept: "application/json",
        "X-Api-Key": 'key_99fd92ae5d6379b862a0f5b0ff40884a',
        "X-Api-Call-Source": "live-api-browser",
    },
    });
    return response.data.agents.map((agent: any) => ({
      ...agent,
      domainId: [agent.id],
      agencyId,
      suburb:[{
        suburb:response.data.details.suburb,
        state:response.data.details.state,
        postcode:response.data.details.postcode,
      }],
    }));
  } catch (error:any) {
    console.error(`Error fetching agents for agencyId ${agencyId}:`, error.message);
    return [];
  }
};


// Merge agents to remove duplicates
const mergeAgents = (agents: any[]) => {
  const uniqueAgents: Record<string, any> = {};

  agents.forEach((agent) => {
    const uniqueKey = agent.email.toLowerCase();
    if (!uniqueAgents[uniqueKey]) {
      // Fix the initial assignment
      uniqueAgents[uniqueKey] = {
        ...agent,
        domainId: agent.domainId ? (Array.isArray(agent.domainId) ? agent.domainId : [agent.domainId]) : [], // Fixed this line
        agencies: [{ agencyId: agent.agencyId, agencyName: agent.agencyName }],
      };
    } else {
      const existingAgent = uniqueAgents[uniqueKey];
      const mergedSuburbs = [
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
      );

      // Fix the merging logic
      const existingDomainIds = existingAgent.domainId || [];
      const newDomainId = agent.domainId ? (Array.isArray(agent.domainId) ? agent.domainId : [agent.domainId]) : [];
      
      uniqueAgents[uniqueKey] = {
        ...existingAgent,
        ...agent,
        domainId: [...existingDomainIds, ...newDomainId],
        agencies: [
          ...existingAgent.agencies,
          { agencyId: agent.agencyId, agencyName: agent.agencyName },
        ],
        suburbs: mergedSuburbs,
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

    const allAgents: any[] = [];

    // Fetch agents from Domain API
    for (const agencyId of agencyIds) {
      const domainAgents = await fetchAgentsFromDomain(agencyId);
      allAgents.push(...domainAgents);
    }

    // Fetch agents from Beleef source
    const beleefAgents = AGENTS
    allAgents.push(...beleefAgents);

    // Merge agents to remove duplicates
    const uniqueAgents = mergeAgents(allAgents);

    // Save unique agents to MongoDB
    for (const agent of uniqueAgents) {
      const updateAgent = { ...agent,beleefId:agent._id };
    delete updateAgent._id;  // Remove _id from the update document
   
    const result=await Agent.findOneAndUpdate(
        {
          $or: [
            { email: agent.email },
            { beleefId: agent.beleefId },
            { domainId: agent.domainId },
          ],
        },
        { $set: updateAgent },
        { upsert: true }
      );
      console.log(result);
    }

    res.status(200).json({ message: "Agents synchronized successfully", count: uniqueAgents.length });
  } catch (error:any) {
    console.error("Error syncing agents:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default handler;

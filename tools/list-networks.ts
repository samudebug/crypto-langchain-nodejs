import { DynamicStructuredTool } from "@langchain/core/tools";
import axios from "axios";
import * as z from "zod";

/**
 * Retrieves the networks associated with an asset
 *  
 * @param asset The name of the asset
 * @returns Returns a string with the networks associated with the asset 
 */
async function listNetworks(asset: string): Promise<string> {
  try {
    const response = await axios.get(`/${asset}/networks`);
    return JSON.stringify(response.data);
  } catch (error) {
    console.log("Error", error);
    return `Error fetching data ${error}`;
  }
}

export const listNetworksTool = new DynamicStructuredTool({
    name: "list_networks",
    description: "Lists a network from an asset",
    schema: z.object({
        asset: z.string().describe("The name of the asset")
    }),
    func: async ({asset}) => {
        return await listNetworks(asset);
    }
})

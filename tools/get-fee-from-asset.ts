import { DynamicStructuredTool } from "@langchain/core/tools";
import * as z from "zod";
import { api } from "../services/api";
/**
 *
 * @param asset The name of the asset
 * @returns A string with the withdrawal fee from the asset
 */
async function getFeesFromAsset(asset: string): Promise<string> {
  try {
    const response = await api.get(`/${asset}/fees`);
    return `Withdrawal Fee: ${response.data.withdrawal_fee}\n Minimum Required: ${response.data.withdraw_minimum}`;
  } catch (error) {
    console.error("Error", error);
    return `Error fetching data: ${error}`;
  }
}

export const getFeesFromAssetTool = new DynamicStructuredTool({
  name: "get_fees_from_asset",
  description:
    "Given an asset name, returns the data about the fees to withdrawal the asset",
  schema: z.object({
    asset: z.string().describe("The name of the asset"),
  }),
  func: async ({ asset }) => {
    return getFeesFromAsset(asset);
  },
});

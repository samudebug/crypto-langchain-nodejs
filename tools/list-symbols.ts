import { DynamicStructuredTool } from "@langchain/core/tools";
import { api } from "../services/api";
import { string, z } from "zod";

async function getTradingSymbol({
  name,
  symbolName,
}: {
  name?: string;
  symbolName?: string;
}) {
  try {
    const response = await api.get("/symbols");
    const { data } = response;
    let foundIndex = -1;
    if (name) {
      foundIndex = data.description.findIndex(
        (el: string) => el.toLowerCase() === name.toLowerCase()
      );
    }

    if (symbolName) {
      foundIndex = data["base-currency"].findIndex(
        (el: string) => el.toLowerCase() === symbolName.toLowerCase()
      );
    }

    if (foundIndex == -1) {
      return "Not found";
    }

    return `Symbol name: ${data["base-currency"][foundIndex]}`;
  } catch (error) {
    console.error("Error", error);
    return `Error fetching data: ${error}`;
  }
}

export const getTradingSymbolTool = new DynamicStructuredTool({
  name: "get_trading_symbol",
  description:
    "Giver an asset name or an asset acronym, returns the asset acronym",
  schema: z.object({
    name: z.string().optional().describe("The name of the asset"),
    symbolName: z
      .string()
      .regex(new RegExp(/([A-Z]){3}/))
      .optional()
      .describe("The acronym of the asset"),
  }),
  func: async ({
    name,
    symbolName,
  }: {
    name?: string;
    symbolName?: string;
  }) => {
    return await getTradingSymbol({ name, symbolName });
  },
});

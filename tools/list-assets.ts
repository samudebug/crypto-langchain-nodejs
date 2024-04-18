import { DynamicStructuredTool } from "@langchain/core/tools";
import { api } from "../services/api";
import { parse } from "date-fns/parse";
import { endOfDay, startOfDay } from "date-fns";
import { symbol, z } from "zod";
export async function getLastValueOfTrade({
  symbol,
  date,
  type,
}: {
  symbol: string;
  date: string;
  type: "buy" | "sell";
}): Promise<string> {
  try {
    const convertedDate = parse(date, "dd/MM/yyyy", new Date());
    const start = startOfDay(convertedDate);
    const end = endOfDay(convertedDate);
    const response = await api.get(`/${symbol.toUpperCase()}-BRL/trades`, {
      params: {
        from: start.getUTCMilliseconds(),
        to: end.getUTCMilliseconds(),
      },
    });
    const { data } = response;
    const higherTimestamp = data
      .filter((el: any) => el.type === type)
      .reduce((prev: any, current: any) => {
        return prev.date > current.date ? prev : current;
      });
    return `Value: ${higherTimestamp.price} BRL`;
  } catch (error) {
    console.error("Error", error);
    return `Error fetching data: ${error}`;
  }
}

export const getLastValueOfTradeTool = new DynamicStructuredTool({
  name: "get_last_value_of_trade",
  description:
    "Given an asset name, a day to search and a type of trade, return the last value that was traded on that asset on that day",
  schema: z.object({
    symbol: z.string().describe("The name of the asset"),
    date: z
      .string()
      .describe(
        "The date to search. The date must be on the dd/MM/yyyy format."
      ),
    type: z
      .enum(["buy", "sell"])
      .describe("The type of trade. Must be 'buy' or 'sell'"),
  }),
  func: async ({
    symbol,
    date,
    type,
  }: {
    symbol: string;
    date: string;
    type: "buy" | "sell";
  }) => {
    return await getLastValueOfTrade({ symbol, date, type });
  },
});

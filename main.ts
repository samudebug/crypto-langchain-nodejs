import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { config } from "dotenv";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { BufferMemory } from "langchain/memory";
import { listNetworksTool } from "./tools/list-networks";
import axios from "axios";
import { getFeesFromAssetTool } from "./tools/get-fee-from-asset";
import {
  getLastValueOfTrade,
  getLastValueOfTradeTool,
} from "./tools/list-assets";
import { getTradingSymbolTool } from "./tools/list-symbols";
config();

axios.defaults.baseURL = "https://api.mercadobitcoin.net/api/v4";
(async () => {
  const chatModel = new ChatOpenAI();
  const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      "Olá! Eu sou um assistente virtual e posso te ajudar a encontrar informações sobre redes de ativos. Qual ativo você gostaria de saber a rede?"
    ),
    SystemMessagePromptTemplate.fromTemplate(
      "Sempre use a função LOWER para fazer comparações de texto."
    ),
    SystemMessagePromptTemplate.fromTemplate(
      "Sempre descreva as respostas de forma clara e objetiva."
    ),
    SystemMessagePromptTemplate.fromTemplate(
      "Quando houver mais de uma resposta, faça uma lista organizas de forma numerica. Todos as respostas devem ser terminadas em ';', exceto a última da lista que dev ser finalizada com ponto final."
    ),
    SystemMessagePromptTemplate.fromTemplate(
      "Caso precise saber a sigla de um asset, use a tool 'get_trading_symbol'"
    ),
    new MessagesPlaceholder("chat_history"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
    new MessagesPlaceholder({ variableName: "agent_scratchpad" }),
  ]);

  const memory = new BufferMemory({
    memoryKey: "chat_history",
    returnMessages: true,
    outputKey: "output",
  });

  const tools = [
    listNetworksTool,
    getFeesFromAssetTool,
    getLastValueOfTradeTool,
    getTradingSymbolTool
  ];
  const agent = await createOpenAIFunctionsAgent({
    llm: chatModel,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    memory,
    verbose: true
  });
  const result = await agentExecutor.invoke({
    // input: "what is the network from matic?",
    // input: "what is the network from shib, btc and xrp?",
    // input: "what is the network from sol?",
    // input: "what is the network from xlm?",
    // input: "what is the network from pepe?",
    // input: "liste todos os networks de btc",
    // input: "Qual a taxa para sacar BTC?",
    input: "Por quanto o Bitcoin foi vendido ontem?",
  });
  console.log("Output\n", result.output);
  // const result2 = await agentExecutor.invoke({
  //   input: "E para xlm?"
  // });
  // console.log("Output2\n", result2.output);
})();

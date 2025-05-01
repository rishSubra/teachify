/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_CHATMESSAGES_ARN
	STORAGE_CHATMESSAGES_NAME
	STORAGE_CHATMESSAGES_STREAMARN
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
// amplify/backend/function/chatFunction/src/index.js
const crypto = require("crypto");
const {
  DynamoDBClient,
  PutItemCommand
} = require("@aws-sdk/client-dynamodb");
const {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand
} = require("@aws-sdk/client-bedrock-agent-runtime");

const ddb   = new DynamoDBClient({});
const agent = new BedrockAgentRuntimeClient({});

const TABLE_NAME = process.env.STORAGE_CHATMESSAGES_NAME;
const KB_ID      = process.env.KNOWLEDGE_BASE_ID;   // set via env var
const MODEL_ARN  = process.env.BEDROCK_MODEL_ID;    // e.g. nova-lite
const TEMP       = parseFloat(process.env.TEMPERATURE) || 0.7;
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS)    || 512;

exports.handler = async (event) => {
  const { userId, sessionId, text } = JSON.parse(event.body);
  const now = new Date().toISOString();

  // ── 1) Save user message ───────────────────────────────────────
  await ddb.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: {
      sessionId:  { S: sessionId },
      createdAt:  { S: now },
      messageId:  { S: crypto.randomUUID() },
      userId:     { S: userId },
      sender:     { S: "USER" },
      content:    { S: text }
    }
  }));

  // ── 2) Query your knowledge base + generate a response ─────────
  const cmd = new RetrieveAndGenerateCommand({
    input: { text },
    retrieveAndGenerateConfiguration: {
      type: "KNOWLEDGE_BASE",
      knowledgeBaseConfiguration: {
        knowledgeBaseId: KB_ID,        // your KB’s ID
        modelArn:        MODEL_ARN,    // e.g. "us.amazon.nova-lite-v1:0"
      }
    }
  });

  const kbResp = await agent.send(cmd);
  // The generated answer lives in kbResp.output.text
  const reply = kbResp.output.text.trim();

  // ── 3) Save the bot response ────────────────────────────────────
  await ddb.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: {
      sessionId:  { S: sessionId },
      createdAt:  { S: new Date().toISOString() },
      messageId:  { S: crypto.randomUUID() },
      userId:     { S: userId },
      sender:     { S: "BOT" },
      content:    { S: reply }
    }
  }));

  // ── 4) Return to front-end ─────────────────────────────────────
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: reply })
  };
};


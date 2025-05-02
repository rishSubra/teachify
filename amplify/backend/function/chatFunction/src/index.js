/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_CHATMESSAGES_ARN
	STORAGE_CHATMESSAGES_NAME
	STORAGE_CHATMESSAGES_STREAMARN
Amplify Params - DO NOT EDIT */

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

// Table and model config from your env-vars
const TABLE_NAME = process.env.STORAGE_CHATMESSAGES_NAME;
const KB_ID      = process.env.KNOWLEDGE_BASE_ID;    // e.g. S5BBZ9NZSY
const MODEL_ID   = process.env.BEDROCK_MODEL_ID;     // e.g. amazon.nova-lite-v1:0
const TEMP       = parseFloat(process.env.TEMPERATURE) || 0.7;
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS)    || 512;

// CORS headers for local dev; change origin to '*' or your prod URL as needed
const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,POST"
};


/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  // 1) Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ""
    };
  }

  // 2) Parse inbound message
  let userId, sessionId, text;
  try {
    ({ userId, sessionId, text } = JSON.parse(event.body));
  } catch {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON body" })
    };
  }

  const now = new Date().toISOString();

  try {
    // 3) Save the user’s message
    await ddb.send(new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        sessionId: { S: sessionId },
        createdAt: { S: now },
        messageId: { S: crypto.randomUUID() },
        userId:    { S: userId },
        sender:    { S: "USER" },
        content:   { S: text }
      }
    }));

    // 4) Call Bedrock RAG
    const cmd = new RetrieveAndGenerateCommand({
      input: { text },
      retrieveAndGenerateConfiguration: {
        type: "KNOWLEDGE_BASE",
        knowledgeBaseConfiguration: {
          knowledgeBaseId: KB_ID,
          modelArn:        MODEL_ID
        }
      }
    });

    const kbResp = await agent.send(cmd);
    const reply  = kbResp.output.text.trim();

    // 5) Save the bot’s reply
    await ddb.send(new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        sessionId: { S: sessionId },
        createdAt: { S: new Date().toISOString() },
        messageId: { S: crypto.randomUUID() },
        userId:    { S: userId },
        sender:    { S: "BOT" },
        content:   { S: reply }
      }
    }));

    // 6) Return the reply
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS
      },
      body: JSON.stringify({ message: reply })
    };
  } catch (err) {
    console.error("ChatFunction error:", err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS
      },
      body: JSON.stringify({ error: "Internal server error" })
    };
  }
};

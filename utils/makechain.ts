import { OpenAIChat } from 'langchain/llms';
import { LLMChain, ChatVectorDBQAChain, loadQAChain, ConversationalRetrievalQAChain } from 'langchain/chains';
import { PineconeStore } from 'langchain/vectorstores';
import { PromptTemplate } from 'langchain/prompts';
import { CallbackManager } from 'langchain/callbacks';

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_PROMPT = `You are a helpful AI assistant. Use the following pieces of context to answer the question at the end.\nThe answer should be well-structured.\nIf the answer is a list provide well-ordered numeric list like 1\n 2\n 3\n \n
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.\n
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.\n
Donot copy paste the context. Just use the context for answer
{context}

Question: {question}
Helpful answer in well-structured markdown format:`;

export const makeChain = (vectorstore: PineconeStore ,
  onTokenStream?: (token: string) => void,) => {
  const model = new OpenAIChat({
    temperature: 0.7,
    modelName: 'gpt-3.5-turbo', //change this to older versions (e.g. gpt-3.5-turbo) if you don't have access to gpt-4
    maxTokens : 3096,
    streaming: Boolean(onTokenStream),
    callbackManager: onTokenStream
      ? CallbackManager.fromHandlers({
          async handleLLMNewToken(token) {
            onTokenStream(token);
            console.log(token);
          },
        })
      : undefined,
  })

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
    },
  );
  return chain;
};
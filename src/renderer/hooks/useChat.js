import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAIContext } from 'renderer/context/AIContext';
import { useIndexContext } from 'renderer/context/IndexContext';

const useChat = () => {
  const { ai, prompt, model } = useAIContext();
  const { vectorSearch, getThreadsAsText, latestThreads } = useIndexContext();
  const STARTER = useMemo(() => {
    return [
      {
        role: 'system',
        content:
          'You are a helpful assistant within a digital journaling app called Pile.',
      },
      {
        role: 'system',
        content:
          'The user has provided a description of your personality:' + prompt,
      },
      {
        role: 'system',
        content: `You are about to start a conversation with the user, usually involving reflection or discussion about their thoughts in this journal. For each of their messages, the system will provide a list of relevant journal entries as context to you, be aware of it when you answer and use whatever is relevant and appropriate. You are a wise librarian of my thoughts, providing advice and counsel. You try to keep responses consise and get to the point quickly. Plain-text responses only. You address the user as 'you', you don't need to know their name. You should engage with the user like you're a human. When you mention time, always do it relative to the current time– \nthe date and time at this moment is: ${new Date().toString()}.`,
      },
      {
        role: 'system',
        content: `Here are the 10 latest journal entries from the user: \n\n${latestThreads}`,
      },
      {
        role: 'system',
        content: `The user starts the conversation:`,
      },
    ];
  }, [prompt]);

  const [messages, setMessages] = useState(STARTER);
  const resetMessages = () => setMessages(STARTER);

  const addMessage = useCallback(
    async (messsage) => {
      const user = {
        role: 'user',
        content: messsage,
      };

      const lastSystemMessage = messages[messages.length - 1];
      const augmentedMessages = `${lastSystemMessage.content} \n\n${messsage}`;

      const relevantEntries = await vectorSearch(augmentedMessages, 50);
      const entryFilePaths = relevantEntries.map((entry) => entry.ref);
      const threadsAsText = await getThreadsAsText(entryFilePaths);
      const system = {
        role: 'system',
        content:
          "Here are some relevant entries from the user's journal related to the user's message:" +
          threadsAsText.join('\n'),
      };
      return [...messages, system, user];
    },
    [messages]
  );

  const getAIResponse = useCallback(async (messages, callback = () => {}) => {
    setMessages(messages);
    const stream = await ai.chat.completions.create({
      model: model,
      max_tokens: 400,
      messages: messages,
      stream: true,
    });

    for await (const part of stream) {
      const token = part.choices[0].delta.content;
      callback(token);
    }
  }, []);

  return { addMessage, getAIResponse, resetMessages };
};

export default useChat;

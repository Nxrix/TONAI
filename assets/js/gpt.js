  //----------------//
 //--Nxrix © 2024--//
//----------------//

const gpt = {};

gpt.messages = [];
gpt.config = "";
gpt.secret_key = "";
gpt.generating = false;

gpt.countTokens = (messages) => {
  let totalTokens = 0;
  for (const message of messages) {
    const contentTokens = message.content.split(" ").length;
    totalTokens += contentTokens;
  }
  return totalTokens;
};

gpt.limitTokens = (messages, maxTokens) => {
  let totalTokens = 0;
  let limitedMessages = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const contentTokens = message.content.split(" ").length;
    if (totalTokens + contentTokens <= maxTokens) {
      limitedMessages.unshift(message);
      totalTokens += contentTokens;
    } else {
      const remainingTokens = maxTokens - totalTokens;
      const limitedContent = message.content.split(" ").slice(-remainingTokens).join(" ");
      limitedMessages.unshift({ ...message, content: limitedContent });
      break;
    }
  }
  return limitedMessages;
}

gpt.generate = async (input) => {
  gpt.generating = true;
  gpt.messages[gpt.messages.length] = {role:"user", content:input};
  var messages = gpt.messages;
  messages = gpt.limitTokens(messages,2048-gpt.config.split(" ").length);
  messages.unshift({role:"system",content:gpt.config});
  try {
    response = await fetch("https://nxrix.vercel.app/api/tonai/gpt.php",{
      method: "POST",
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages,
        secret_key: gpt.secret_key
      }),
    });
    const data = await response.text();
    gpt.messages[gpt.messages.length] = {role:"assistant",content:data};
    gpt.generating = false;
    return data;
  } catch (error) {
    gpt.messages[gpt.messages.length] = {role:"assistant",content:error.toString()};
    return error.toString();
  }
}

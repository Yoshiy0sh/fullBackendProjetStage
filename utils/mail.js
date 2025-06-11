async function callWebhookWithEmail(email) {
  const webhookUrl = `https://n8n.srv733781.hstgr.cloud/webhook/c83614b4-cbc2-4d15-af77-ee3c373e663b?mail=${encodeURIComponent(email)}`;

  try {
    const response = await fetch(webhookUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // You can return the response in different formats.
    // For example, if you expect JSON:
    // return await response.json();
    // If you expect plain text:
    return await response.text();
  } catch (error) {
    console.error("Error calling the webhook:", error);
    // Return a value or propagate the error according to your needs
    return null;
  }
}

// // Example usage:
// async function exampleUsage() {
//   const testEmail = "test@example.com";
//   const webhookResponse = await callWebhookWithEmail(testEmail);

//   if (webhookResponse !== null) {
//     console.log("Webhook response:", webhookResponse);
//   }
// }

async function callWebhookWithEmailAndToken(email, token) {
  console.log('pass')
  const webhookUrl = `https://n8n.srv733781.hstgr.cloud/webhook/c83614b4-cbc2-4d15-af77-ee3c373e663b?mail=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

  try {
    const response = await fetch(webhookUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error calling the webhook:", error);
    // Return a value or propagate the error according to your needs
    return null;
  }
}

// // Example usage:
// async function exampleUsage() {
//   const testEmail = "yoshire032@gmail.com";
//   const testToken = "yourSecretToken123"; // Replace with an actual token for testing
//   const webhookResponse = await callWebhookWithEmailAndToken(testEmail, testToken);

//   if (webhookResponse !== null) {
//     console.log("Webhook response:", webhookResponse);
//   }
// }

module.exports = { callWebhookWithEmail, callWebhookWithEmailAndToken }
import "dotenv/config";
import { Langfuse } from "langfuse";

// Initialize Singleton Langfuse Client with fallback environment checks
export const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASE_URL || process.env.LANGFUSE_HOST || "https://cloud.langfuse.com",
});

/**
 * Utility to log voice/AI execution traces to Langfuse
 */
export function traceVoiceCall(sessionId: string, promptText: string, completionText: string) {
  const trace = langfuse.trace({
    id: sessionId,
    name: "QuickVoice_Agent_Execution",
    metadata: {
      platform: "QuickVoice",
      environment: process.env.NODE_ENV || "development",
    },
  });

  const generation = trace.generation({
    name: "voice-llm-response",
    model: "gpt-4o",
    input: promptText,
    output: completionText,
  });

  generation.end();

  // Flush buffer to Langfuse cloud
  void langfuse.flushAsync();
}

// Immediate Test Trace Execution
async function runTestTrace() {
  try {
    const testTrace = langfuse.trace({
      name: "QuickVoice Langfuse Verification",
      userId: "mansi-dev",
    });

    testTrace.update({
      output: "Integration Successful!",
    });

    await langfuse.flushAsync();
    console.log("🚀 [Langfuse] Test trace sent successfully!");
  } catch (error) {
    console.error("❌ [Langfuse] Failed to send trace:", error);
  }
}

void runTestTrace();
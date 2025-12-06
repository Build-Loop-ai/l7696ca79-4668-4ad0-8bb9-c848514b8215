import Vapi from "@vapi-ai/web";

let vapiInstance: Vapi | null = null;

export function getVapiClient(publicKey: string): Vapi {
  if (!vapiInstance) {
    vapiInstance = new Vapi(publicKey);
  }
  return vapiInstance;
}

export function resetVapiClient(): void {
  vapiInstance = null;
}

export interface VapiCallEvents {
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onError?: (error: any) => void;
  onMessage?: (message: any) => void;
}

export async function startVapiCall(
  publicKey: string,
  assistantId: string,
  events: VapiCallEvents
): Promise<void> {
  const vapi = getVapiClient(publicKey);

  if (events.onCallStart) {
    vapi.on("call-start", events.onCallStart);
  }

  if (events.onCallEnd) {
    vapi.on("call-end", events.onCallEnd);
  }

  if (events.onSpeechStart) {
    vapi.on("speech-start", events.onSpeechStart);
  }

  if (events.onSpeechEnd) {
    vapi.on("speech-end", events.onSpeechEnd);
  }

  if (events.onError) {
    vapi.on("error", events.onError);
  }

  if (events.onMessage) {
    vapi.on("message", events.onMessage);
  }

  await vapi.start(assistantId);
}

export function stopVapiCall(publicKey: string): void {
  const vapi = getVapiClient(publicKey);
  vapi.stop();
}

export type Value = string | number | boolean | null | Value[] | { [key: string]: Value };
export type Facts = { [key: string]: Value };
export type ScreenContext = { route: string; source: 'demo'; scope: string; facts: Facts };
export type Message = { role: 'user' | 'assistant'; content: string };
export type Reply = { answer: string; evidenceKeys: string[]; handoff?: 'leader' | 'noi-support' };
export type AssistantTransport = { send: (request: { context: ScreenContext; messages: Message[] }, signal: AbortSignal) => Promise<Reply> };
// No endpoint or canned AI response. Inject a real authenticated adapter after backend integration.
export const assistantTransport: AssistantTransport | null = null;
export function validateReply(reply: Reply, context: ScreenContext) {
  if (!reply || typeof reply.answer !== 'string' || !reply.answer.trim() || reply.answer.length > 12000 || !Array.isArray(reply.evidenceKeys)) throw Error('Phản hồi không hợp lệ.');
  if (reply.handoff && !['leader', 'noi-support'].includes(reply.handoff)) throw Error('Đích hỗ trợ không hợp lệ.');
  if (!reply.handoff && !reply.evidenceKeys.length) throw Error('Phản hồi chưa có căn cứ từ dữ liệu NOI.');
  if (reply.evidenceKeys.some(key => typeof key !== 'string' || !Object.hasOwn(context.facts, key))) throw Error('Phản hồi tham chiếu dữ liệu không có trong màn hình.');
  return reply;
}

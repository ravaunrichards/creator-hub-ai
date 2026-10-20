const result = (success, data, issues = []) => ({ success, data, error: issues.length ? { issues } : undefined });
function schema(parseValue) {
  return {
    parse(value) { const r = parseValue(value); if (!r.success) { const e = new Error(r.error.issues[0]?.message || 'Invalid input.'); e.issues = r.error.issues; throw e; } return r.data; },
    safeParse(value) { try { return parseValue(value); } catch (e) { return result(false, undefined, [{ message: e.message }]); } }
  };
}
const issue = (message) => result(false, undefined, [{ message }]);
const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const noUnknown = (v, allowed) => Object.keys(v).every(k => allowed.includes(k));
export const emailSchema = schema(v => {
  if (typeof v !== 'string') return issue('Expected email address.');
  const value = v.trim().toLowerCase();
  if (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return issue('Enter a valid email address.');
  return result(true, value);
});
export const passwordSchema = schema(v => typeof v === 'string' && v.length >= 10 && v.length <= 128 ? result(true, v) : issue('Password must be between 10 and 128 characters.'));
export const registerSchema = schema(v => {
  if (!isObject(v) || !noUnknown(v, ['email','password','displayName'])) return issue('Unexpected registration fields.');
  const email = emailSchema.safeParse(v.email), password = passwordSchema.safeParse(v.password);
  if (!email.success) return email; if (!password.success) return password;
  if (typeof v.displayName !== 'string' || !v.displayName.trim() || v.displayName.trim().length > 60) return issue('Display name must be between 1 and 60 characters.');
  return result(true, { email: email.data, password: password.data, displayName: v.displayName.trim() });
});
export const loginSchema = schema(v => {
  if (!isObject(v) || !noUnknown(v, ['email','password'])) return issue('Unexpected login fields.');
  const email=emailSchema.safeParse(v.email); if(!email.success)return email;
  if(typeof v.password!=='string'||!v.password.length||v.password.length>128)return issue('Password is required.');
  return result(true,{email:email.data,password:v.password});
});
export const messageSchema = schema(v => {
  if (!isObject(v) || !noUnknown(v, ['content','conversationId'])) return issue('Unexpected chat fields.');
  if (typeof v.content !== 'string' || !v.content.trim() || v.content.trim().length > 12000) return issue('Message must be between 1 and 12000 characters.');
  if (v.conversationId !== undefined && (typeof v.conversationId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v.conversationId))) return issue('Conversation ID must be a UUID.');
  return result(true, { content: v.content.trim(), ...(v.conversationId ? { conversationId: v.conversationId } : {}) });
});
export const titleSchema = schema(v => {
  if (!isObject(v) || !noUnknown(v, ['title']) || typeof v.title !== 'string' || !v.title.trim() || v.title.trim().length > 100) return issue('Title must be between 1 and 100 characters.');
  return result(true, { title: v.title.trim() });
});
export function safeDisplayName(name) { return String(name ?? '').replace(/[<>]/g, '').trim().slice(0, 60); }

const $ = (id) => document.getElementById(id);
const state = { user: null, conversations: [], activeId: null, busy: false, authMode: 'login', toastTimer: null };
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(path, options = {}) {
  const response = await fetch(path, { credentials: 'same-origin', ...options, headers: { ...(options.body ? {'Content-Type':'application/json'} : {}), ...(options.headers || {}) } });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}
function toast(message) { const el=$('toast'); el.textContent=message; el.classList.add('show'); clearTimeout(state.toastTimer); state.toastTimer=setTimeout(()=>el.classList.remove('show'),2800); }
function setBusy(value) { state.busy=value; $('sendButton').disabled=value; $('messageInput').disabled=value; $('sendButton').innerHTML=value?'<span class="spinner">…</span>':'<span>↑</span>'; }
function setWelcome(show) { $('welcome').hidden=!show; $('messages').hidden=show; }
function updateAccount() {
  $('accountName').textContent=state.user?.displayName || 'Creator Hub guest';
  $('accountEmail').textContent=state.user?.email || 'Sign in to save chats';
  $('avatarInitial').textContent=(state.user?.displayName || 'C').slice(0,1).toUpperCase();
  $('signinTop').textContent=state.user?'Sign out':'Sign in';
}
function renderConversations() {
  const list=$('conversationList');
  if (!state.conversations.length) { list.innerHTML='<div class="empty-side">Your conversations will appear here.</div>'; return; }
  list.innerHTML=state.conversations.map(c=>`<div class="conversation-item ${c.id===state.activeId?'active':''}"><button class="conversation-pick" data-open="${escapeHtml(c.id)}" title="${escapeHtml(c.title)}">${escapeHtml(c.title || 'New chat')}</button><button class="conversation-menu" data-menu="${escapeHtml(c.id)}" aria-label="Conversation options">···</button></div>`).join('');
}
function appendMessage(role, content, model='') {
  setWelcome(false);
  const article=document.createElement('article'); article.className=`message ${role}`;
  const avatar=role==='assistant'?'✳':escapeHtml((state.user?.displayName||'Y').slice(0,1).toUpperCase());
  const label=role==='assistant'?'Creator Hub AI':(state.user?.displayName||'You');
  article.innerHTML=`<div class="message-avatar">${avatar}</div><div class="message-body"><div class="message-label">${escapeHtml(label)}${model?` · ${escapeHtml(model)}`:''}</div><div>${escapeHtml(content)}</div></div>`;
  $('messages').appendChild(article); $('messages').scrollTop=$('messages').scrollHeight;
}
function renderMessages(messages) {
  $('messages').innerHTML='';
  if (!messages.length) { setWelcome(true); return; }
  setWelcome(false); messages.forEach(m=>appendMessage(m.role,m.content,m.model||''));
}
async function loadConversations() {
  if (!state.user) { state.conversations=[];state.activeId=null;renderConversations();return; }
  const data=await api('/api/conversations');state.conversations=data.conversations;renderConversations();
}
async function openConversation(id) {
  if (!state.user) return openAuth('login');
  try { const data=await api(`/api/conversations/${encodeURIComponent(id)}/messages`);state.activeId=id;renderConversations();renderMessages(data.messages); } catch(e) { toast(e.message); }
}
async function newChat() {
  if (!state.user) { state.activeId=null;state.conversations=[];renderConversations();renderMessages([]);openAuth('register');return; }
  try { const {conversation}=await api('/api/conversations',{method:'POST',body:JSON.stringify({title:'New chat'})});state.conversations.unshift(conversation);state.activeId=conversation.id;renderConversations();renderMessages([]);$('messageInput').focus();closeSidebar(); } catch(e) { toast(e.message); }
}
async function sendMessage(text) {
  const content=text.trim(); if (!content || state.busy) return;
  if (!state.user) { openAuth('login');toast('Sign in to start a saved conversation.');return; }
  $('messageInput').value='';resizeInput();appendMessage('user',content);setBusy(true);
  try {
    const data=await api('/api/chat',{method:'POST',body:JSON.stringify({content,conversationId:state.activeId||undefined})});
    state.activeId=data.conversationId;appendMessage('assistant',data.assistantMessage.content,data.assistantMessage.model||'');
    await loadConversations();renderConversations();
    if (state.conversations[0]?.id!==state.activeId) state.conversations.sort((a,b)=>new Date(b.updated_at)-new Date(a.updated_at));
  } catch(e) {
    appendMessage('assistant',e.message,'Connection notice');
    const last=$('messages').lastElementChild;last?.querySelector('.message-body')?.classList.add('message-error');
  } finally { setBusy(false);$('messageInput').focus(); }
}
function openAuth(mode='login') { state.authMode=mode;updateAuthMode();$('authError').textContent='';$('authModal').hidden=false;document.body.style.overflow='hidden';setTimeout(()=>$('authEmail').focus(),50); }
function closeAuth() { $('authModal').hidden=true;document.body.style.overflow=''; }
function updateAuthMode() { const register=state.authMode==='register';document.querySelectorAll('.auth-tab').forEach(t=>t.classList.toggle('active',t.dataset.mode===state.authMode));$('authTitle').textContent=register?'Create your Creator Hub account.':'Make room for big ideas.';$('displayNameLabel').hidden=!register;$('displayName').required=register;$('authPassword').autocomplete=register?'new-password':'current-password';$('authSubmit').textContent=register?'Create account':'Sign in'; }
function closeSidebar() { $('sidebar').classList.remove('open');$('sidebarScrim').classList.remove('show'); }
function resizeInput() { const el=$('messageInput');el.style.height='auto';el.style.height=Math.min(el.scrollHeight,180)+'px'; }
async function boot() {
  try { const data=await api('/api/health');$('providerStatus').textContent=data.aiConfigured?'AI connection configured.':'AI connection requires setup.'; } catch { $('providerStatus').textContent='Server is not connected.'; }
  try { const data=await api('/api/auth/me');state.user=data.user;updateAccount();await loadConversations();if(state.conversations[0])await openConversation(state.conversations[0].id); } catch { updateAccount(); }
}
$('newChat').addEventListener('click',newChat);
$('refreshChats').addEventListener('click',()=>loadConversations().catch(e=>toast(e.message)));
$('openSidebar').addEventListener('click',()=>{$('sidebar').classList.add('open');$('sidebarScrim').classList.add('show')});
$('closeSidebar').addEventListener('click',closeSidebar);$('sidebarScrim').addEventListener('click',closeSidebar);
$('conversationList').addEventListener('click',async e=>{const open=e.target.closest('[data-open]');if(open)return openConversation(open.dataset.open);const menu=e.target.closest('[data-menu]');if(menu){const id=menu.dataset.menu;const action=prompt('Type rename or delete for this conversation:','rename');if(!action)return;if(action.toLowerCase()==='delete'){if(!confirm('Delete this conversation and its messages?'))return;try{await api(`/api/conversations/${id}`,{method:'DELETE'});state.conversations=state.conversations.filter(c=>c.id!==id);if(state.activeId===id){state.activeId=null;renderMessages([])}renderConversations();toast('Conversation deleted.')}catch(err){toast(err.message)}}else if(action.toLowerCase()==='rename'){const current=state.conversations.find(c=>c.id===id);const title=prompt('New conversation title:',current?.title||'New chat');if(!title?.trim())return;try{const data=await api(`/api/conversations/${id}`,{method:'PATCH',body:JSON.stringify({title:title.trim()})});state.conversations=state.conversations.map(c=>c.id===id?{...c,...data.conversation}:c);renderConversations()}catch(err){toast(err.message)}}}});
$('chatForm').addEventListener('submit',e=>{e.preventDefault();sendMessage($('messageInput').value)});
$('messageInput').addEventListener('input',resizeInput);
$('messageInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('chatForm').requestSubmit()}});
document.querySelectorAll('[data-prompt]').forEach(btn=>btn.addEventListener('click',()=>{ $('messageInput').value=btn.dataset.prompt;resizeInput();$('messageInput').focus(); }));
$('signinTop').addEventListener('click',async()=>{if(!state.user)return openAuth('login');try{await api('/api/auth/logout',{method:'POST'});state.user=null;state.conversations=[];state.activeId=null;updateAccount();renderConversations();renderMessages([]);toast('You have signed out.')}catch(e){toast(e.message)}});
$('accountButton').addEventListener('click',()=>state.user?toast('Account settings are planned for a later release.'):openAuth('login'));
$('closeAuth').addEventListener('click',closeAuth);$('authModal').addEventListener('click',e=>{if(e.target===$('authModal'))closeAuth()});
document.querySelectorAll('.auth-tab').forEach(tab=>tab.addEventListener('click',()=>{state.authMode=tab.dataset.mode;updateAuthMode();$('authError').textContent=''}));
$('authForm').addEventListener('submit',async e=>{e.preventDefault();$('authError').textContent='';$('authSubmit').disabled=true;try{const register=state.authMode==='register';const payload={email:$('authEmail').value,password:$('authPassword').value};if(register)payload.displayName=$('displayName').value;const data=await api(`/api/auth/${register?'register':'login'}`,{method:'POST',body:JSON.stringify(payload)});state.user=data.user;updateAccount();closeAuth();await loadConversations();toast(register?'Account created.':'Welcome back.');}catch(err){$('authError').textContent=err.message}finally{$('authSubmit').disabled=false}});
$('themeToggle').addEventListener('click',()=>{document.body.classList.toggle('light');try{localStorage.setItem('creatorhub-theme',document.body.classList.contains('light')?'light':'dark')}catch{}});
try{if(localStorage.getItem('creatorhub-theme')==='light')document.body.classList.add('light')}catch{}
$('exploreNav').addEventListener('click',()=>toast('Explore AI tools are planned for a later release.'));
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();newChat()}if(e.key==='Escape'){closeAuth();closeSidebar()}});
boot();

/* SHONnetwork shared notifications. No secret keys are stored in this file. */
(()=>{
"use strict";
const PROJECT="https://wqcninwqeyfoyxlllwdy.supabase.co";
const PUBLISHABLE="sb_publishable_YTHhpIPiKKHGBLMdkj_4og_Uyq_t_SX";
const AUTH_KEY="sb-wqcninwqeyfoyxlllwdy-auth-token";
const $=id=>document.getElementById(id);
let client=null,memberId=null,active=false,previousSupport=null,previousMember=null,previousFriends=null;
function displayCount(id,count){const e=$(id);if(!e)return;e.hidden=!count;e.textContent=count>99?"99+":String(count);}
function markers(){try{const data=JSON.parse(localStorage.getItem("shon-message-read-v1-"+memberId)||"{}");return data&&typeof data==="object"?data:{};}catch{return {};}}
async function rows(request){const {data,error}=await request;if(error)throw error;return data||[];}
async function memberUnread(){
 const conversations=await rows(client.from("shon_conversations").select("id,member_a,member_b"));
 const blocked=await rows(client.from("shon_blocks").select("blocked").eq("blocker",memberId));
 const blockedIds=new Set(blocked.map(b=>b.blocked));
 const visible=conversations.filter(c=>!blockedIds.has(c.member_a===memberId?c.member_b:c.member_a));
 const read=markers();let count=0;
 for(let i=0;i<visible.length;i+=30){
  const ids=visible.slice(i,i+30).map(c=>c.id);
  const messages=await rows(client.from("shon_messages").select("conversation_id,sender,created_at").in("conversation_id",ids).order("created_at",{ascending:false}).limit(1000));
  for(const m of messages){if(m.sender!==memberId&&new Date(m.created_at).getTime()>(Number(read[String(m.conversation_id)])||0))count++;}
 }
 return count;
}
async function pendingFriends(){
 const requests=await rows(client.from("shon_friend_requests").select("id").eq("recipient",memberId).eq("status","pending"));
 return requests.length;
}
function showFriendRequests(count){
 // One alert only. Remove any badge left by an earlier version.
 const nav=document.querySelector('.shon-global-header .shon-global-nav');
 if(nav){
  const link=nav.querySelector('a[href="connections.html"]');
  if(link){
   link.querySelectorAll('.shon-friend-request-badge').forEach(b=>b.remove());
   link.setAttribute('aria-label','Connections');
  }
 }
 const area=document.querySelector('.shon-global-header .shon-header-actions');
 if(area){
  let link=area.querySelector('#shon-global-friend-requests');
  if(!link){link=document.createElement('a');link.id='shon-global-friend-requests';link.className='shon-header-action';link.href='connections.html?tab=people';area.appendChild(link);}
  link.href='connections.html?tab=people';
  link.hidden=!count;
  link.textContent=`👥 ${count} friend ${count===1?'request':'requests'}`;
  link.setAttribute('aria-label',`${count} pending friend ${count===1?'request':'requests'}. Open Connections.`);
 }
}
async function check(){
 if(active||!client||!memberId)return;active=true;
 try{
  const [{data:support,error:supportError},memberResult,friendResult]=await Promise.all([
   client.rpc("shon_support_unread_count"),memberUnread().catch(e=>{console.warn("Member notifications:",e.message);return null;}),pendingFriends().catch(e=>{console.warn("Friend request notifications:",e.message);return null;})
  ]);
  if(supportError)console.warn("Support notifications:",supportError.message);
  const supportCount=supportError?null:Number(support)||0;
  if(supportCount!==null){previousSupport=supportCount;displayCount("shon-global-support-count",supportCount);}
  if(memberResult!==null){previousMember=memberResult;displayCount("shon-global-member-count",memberResult);}
  if(friendResult!==null){previousFriends=friendResult;showFriendRequests(friendResult);}
  const memberCount=previousMember||0,contactCount=previousSupport||0,friendCount=previousFriends||0;
  const total=memberCount+contactCount+friendCount;
  const bell=$("shon-global-messages");
  if(bell)bell.setAttribute("aria-label",total?`${total} notifications. ${memberCount} member messages, ${contactCount} support messages, and ${friendCount} friend requests.`:"Messages. No unread notifications or friend requests.");
  const supportLink=$("shon-global-support");
  if(supportLink)supportLink.title=contactCount?`${contactCount} unread support messages`:"Contact SHONnetwork Support";
 }catch(e){console.warn("SHONnetwork notification refresh:",e.message);}finally{active=false;}
}
function ensureChatNav(){
 const nav=document.querySelector('.shon-global-header .shon-global-nav');
 if(!nav)return;
 const items=[
  ['index.html','Home'],['members.html','Sign In/Out'],
  ['discover.html','Discover'],['profile.html','Profile'],
  ['listings.html','Listings'],['connections.html','Connections'],
  ['chat.html','Chat'],['games.html','Games'],
  ['community.html','Community'],['resources.html','Resources'],
  ['partners.html','Partners']
 ];
 const existing=[...nav.querySelectorAll('a')];
 const page=location.pathname.split('/').pop()||'index.html';
 for(const [href,label] of items){
  let link=existing.find(a=>a.getAttribute('href')===href);
  if(!link){link=document.createElement('a');link.href=href;}
  link.textContent=label;
  if(page===href)link.setAttribute('aria-current','page');
  else link.removeAttribute('aria-current');
  nav.appendChild(link);
 }
 // Remove only duplicate links for these canonical destinations.
 for(const a of existing){
  if(items.some(([href])=>href===a.getAttribute('href')) &&
     a!==nav.querySelector('a[href="'+a.getAttribute('href')+'"]'))a.remove();
 }
}
function ensureTopActions(){
 const area=document.querySelector('.shon-global-header .shon-header-actions');
 if(!area)return;
 const support=area.querySelector('#shon-global-support');
 for(const [id,label,url,width,height] of [
  ['shon-global-messenger','💬 Messenger','messenger.html',380,690],
  ['shon-global-meetings','👥 Meetings','meetings.html',880,750]
 ]){
  let link=area.querySelector('#'+id);
  if(!link){
   link=document.createElement('a');
   link.id=id;link.className='shon-header-action';
   if(support)area.insertBefore(link,support);else area.appendChild(link);
  }
  link.textContent=label;link.href=url;
  if(link.dataset.shonPopupBound!=='yes'){
   link.dataset.shonPopupBound='yes';
   link.addEventListener('click',event=>{
    const popup=window.open(url,id,'popup=yes,width='+width+',height='+height+',resizable=yes,scrollbars=yes');
    if(popup){event.preventDefault();popup.focus();}
   });
  }
 }
}
async function init(){
 ensureChatNav();
 ensureTopActions();
 const bell=$("shon-global-messages");if(!bell)return;
 if(!window.supabase){console.warn("Supabase not available for header notifications");return;}
 try{
  client=window.supabase.createClient(PROJECT,PUBLISHABLE,{auth:{storageKey:AUTH_KEY}});
  const {data,error}=await client.auth.getUser();
  if(error||!data.user){bell.href="members.html";return;}
  memberId=data.user.id;
  bell.href="connections.html";
  await check();
  window.setInterval(check,30000);
  window.addEventListener("focus",check);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)check();});
  window.addEventListener("storage",event=>{if(event.key?.startsWith("shon-message-read-v1-"))check();});
 }catch(e){console.warn("SHONnetwork header initialization:",e.message);}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();

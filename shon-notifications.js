/* SHONnetwork shared notifications. No secret keys are stored in this file. */
(()=>{
"use strict";
const PROJECT="https://wqcninwqeyfoyxlllwdy.supabase.co";
const PUBLISHABLE="sb_publishable_YTHhpIPiKKHGBLMdkj_4og_Uyq_t_SX";
const AUTH_KEY="sb-wqcninwqeyfoyxlllwdy-auth-token";
const $=id=>document.getElementById(id);
let client=null,memberId=null,active=false,previousSupport=null,previousMember=null;
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
async function check(){
 if(active||!client||!memberId)return;active=true;
 try{
  const [{data:support,error:supportError},memberResult]=await Promise.all([
   client.rpc("shon_support_unread_count"),memberUnread().catch(e=>{console.warn("Member notifications:",e.message);return null;})
  ]);
  if(supportError)console.warn("Support notifications:",supportError.message);
  const supportCount=supportError?null:Number(support)||0;
  if(supportCount!==null){previousSupport=supportCount;displayCount("shon-global-support-count",supportCount);}
  if(memberResult!==null){previousMember=memberResult;displayCount("shon-global-member-count",memberResult);}
  const memberCount=previousMember||0,contactCount=previousSupport||0;
  const total=memberCount+contactCount;
  const bell=$("shon-global-messages");
  if(bell)bell.setAttribute("aria-label",total?`${total} unread notifications. ${memberCount} member messages and ${contactCount} support messages.`:"Messages. No unread notifications.");
  const supportLink=$("shon-global-support");
  if(supportLink)supportLink.title=contactCount?`${contactCount} unread support messages`:"Contact SHONnetwork Support";
 }catch(e){console.warn("SHONnetwork notification refresh:",e.message);}finally{active=false;}
}
async function init(){
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

/* SHON compatibility engine: reusable, local-only scoring primitives. */
(function(root){
"use strict";
function norm(value){return String(value==null?"":value).trim().toLowerCase();}
function tags(value){return new Set((Array.isArray(value)?value:String(value||"").split(/[,;\n]/)).map(norm).filter(Boolean));}
function compare(a,b){
a=a||{};b=b||{};
const strengths=[],questions=[];
let score=0;
function shared(field,label,points){
const x=norm(a[field]),y=norm(b[field]);
if(!x||!y)return;
if(x===y){score+=points;strengths.push(label);}
else questions.push(label+" differs; discuss before deciding.");
}
shared("smoking_household","Smoking preferences",2);
shared("relocation_scope","Relocation preferences",2);
const common=[...tags(a.interests)].filter(x=>tags(b.interests).has(x));
if(common.length){score+=Math.min(common.length,5);strengths.push("Shared interests: "+common.join(", "));}
const ar=tags(a.roles),br=tags(b.roles);
if((ar.has("need_place")&&br.has("have_space"))||(ar.has("have_space")&&br.has("need_place"))){
score+=5;strengths.push("Complementary household goals");
}
if(ar.has("looking_person")&&br.has("looking_person")){score+=3;strengths.push("Shared community-building goals");}
return {score,strengths,questions,commonInterests:common,
note:"Optional comparison, not a safety judgment or consent to contact."};
}
const api=Object.freeze({compare});
if(typeof module==="object"&&module.exports)module.exports=api;
root.SHONCompatibility=api;
})(typeof globalThis!=="undefined"?globalThis:this);

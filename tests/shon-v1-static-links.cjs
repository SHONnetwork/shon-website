#!/usr/bin/env node
'use strict';
// V1 static integrity guard only. Does not exercise dynamic auth, RLS, or member journeys.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const htmlFiles=fs.readdirSync(root).filter(name=>name.endsWith('.html')&&fs.statSync(path.join(root,name)).isFile()).sort();
const problems=[];
let checked=0, skipped=0;
for(const file of htmlFiles){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 const re=/<(a|link|script|img|iframe|source)\b[^>]*?\b(href|src)\s*=\s*(["'])(.*?)\3/gi;
 for(const match of html.matchAll(re)){
  const [,tag,attr,,raw]=match;
  const value=raw.trim();
  if(!value||/^(?:#|\/\/|[a-z][a-z\d+.-]*:)/i.test(value)||/\$\{|\{\{|<%|%>|\\[nx]/.test(value)){skipped++;continue}
  const uri=value.split(/[?#]/,1)[0];
  if(!uri){skipped++;continue}
  let decoded;
  try{decoded=decodeURIComponent(uri)}catch{problems.push(file+': invalid URL encoding '+value);continue}
  const local=decoded.startsWith('/')?decoded.slice(1):path.join(path.dirname(file),decoded);
  const target=path.resolve(root,local);
  if(target!==root&&!target.startsWith(root+path.sep)){problems.push(file+': local reference escapes repo '+value);continue}
  checked++;
  if(!fs.existsSync(target))problems.push(file+': missing '+tag+' '+attr+' '+JSON.stringify(value));
 }
}
console.log('SHON v1 static reference audit: '+htmlFiles.length+' root HTML pages, '+checked+' local targets, '+skipped+' dynamic/external/fragment references skipped.');
if(problems.length){
 console.error(problems.slice(0,100).join('\n'));
 console.error('FAILED '+problems.length+' missing/unsafe static references. Dynamic routes and browser behavior remain untested.');
 process.exitCode=1;
}else console.log('PASS static local references only. Not an acceptance of real account workflows, listing permissions or dynamic navigation.');

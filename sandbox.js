/* Pure local demo logic. No requests are sent to a server. */
(function(root){
  'use strict';
  function respond(endpoint, payload) {
    if (endpoint === 'profile') return {status:200,body:{name:'Md Raish',role:'Full-stack developer',focus:['Python','FastAPI','React','PostgreSQL'],education:'B.Tech CSE · Amity University · 2023–2027',github:'https://github.com/Mdraish786',simulation:true}};
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return {status:422,body:{error:'validation_error',detail:'Request body must be a JSON object.',simulation:true}};
    if (endpoint === 'shorten') {
      if (typeof payload.url !== 'string') return {status:422,body:{error:'validation_error',detail:'url must be a string.',simulation:true}};
      let url;
      try {url=new URL(payload.url);} catch(_){return {status:422,body:{error:'validation_error',detail:'Enter a complete URL starting with https:// or http://.',simulation:true}};}
      if (!['http:','https:'].includes(url.protocol) || url.username || url.password) return {status:422,body:{error:'validation_error',detail:'Use an HTTP(S) URL without embedded credentials.',simulation:true}};
      let hash=2166136261; for(let i=0;i<url.href.length;i++){hash^=url.href.charCodeAt(i);hash=Math.imul(hash,16777619);}
      return {status:201,body:{original_url:url.href,short_code:(hash>>>0).toString(36).slice(0,6).padEnd(6,'0'),clicks:0,simulation:true,note:'Sample result only. No live short URL was created.'}};
    }
    if (endpoint === 'authorize') {
      const allowedRoles=['employee','manager','it','finance'];
      if(!allowedRoles.includes(payload.role) || !allowedRoles.includes(payload.required_role) || typeof payload.is_requester!=='boolean')return {status:422,body:{error:'validation_error',detail:'Provide role and required_role (employee, manager, it, finance), plus a boolean is_requester.',simulation:true}};
      if(payload.is_requester)return {status:403,body:{allowed:false,reason:'Self-approval is blocked.',simulation:true}};
      if(payload.role==='employee' || payload.required_role==='employee')return {status:403,body:{allowed:false,reason:'Employees cannot approve requests.',simulation:true}};
      if(payload.role!==payload.required_role)return {status:403,body:{allowed:false,reason:'The current review step requires a different role.',simulation:true}};
      return {status:200,body:{allowed:true,role:payload.role,reason:'Role matches the current step and the reviewer is not the requester.',simulation:true}};
    }
    return {status:404,body:{error:'endpoint_not_found',simulation:true}};
  }
  root.PortfolioSandbox=Object.freeze({respond});
  if(typeof module!=='undefined' && module.exports)module.exports=root.PortfolioSandbox;
})(typeof globalThis!=='undefined'?globalThis:this);

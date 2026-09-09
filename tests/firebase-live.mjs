// Creates isolated temporary records, verifies permissions, and removes them.
import assert from 'node:assert/strict';
import {firebaseConfig as config} from '../firebase-config.js';
const authResponse=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${config.apiKey}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({returnSecureToken:true})});
assert.equal(authResponse.status,200,'Anonymous auth must be enabled');
const {idToken,localId}=await authResponse.json();
async function request(path,method='GET',value,authenticated=true){return fetch(`${config.databaseURL}/${path}.json${authenticated?'?auth='+idToken:''}`,{method,headers:{'Content-Type':'application/json'},body:value===undefined?undefined:JSON.stringify(value)});}
const period='test-'+Date.now(),paths=[];
try{
 for(const [game,value,sort] of [['tetris',123,-123],['mines-easy',45000,45000]]){
  const path=`rankings/${game}/${period}/${localId}`;paths.push(path);
  assert.equal((await request(path,'PUT',{name:'자동검증',value,sort,at:{'.sv':'timestamp'}})).status,200,`${game} write`);
  assert.equal((await (await request(path,'GET',undefined,false)).json()).value,value,`${game} public read`);
  assert.notEqual((await request(`rankings/${game}/${period}/someone-else`,'PUT',{name:'test',value,sort,at:{'.sv':'timestamp'}})).status,200,'Other user write blocked');
 }
 assert.notEqual((await request('rooms/TEST00','GET',undefined,false)).status,200,'Private room data requires auth');
 console.log('PASS: anonymous auth, both rankings write/read, ownership and room read protection');
}finally{for(const path of paths)assert.equal((await request(path,'DELETE')).status,200,'Test cleanup');}

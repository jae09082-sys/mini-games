import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import { getAuth, signInAnonymously, browserSessionPersistence, setPersistence } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js';
import { getDatabase, ref, set, get, update, onValue, onDisconnect, runTransaction, query, orderByChild, limitToFirst, serverTimestamp, remove } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
import { firebaseConfig } from './firebase-config.js';
const app=initializeApp(firebaseConfig);
export const db=getDatabase(app);
const auth=getAuth(app);
export const ready=setPersistence(auth,browserSessionPersistence).then(()=>signInAnonymously(auth)).then(r=>r.user.uid);
ready.catch(()=>{});
export {ref,set,get,update,onValue,onDisconnect,runTransaction,query,orderByChild,limitToFirst,serverTimestamp,remove};
export function playerName(){return (document.querySelector('#name')?.value.trim()||'게스트').slice(0,12);}
export function setupName(){const n=document.querySelector('#name');try{n.value=localStorage.getItem('mini-name')||'';}catch{}n.addEventListener('change',()=>{try{localStorage.setItem('mini-name',n.value.slice(0,12));}catch{}});}

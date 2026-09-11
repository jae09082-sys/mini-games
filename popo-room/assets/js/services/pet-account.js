// Separate app/auth instance: the existing multiplayer session remains anonymous.
import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getAuth,browserLocalPersistence,setPersistence,onAuthStateChanged,GoogleAuthProvider,signInWithPopup,signOut} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js';
import {getDatabase,ref,get,runTransaction} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
import {firebaseConfig} from './firebase-config.js';
const app=initializeApp(firebaseConfig,'malang-progress'),auth=getAuth(app),db=getDatabase(app);
const label=document.querySelector('#account-status'),login=document.querySelector('#account-login'),logout=document.querySelector('#account-logout');
let running=false,connected=false,popupPending=false;
function status(text){if(label)label.textContent=(auth.currentUser?'Google 로그인됨 · '+(auth.currentUser.displayName||auth.currentUser.email||'내 계정')+' · ':'')+text}
function refresh(){if(typeof globalThis.render==='function')globalThis.render();globalThis.PetReactions?.refresh()}
function errorMessage(error){return ({'auth/popup-closed-by-user':'로그인을 취소했어요.','auth/popup-timeout':'Google 인증 응답이 아직 도착하지 않았어요. 로그인 창을 닫고 다시 시도해 주세요. 앱 안에서 열었다면 Chrome 또는 Edge에서 같은 주소를 열어 주세요.', 'auth/popup-blocked':'로그인 창이 차단됐어요. 팝업을 허용해 주세요.','auth/unauthorized-domain':'이 주소의 로그인 설정이 아직 완료되지 않았어요.','auth/operation-not-allowed':'Google 로그인 설정이 아직 완료되지 않았어요.','PERMISSION_DENIED':'계정 저장 권한 설정이 아직 완료되지 않았어요.'})[error.code]||error.message||'연결하지 못했어요. 다시 시도해 주세요.'}
function transport(uid){const target=ref(db,'petProfiles/'+uid);return {
 status,
 async load(){const snapshot=await get(target);return snapshot.val()},
 async commit(revision,data){const result=await runTransaction(target,current=>{
  // An empty SDK cache is not a server conflict. Let the server retry
  // with its current value; existing revision rules still reject creation.
  if(current!==null&&current.revision!==revision)return;
  return {version:1,revision:revision+1,data};
 },{applyLocally:false});if(!result.committed)throw Error('다른 기기에서 기록이 바뀌었어요. 다시 시도하면 최신 기록을 불러와요.')},
 async ensure(seed){const result=await runTransaction(target,current=>current?undefined:{version:1,revision:1,data:JSON.stringify(seed)},{applyLocally:false});Popo.decodeCloud(result.snapshot.val())}
}}
async function connect(user){if(running)return;running=true;connected=false;
 try{
  if(!user){if(Popo.owner){status('계정 기록을 불러오려면 다시 로그인해 주세요.');return}status('게스트로 함께하는 중 · 로그인하면 계정에 저장돼요.');return}
  status('계정 기록을 불러오는 중…');const api=transport(user.uid);
  if(Popo.owner!==user.uid){await Popo.flushResults();await Popo.activateAccount(user.uid,seed=>api.ensure(seed));location.reload();return}
  await Popo.attachCloud(api);connected=true;await Popo.flushResults();refresh();if(typeof globalThis.onReturn==='function')await globalThis.onReturn();status('계정 기록 연결 완료 · 변경하면 자동 저장돼요.');
 }catch(error){status(errorMessage(error))}finally{running=false;if(login)login.hidden=connected;if(logout)logout.hidden=!user}
}
let resolveAccount,rejectAccount;
export const accountReady=new Promise((resolve,reject)=>{resolveAccount=resolve;rejectAccount=reject});
accountReady.catch(()=>{});
await setPersistence(auth,browserLocalPersistence);
onAuthStateChanged(auth,user=>{
 globalThis.MalangPlayerName=user?(user.displayName||'말랑 친구').trim().slice(0,12):'';
 const input=document.querySelector('#name');
 if(input&&user){input.value=globalThis.MalangPlayerName;input.readOnly=true;input.title='Google 계정 이름으로 참여해요.'}
 resolveAccount(user);
 return connect(user);
},error=>{rejectAccount(error);status(errorMessage(error))});login?.addEventListener('click',async()=>{
 if(popupPending||running)return;
 popupPending=true;login.disabled=true;status('Google 로그인 확인 중…');
 try{
  if(auth.currentUser)await connect(auth.currentUser);
  else {
      let timeout;
   let result;
   try {
    result=await Promise.race([
     signInWithPopup(auth,new GoogleAuthProvider()),
     new Promise((_,reject)=>{timeout=setTimeout(()=>reject({code:'auth/popup-timeout'}),45000)})
    ]);
   }finally{clearTimeout(timeout)}
   if(!connected&&!running)await connect(result.user);
  }
 }catch(error){
  // Auth events can complete before the popup promise settles. Keep the
  // authenticated state instead of replacing it with a stale popup error.
  if(auth.currentUser){if(!connected&&!running)await connect(auth.currentUser)}
  else if(!running)status(error.code==='auth/popup-closed-by-user'?'Google 로그인이 완료되지 않았어요. 다시 시도해 주세요.':errorMessage(error));
 }finally{popupPending=false;login.disabled=false}
});
logout?.addEventListener('click',async()=>{if(running)return;running=true;try{await Popo.flushResults();await Popo.logoutAccount(()=>signOut(auth));location.reload()}catch(error){status(errorMessage(error))}finally{running=false}});
addEventListener('focus',()=>{if(auth.currentUser&&!running)connect(auth.currentUser)});
addEventListener('online',()=>{if(!running)connect(auth.currentUser)});
addEventListener('storage',event=>{if(event.key==='malang-account')location.reload()});






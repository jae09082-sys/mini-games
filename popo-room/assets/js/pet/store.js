(function(g){
const nativeStorage=localStorage;let storage=nativeStorage,cloud=null;
const ACCOUNT='malang-account';let owner='';try{owner=nativeStorage.getItem(ACCOUNT)||''}catch{}
if(!/^[a-zA-Z0-9_-]{1,128}$/.test(owner))owner='';

const PET_IDS=['popo','mochi','tori','lumi'];
const growthStages=Object.freeze([{id:'baby',name:'아기',xp:0},{id:'juvenile',name:'유아기',xp:100},{id:'grown',name:'성장기',xp:300}].map(Object.freeze));
const growthStage=xp=>xp>=300?2:xp>=100?1:0;
const discoveries=Object.freeze([{id:'ghost',name:'몽글',icon:'👻',stat:'losses',target:10,unit:'회',condition:'지뢰찾기에서 실패해도 다시 도전한 기록',hint:'실패해도 괜찮아. 열 번의 용기.'},{id:'teto',name:'테토',icon:'▦',stat:'lines',target:50,unit:'줄',condition:'테트리스에서 지운 줄',hint:'빈틈없이, 쉰 줄을 채워봐.'}].map(Object.freeze));
const PROFILE_KEYS=['xp','affinity','hunger','happy','energy','last','lastPlay','lastSleep'];
const KEY='popo-room-v1'+(owner?'-user-'+owner:''),OUTBOX=KEY+'-result-';const day=(at=Date.now())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(at));
const initial=()=>({version:1,activePet:'popo',starterChosen:false,companions:['popo'],petProfiles:{},growthSeen:{popo:0,mochi:0,tori:0,lumi:0},resultReceipts:{},points:150,xp:0,affinity:0,pendingReaction:null,hunger:70,happy:70,energy:80,owned:[],equipped:{},pets:['popo'],discoverySeen:[],stats:{mines:0,losses:0,tetris:0,lines:0,bestTetris:0},daily:{date:day(),feed:0,play:0,games:0,affinityGain:0,petted:false,claimed:[]},last:Date.now(),lastPlay:0,lastSleep:0});
const snapshots=new WeakMap();
let memory=initial(),notice='',recoveryRaw=null,unsupported=false;
const canonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
const copy=value=>JSON.parse(JSON.stringify(value));
const object=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};
const integer=(value,fallback=0,max=Number.MAX_SAFE_INTEGER)=>Number.isFinite(value)&&value>=0?Math.min(max,Math.floor(value)):fallback;
function normalize(value){
 const base=initial(),v=object(value),stats=object(v.stats),daily=object(v.daily),equipped=object(v.equipped);
 for(const key of ['points','xp','last','lastPlay','lastSleep'])base[key]=integer(v[key],base[key]);
 base.affinity=integer(v.affinity,0,200);const pending=object(v.pendingReaction);if(['MINIGAME_HIGH_SCORE','GAME_WIN'].includes(pending.trigger)&&Number.isFinite(pending.at))base.pendingReaction={trigger:pending.trigger,at:pending.at};
 for(const key of ['hunger','happy','energy'])base[key]=integer(v[key],base[key],100);
 for(const key of Object.keys(base.stats))base.stats[key]=integer(stats[key]);
 base.owned=Array.isArray(v.owned)?[...new Set(v.owned.filter(x=>['bow','crown','sofa','wall'].includes(x)))]:[];
 base.pets=['popo',...new Set((Array.isArray(v.pets)?v.pets:[]).filter(x=>['ghost','teto'].includes(x)))];
 base.discoverySeen=v.discoverySeen===undefined?base.pets.filter(id=>id!=='popo'):[...new Set((Array.isArray(v.discoverySeen)?v.discoverySeen:[]).filter(id=>id!=='popo'&&base.pets.includes(id)))];
 for(const [slot,ids] of Object.entries({hat:['bow','crown'],furniture:['sofa'],wall:['wall']})){if(ids.includes(equipped[slot])&&base.owned.includes(equipped[slot]))base.equipped[slot]=equipped[slot];else if(equipped[slot]===null)base.equipped[slot]=null}
 if(typeof daily.date==='string')base.daily.date=daily.date;
 for(const key of ['feed','play','games'])base.daily[key]=integer(daily[key]);
 base.daily.affinityGain=integer(daily.affinityGain,0,6);base.daily.petted=daily.petted===true;
 base.daily.claimed=Array.isArray(daily.claimed)?[...new Set(daily.claimed.filter(x=>['feed','play','games'].includes(x)))]:[];
 base.starterChosen=v.starterChosen===undefined?true:v.starterChosen===true;
 base.companions=v.companions===undefined?PET_IDS.slice():[...new Set((Array.isArray(v.companions)?v.companions:[]).filter(id=>PET_IDS.includes(id)))];
 base.activePet=PET_IDS.includes(v.activePet)?v.activePet:'popo';
 if(!base.companions.includes(base.activePet))base.companions.push(base.activePet);
 for(const id of PET_IDS){if(id===base.activePet||!object(v.petProfiles)[id])continue;const p=object(v.petProfiles[id]),defaults=initial();base.petProfiles[id]={};for(const key of PROFILE_KEYS)base.petProfiles[id][key]=integer(p[key],defaults[key],key==='affinity'?200:['hunger','happy','energy'].includes(key)?100:Number.MAX_SAFE_INTEGER)}
 for(const id of PET_IDS){const baseline=growthStage(id===base.activePet?base.xp:base.petProfiles[id]?.xp||0);base.growthSeen[id]=v.growthSeen===undefined?baseline:integer(object(v.growthSeen)[id],baseline,2)}
 for(const [id,reward] of Object.entries(object(v.resultReceipts))){if(/^[a-f0-9-]{36}$/.test(id)&&Number.isFinite(reward)&&reward>=0&&reward<=200)base.resultReceipts[id]=Math.floor(reward)}
 return base;
}
function read(){
 let raw;notice='';unsupported=false;
 try{raw=storage.getItem(KEY)}catch{notice='브라우저 저장소에 접근할 수 없어요. 돌봄과 보상 저장 설정을 확인해 주세요.'}
 let s=raw===null||raw===undefined?initial():copy(memory);recoveryRaw=null;
 if(raw){try{const parsed=JSON.parse(raw);unsupported=parsed?.version!==undefined&&parsed.version!==1;if(unsupported){notice='다른 버전의 저장 데이터가 있어요. 데이터 보호를 위해 저장을 중지했어요.'}else{s=normalize(parsed);if(canonical(s)!==canonical({...parsed,activePet:parsed.activePet??'popo',starterChosen:parsed.starterChosen??true,companions:parsed.companions??PET_IDS,petProfiles:parsed.petProfiles??{},resultReceipts:parsed.resultReceipts??{},growthSeen:parsed.growthSeen??s.growthSeen,discoverySeen:parsed.discoverySeen??s.discoverySeen,affinity:parsed.affinity??0,pendingReaction:parsed.pendingReaction??null,stats:parsed.stats?{...parsed.stats,bestTetris:parsed.stats.bestTetris??0}:parsed.stats,daily:parsed.daily?{...parsed.daily,affinityGain:parsed.daily.affinityGain??0,petted:parsed.daily.petted??false}:parsed.daily})){recoveryRaw=raw;notice='일부 저장값을 복구했어요. 다음 저장 전에 원본을 별도로 보관해요.'}}}catch{recoveryRaw=raw;s=initial();notice='저장 데이터를 읽지 못했어요. 다음 저장 전에 원본을 별도로 보관해요.'}}
 if(s.daily.date!==day())s.daily={date:day(),feed:0,play:0,games:0,affinityGain:0,petted:false,claimed:[]};
 const hours=Math.max(0,Math.floor((Date.now()-s.last)/3600000));if(hours){s.hunger=Math.max(0,s.hunger-Math.min(40,hours*2));s.energy=Math.max(0,s.energy-Math.min(30,hours));s.last=Date.now()}
 snapshots.set(s,raw??null);return s;
}
function save(s){
 if(unsupported)throw Error('Unsupported save version');
 const next=normalize(s);
 if(recoveryRaw!==null)storage.setItem(KEY+'-recovery',recoveryRaw);
 storage.setItem(KEY,JSON.stringify(next));
 memory=copy(next);recoveryRaw=null;notice='';return copy(next);
}
const items=[{id:'bow',name:'딸기 리본',price:100,slot:'hat',icon:'🎀',text:'작은 친구에게 사랑스러운 포인트'},{id:'crown',name:'별빛 왕관',price:300,slot:'hat',icon:'👑',text:'오늘의 작은 주인공을 위해'},{id:'sofa',name:'포근한 소파',price:180,slot:'furniture',icon:'🛋️',text:'쉬어 가는 작은 자리'},{id:'wall',name:'라벤더 벽지',price:220,slot:'wall',icon:'🪻',text:'방 안에 물든 보랏빛'}];
function bond(s,amount){const gain=Math.min(amount,6-s.daily.affinityGain);s.affinity=Math.min(200,s.affinity+gain);s.daily.affinityGain+=gain}
function act(type,id){const s=read();let message='';
if(type==='adopt'){
 if(!PET_IDS.includes(id)||!s.starterChosen)return '먼저 첫 친구를 선택해 주세요.';
 if(s.companions.includes(id))return '이미 함께하는 친구예요.';
 if(s.points<500)return '새 친구를 맞이하려면 500 P가 필요해요.';
 s.points-=500;s.companions.push(id);save(s);return '새 친구를 맞이했어요! 도감에서 함께할 수 있어요.';
}
if(type==='select'){
 if(!PET_IDS.includes(id))return '아직 함께할 수 없는 친구예요.';
 if(!s.starterChosen){s.starterChosen=true;s.companions=[id];s.activePet=id;save(s);return '첫 친구와 함께하는 하루가 시작됐어요!'}
 if(!s.companions.includes(id))return '도감에서 먼저 새 친구를 맞이해 주세요.';
 if(!PET_IDS.includes(id))return '아직 함께할 수 없는 친구예요.';
 if(s.activePet===id)return '지금 함께하고 있는 친구예요.';
 s.petProfiles[s.activePet]=Object.fromEntries(PROFILE_KEYS.map(key=>[key,s[key]]));
 const profile=s.petProfiles[id]||initial();for(const key of PROFILE_KEYS)s[key]=profile[key];
 delete s.petProfiles[id];s.activePet=id;s.pendingReaction=null;save(s);return '함께할 친구를 바꿨어요.';
}
if(type==='care'){if(id==='feed'){if(s.points<20)return '포인트가 부족해요. 미니게임을 해볼까요?';if(s.hunger>=100)return '배부름이 가득 차 있어요.';s.points-=20;s.hunger=Math.min(100,s.hunger+25);s.xp+=10;s.daily.feed++;bond(s,1);message='먹이를 주었어요. 배부름 +25 · 20 P 사용'}if(id==='play'){if(Date.now()-s.lastPlay<60000)return '놀아주기는 1분마다 가능해요.';if(s.energy<10)return '기운이 부족해요. 먼저 휴식이 필요해요.';s.energy-=10;s.happy=Math.min(100,s.happy+15);s.xp+=5;s.daily.play++;s.lastPlay=Date.now();bond(s,2);message='함께 놀았어요. 행복 +15 · 기운 -10'}if(id==='sleep'){if(Date.now()-s.lastSleep<60000)return '아직 쉬고 있어요. 잠깐 기다려주세요.';s.energy=Math.min(100,s.energy+25);s.lastSleep=Date.now();bond(s,1);message='휴식을 시작했어요. 기운 +25'}}
if(type==='pet'){if(!s.daily.petted){s.daily.petted=true;bond(s,1)}message='작은 친구를 쓰다듬었어요.'}
if(type==='shop'){const item=items.find(x=>x.id===id);if(!item)return '';if(!s.owned.includes(id)){if(s.points<item.price)return '포인트가 부족해요. 함께 게임하러 가요!';s.points-=item.price;s.owned.push(id)}s.equipped[item.slot]=s.equipped[item.slot]===id?null:id;message='소품 설정을 변경했어요.'}
if(type==='claim'){if(!['feed','play','games'].includes(id)||s.daily[id]<1||s.daily.claimed.includes(id))return '아직 받을 보상이 없어요.';s.daily.claimed.push(id);s.points+=30;message='오늘의 목표 완료! +30 P'}save(s);return message}
function result(d,entry,id){const s=read(),previousReaction=s.pendingReaction;let reward=0;if(d.game==='mines'){if(d.won){s.stats.mines++;s.pendingReaction={trigger:'GAME_WIN',at:Date.now()};reward={easy:80,medium:130,hard:200}[d.difficulty]||80}else s.stats.losses++}else if(d.game==='tetris'){if(Number.isFinite(d.score)&&d.score>=100&&d.score>s.stats.bestTetris)s.pendingReaction={trigger:'MINIGAME_HIGH_SCORE',at:Date.now()};s.stats.bestTetris=Math.max(s.stats.bestTetris,integer(d.score));s.stats.tetris++;s.stats.lines+=Math.max(0,Math.floor(d.lines||0));reward=Math.min(200,Math.floor(Math.max(0,d.score||0)/20))}else return 0;s.points+=reward;
 const target=entry.petId===s.activePet?s:(s.petProfiles[entry.petId]||=Object.fromEntries(PROFILE_KEYS.map(key=>[key,initial()[key]])));
 target.xp+=reward?15:2;if(entry.date===day())s.daily.games++;
 if(entry.petId!==s.activePet)s.pendingReaction=previousReaction;else if(s.pendingReaction&&s.pendingReaction!==previousReaction)s.pendingReaction.at=entry.at;
 // Keep receipts with uncleared outbox records; retain recent receipts for waiting callers.
 const receipts=Object.keys(s.resultReceipts);for(const old of receipts.slice(0,-64)){if(storage.getItem(OUTBOX+old)===null)delete s.resultReceipts[old]}
 s.resultReceipts[id]=reward;
for(const d of discoveries)if(s.stats[d.stat]>=d.target&&!s.pets.includes(d.id))s.pets.push(d.id);save(s);return reward}
function takeGrowth(){const s=read(),stage=growthStage(s.xp),previous=s.growthSeen[s.activePet];if(stage<=previous)return null;s.growthSeen[s.activePet]=stage;save(s);return {petId:s.activePet,stage,previous}}
function takeReaction(){const s=read(),pending=s.pendingReaction;if(!pending)return null;s.pendingReaction=null;save(s);return Date.now()-pending.at<86400000?pending.trigger:null}
// Every read-modify-write executes under the same origin-wide exclusive lock.
async function transaction(work){
 if(!g.navigator?.locks?.request)throw Error('안전한 저장을 지원하지 않는 환경이에요. HTTPS 주소의 최신 브라우저로 열어 주세요.');
 return g.navigator.locks.request(KEY+'-write',{mode:'exclusive'},async()=>{
  storage.getItem(KEY); // Do not overwrite data when reading storage is denied.
  if((nativeStorage.getItem(ACCOUNT)||'')!==owner)throw Error('계정이 바뀌었어요. 페이지를 새로고침해 주세요.');
  if(owner&&nativeStorage.getItem('malang-logout')===owner)throw Error('로그아웃 중이에요.');
  if(owner)return cloudWork(work);
  return work();
 });
}
function actWithReaction(type,id){return transaction(()=>{
 const before=read(),message=act(type,id),after=read();let trigger;
 if(type==='care'&&(after.points!==before.points||after.lastPlay!==before.lastPlay||after.lastSleep!==before.lastSleep))trigger={feed:'FED',play:'PLAYED',sleep:'REST'}[id];
 if(type==='shop'&&after.owned.length>before.owned.length)trigger='NEW_FURNITURE';
 if(type==='pet')trigger='PETTED';
 if(type==='select'&&before.activePet!==after.activePet)trigger='NORMAL';
 return {message,trigger};
})}
function saveSnapshot(s){const expected=snapshots.get(s),next=copy(s);return transaction(()=>{
 if(expected===undefined||(storage.getItem(KEY)??null)!==expected)throw Error('다른 탭에서 저장값이 바뀌었어요. 다시 읽은 뒤 시도해 주세요.');
 read();return save(next);
})}
function pendingKeys(){const keys=[];for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key?.startsWith(OUTBOX))keys.push(key)}return keys.sort()}
function processResult(key){return transaction(()=>{
 const id=key.slice(OUTBOX.length),raw=storage.getItem(key),s=read();
 if(!raw)return {reward:s.resultReceipts[id]??0,applied:false};
 const entry=JSON.parse(raw);
 if(!/^[a-f0-9-]{36}$/.test(id)||entry.version!==1||!PET_IDS.includes(entry.petId)||!Number.isFinite(entry.at)||entry.date!==day(entry.at)||!['mines','tetris'].includes(entry.detail?.game))throw Error('보관된 게임 결과를 확인할 수 없어요.');
 const applied=!Object.hasOwn(s.resultReceipts,id);
 const reward=applied?result(entry.detail,entry,id):s.resultReceipts[id];
 // A failed cleanup must never turn a committed reward into a second payment.
 try{storage.removeItem(key)}catch{}
 return {reward,applied};
})}
async function enqueueResult(d){
 if(owner&&nativeStorage.getItem('malang-logout')===owner)throw Error('로그아웃 중에는 새 놀이 기록을 저장할 수 없어요.');
 if((nativeStorage.getItem(ACCOUNT)||'')!==owner)throw Error('계정이 바뀌었어요. 페이지를 새로고침해 주세요.');
 if(!['mines','tetris'].includes(d?.game))return 0;
 const detail=d.game==='tetris'?{game:'tetris',score:integer(d.score,0,1e9),lines:integer(d.lines,0,1e6)}:{game:'mines',won:d.won===true,difficulty:['easy','medium','hard'].includes(d.difficulty)?d.difficulty:'easy'};
 const at=Date.now(),key=OUTBOX+g.crypto.randomUUID();
 // Synchronous staging happens before waiting for the cross-tab lock.
 storage.setItem(key,JSON.stringify({version:1,petId:read().activePet,at,date:day(at),detail}));
 try{return (await processResult(key)).reward}catch(error){error.rewardQueued=true;throw error}
}
async function flushResults(){const results={applied:0,failed:0};for(const key of pendingKeys()){try{if((await processResult(key)).applied)results.applied++}catch{results.failed++}}return results}
function markDiscoveriesSeen(ids){const s=read(),before=s.discoverySeen.length;for(const id of ids)if(discoveries.some(d=>d.id===id)&&s.pets.includes(id)&&!s.discoverySeen.includes(id))s.discoverySeen.push(id);if(s.discoverySeen.length!==before)save(s)}
function parseBackup(text){
 if(typeof text!=='string'||text.length>1000000)throw Error('백업 파일이 너무 커요.');
 let file;try{file=JSON.parse(text)}catch{throw Error('읽을 수 없는 백업 파일이에요.')}
 if(file?.format!=='malang-village-backup'||file.version!==1||!Number.isFinite(file.createdAt)||file.state?.version!==1)throw Error('지원하지 않는 말랑마을 백업이에요.');
 const state=normalize(file.state);if(canonical(state)!==canonical({...file.state,starterChosen:file.state.starterChosen??true,companions:file.state.companions??PET_IDS}))throw Error('백업 내용이 손상되었거나 현재 버전과 맞지 않아요.');
 return {createdAt:file.createdAt,state};
}
function packBackup(state){return JSON.stringify({format:'malang-village-backup',version:1,createdAt:Date.now(),state},null,2)}
function exportBackup(){const s=read();if(unsupported||recoveryRaw!==null||notice)throw Error('현재 저장 상태를 확인한 후 다시 백업해 주세요.');if(pendingKeys().length)throw Error('아직 반영하지 못한 놀이 기록이 있어요. 방으로 돌아와 반영한 뒤 다시 시도해 주세요.');return packBackup(s)}
function prepareRestore(text){const backup=parseBackup(text);read();if(unsupported)throw Error('현재 저장 버전에서는 복원할 수 없어요.');return {...backup,baseline:storage.getItem(KEY)}}
function restoreBackup(text,baseline){const backup=parseBackup(text);read();if(unsupported)throw Error('현재 저장 버전에서는 복원할 수 없어요.');if(storage.getItem(KEY)!==baseline)throw Error('미리보기 이후 기록이 바뀌었어요. 파일을 다시 선택해 주세요.');if(pendingKeys().length)throw Error('반영 대기 중인 놀이 기록이 있어요. 먼저 방에서 반영해 주세요.');
 if(baseline!==null)storage.setItem(KEY+'-before-restore',baseline);
 backup.state.resultReceipts={...backup.state.resultReceipts,...read().resultReceipts};
 return save(backup.state);
}
function previousBackup(){const raw=storage.getItem(KEY+'-before-restore');if(!raw)throw Error('교체 전 기록이 없어요.');const state=JSON.parse(raw);const text=packBackup(state);parseBackup(text);return text}
function decodeCloud(record){
 if(!record||record.version!==1||!Number.isSafeInteger(record.revision)||record.revision<1||typeof record.data!=='string'||record.data.length>1000000)throw Error('계정 기록 형식을 확인할 수 없어요.');
 const state=JSON.parse(record.data);if(state.version!==1||canonical(normalize(state))!==canonical({...state,starterChosen:state.starterChosen??true,companions:state.companions??PET_IDS}))throw Error('계정 기록이 현재 버전과 맞지 않아요.');return state;
}
async function cloudWork(work){
 if(!cloud)throw Error('계정 기록을 연결 중이에요. 잠시 후 다시 시도해 주세요.');
 const remote=await cloud.load();decodeCloud(remote);
 const changes=new Map([[KEY,remote.data]]),oldMemory=memory;
 storage={getItem:k=>changes.has(k)?changes.get(k):nativeStorage.getItem(k),setItem:(k,v)=>changes.set(k,String(v)),removeItem:k=>changes.set(k,null),get length(){return nativeStorage.length},key:i=>nativeStorage.key(i)};
 let result,next;
 try{result=work();next=storage.getItem(KEY)}catch(error){memory=oldMemory;throw error}finally{storage=nativeStorage}
 try{
  if(next!==remote.data)await cloud.commit(remote.revision,next);
  // Write the cache before removing processed outbox entries. A failed local write
  // leaves the queued result intact; the server receipt prevents a second reward.
  nativeStorage.setItem(KEY,next);
  for(const [key,value]of changes)if(key!==KEY){if(value===null)nativeStorage.removeItem(key);else nativeStorage.setItem(key,value)}
  cloud.status?.('계정에 저장됨');return result;
 }catch(error){memory=oldMemory;cloud.status?.('저장하지 못했어요. 연결 후 다시 시도해 주세요.');throw error}
}
async function activateAccount(uid,ensure){
 if(!/^[a-zA-Z0-9_-]{1,128}$/.test(uid))throw Error('계정을 확인할 수 없어요.');
 return g.navigator.locks.request(KEY+'-write',{mode:'exclusive'},async()=>{
  if((nativeStorage.getItem(ACCOUNT)||'')!==owner)throw Error('계정이 바뀌었어요. 새로고침해 주세요.');
  if(pendingKeys().length)throw Error('남은 놀이 기록을 먼저 반영해 주세요.');
  const seed=!owner&&!nativeStorage.getItem('malang-guest-claimed')?parseBackup(exportBackup()).state:initial();
  await ensure(seed);
  if(!owner)nativeStorage.setItem('malang-guest-claimed',uid);
  nativeStorage.setItem(ACCOUNT,uid);
 });
}
async function logoutAccount(signOut){
 if(!owner){await signOut();return}
 return g.navigator.locks.request(KEY+'-write',{mode:'exclusive'},async()=>{
  if((nativeStorage.getItem(ACCOUNT)||'')!==owner)throw Error('계정이 바뀌었어요. 새로고침해 주세요.');
  if(pendingKeys().length)throw Error('아직 서버에 저장하지 못한 놀이 기록이 있어요. 인터넷에 연결한 뒤 다시 로그아웃해 주세요.');
  nativeStorage.setItem('malang-logout',owner);
  try{
   await signOut();cloud=null;memory=initial();
   for(const key of [KEY,KEY+'-recovery',KEY+'-before-restore'])nativeStorage.removeItem(key);
   if(nativeStorage.getItem(ACCOUNT)===owner)nativeStorage.removeItem(ACCOUNT);
  }finally{if(nativeStorage.getItem('malang-logout')===owner)nativeStorage.removeItem('malang-logout')}
 });
}
function attachCloud(adapter){cloud=adapter;return transaction(()=>read())}
g.Popo={read,owner,logoutAccount,storageKey:KEY,decodeCloud,attachCloud,activateAccount,refreshCloud:()=>transaction(()=>read()),parseBackup,prepareRestore,exportBackup:()=>transaction(exportBackup),restoreBackup:(text,baseline)=>transaction(()=>restoreBackup(text,baseline)),previousBackup,discoveries,markDiscoveriesSeen:ids=>transaction(()=>markDiscoveriesSeen(ids)),growthStages,growthStage,takeGrowth:()=>transaction(takeGrowth),save:saveSnapshot,takeReaction:()=>transaction(takeReaction),act:(type,id)=>transaction(()=>act(type,id)),actWithReaction,result:enqueueResult,flushResults,items,day,getNotice:()=>notice};
})(globalThis);

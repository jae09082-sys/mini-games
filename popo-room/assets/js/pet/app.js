const $=s=>document.querySelector(s);let tab='shop',timer;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('visible'),3200)}
function growthAlbum(s){return Object.entries(PetCatalog.pets).map(([id,pet])=>{
 const xp=id===s.activePet?s.xp:(s.petProfiles[id]?.xp||0),index=Popo.growthStage(xp),next=Popo.growthStages[index+1];
 return {id,pet,xp,index,next,unlocked:s.companions.includes(id)?index+1:0};
})}
function albumCard(entry,s){const {id,pet,xp,index,next}=entry;if(!s.companions.includes(id))return `<article class="item album-card"><h3>${pet.name}</h3><img class="adopt-image" src="${PetCatalog.appearance(id,'baby').image}" alt="${pet.name}"><p>${pet.personality}</p><button data-adopt="${id}" ${s.points<500?'disabled':''}>새 친구 맞이하기 · 500 P</button><p>${s.points<500?`앞으로 ${500-s.points} P 더 모으면 만나요.`:'맞이한 뒤에는 언제든 함께할 수 있어요.'}</p></article>`;return `<article class="item album-card" data-album="${id}"><h3>${pet.name}</h3><p>${pet.personality}</p><div class="album-stages">${Popo.growthStages.map((stage,i)=>`<figure ${i===index?'aria-current="step"':''}>${i<=index?`<img src="${PetCatalog.appearance(id,stage.id).image}" alt="${pet.name}의 ${stage.name} 모습" loading="lazy" width="100" height="100">`:'<span class="album-locked" aria-label="아직 자라지 않은 모습">?</span>'}<figcaption>${stage.name}<small>${i<=index?(i===index?'지금 모습':'함께한 모습'):stage.xp+' XP'}</small></figcaption></figure>`).join('')}</div><p class="album-progress">${next?next.name+'까지 '+(next.xp-xp)+' XP':'세 가지 모습을 모두 만났어요.'}</p><button data-select="${id}" ${s.activePet===id?'disabled':''}>${s.activePet===id?'함께하는 중':'함께하기'}</button></article>`}
function render(){const s=Popo.read(),pet=PetCatalog.get(s.activePet),stageIndex=Popo.growthStage(s.xp),stage=Popo.growthStages[stageIndex],nextStage=Popo.growthStages[stageIndex+1];
 if($('#pet-name').textContent!==pet.name){$('#growth-announcement').textContent='';$('#room').classList.remove('growth-celebration')}
 document.body.dataset.starter=String(!s.starterChosen);$('#starter-picker').innerHTML=s.starterChosen?'':`<h2>처음 함께할 친구를 골라주세요</h2><p>첫 친구는 무료예요. 다른 친구는 500 P로 맞이할 수 있어요.</p><div class="starter-options">${Object.entries(PetCatalog.pets).map(([id,p])=>`<button data-select="${id}"><img src="${PetCatalog.appearance(id,'baby').image}" alt="">${p.name}<small>${p.personality}</small></button>`).join('')}</div>`;
 $('#pet-name').textContent=pet.name;$('#pet-personality').textContent='♥ '+pet.personality;
 $('#pet').setAttribute('aria-label',pet.name+' 쓰다듬기');$('#pet').dataset.pet=s.activePet;$('#pet').dataset.growth=stage.id;
 const appearance=PetCatalog.appearance(s.activePet,stage.id);$('#pet').dataset.customArt=String(Boolean(appearance.custom));
 $('.face-fit').style.transform=appearance.custom?`translate(${appearance.faceX}px,${appearance.faceY}px) scaleX(${appearance.faceScale})`:'';
 const art=$('.pet-art');const source=appearance.image;if(art.getAttribute('src')!==source)art.setAttribute('src',source);art.alt=stage.name+' 모습의 '+pet.description;
 $('#room').dataset.theme=s.activePet;$('.room-label').textContent=pet.theme;$('.window span').textContent=pet.window;$('.picture').textContent=pet.picture;
 const unseen=Popo.discoveries.filter(d=>s.pets.includes(d.id)&&!s.discoverySeen.includes(d.id));
 $('#discovery-announcement').innerHTML=unseen.length?`<span>새 친구 ${unseen.map(d=>d.name).join(' · ')}를 발견했어요!</span><button data-tab="book">도감에서 만나기</button>`:'';
 $('#pet-picker').innerHTML=Object.entries(PetCatalog.pets).filter(([id])=>s.companions.includes(id)).map(([id,p])=>`<button data-select="${id}" aria-pressed="${id===s.activePet}">${p.name}<small>${id===s.activePet?'함께하는 중':'함께하기'}</small></button>`).join('');
const notice=$('#storage-notice');notice.textContent=Popo.getNotice();notice.hidden=!notice.textContent;$('#balance').textContent=s.points.toLocaleString();$('#date').textContent=Popo.day()+' · 오늘의 작은 행복';$('#level').textContent='Lv. '+(1+Math.floor(s.xp/100));$('#stage').textContent=stage.name+' '+['♡','✿','✦'][stageIndex];$('#growth').textContent=nextStage?`${nextStage.name} 모습까지 ${nextStage.xp-s.xp} XP · 함께 자라고 있어요`:`성장기의 모습으로 함께해요 · 다음 레벨까지 ${100-s.xp%100} XP`;
 $('#growth-progress').max=nextStage?nextStage.xp-stage.xp:1;$('#growth-progress').value=nextStage?s.xp-stage.xp:1;
 $('#growth-steps').innerHTML=Popo.growthStages.map((step,i)=>`<span ${i===stageIndex?'aria-current="step"':''}>${i<stageIndex?'✓ ':''}${step.name}</span>`).join('');
$('#stats').innerHTML=[['배부름',s.hunger],['행복',s.happy],['기운',s.energy]].map(([n,v])=>`<div class="stat">${n} ${v}<progress max="100" value="${v}" aria-label="${n}"></progress></div>`).join('');$('#missions').innerHTML=[['feed','밥 한 번 챙겨주기'],['play','친구와 한 번 놀기'],['games','미니게임 한 판 끝내기']].map(([id,n])=>`<div class="mission"><div>${n}<small>${Math.min(1,s.daily[id])}/1 · 30 P</small></div><button data-claim="${id}" ${!s.daily[id]||s.daily.claimed.includes(id)?'disabled':''}>${s.daily.claimed.includes(id)?'완료':s.daily[id]?'보상 받기':'진행 중'}</button></div>`).join('');$('#accessory').textContent=Popo.items.find(x=>x.id===s.equipped.hat)?.icon||'';$('#furniture').textContent=s.equipped.furniture?'🛋️':'';$('#room').style.background=s.equipped.wall?'linear-gradient(#e8e1ef 0 66%,#ddcca8 66% 67%,#ede0c6 67%)':'';
if(tab==='shop')$('#content').innerHTML='<div class="items">'+Popo.items.map(i=>`<article class="item"><span class="icon">${i.icon}</span><h3>${i.name}</h3><p>${i.text}</p><button data-shop="${i.id}">${s.equipped[i.slot]===i.id?'해제하기':s.owned.includes(i.id)?'꾸미기':i.price+' P · 구매'}</button></article>`).join('')+'</div>';
if(tab==='book')$('#content').innerHTML='<p class="album-summary">함께 채운 성장 앨범 <strong>'+growthAlbum(s).reduce((sum,e)=>sum+e.unlocked,0)+' / 12</strong><small>돌봄과 놀이로 자란 모습을 여기에 간직해요.</small></p><div class="items album-grid">'+growthAlbum(s).map(entry=>albumCard(entry,s)).join('')+Popo.discoveries.map(d=>{const found=s.pets.includes(d.id),value=found?d.target:Math.min(d.target,s.stats[d.stat]);return `<article class="item discovery"><span class="icon">${found?d.icon:'?'}</span><h3>${found?d.name:'아직 만나지 못한 친구'}</h3><p>${d.hint}</p><small>${d.condition}</small><progress max="${d.target}" value="${value}" aria-label="${d.condition}"></progress><small>${value} / ${d.target}${d.unit} · ${found?'발견 완료':'만남을 기다리는 중'}</small>${found?'<p>도감에 함께 남긴 친구예요.<br>방에서 함께하기는 아직 준비 중이에요.</p>':''}</article>`}).join('')+'</div>';
if(tab==='records')$('#content').innerHTML=`<div class="records">지뢰찾기 클리어 <b>${s.stats.mines}회</b> · 테트리스 완료 <b>${s.stats.tetris}회</b> · 제거한 줄 <b>${s.stats.lines}줄</b><br>만난 친구 ${s.companions.length+s.pets.filter(id=>id!=='popo').length}명 · 모은 소품 ${s.owned.length}개<br>온라인 순위는 각 게임의 랭킹에서 확인하세요.</div>`;
}
let acting=false;
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b||acting)return;
 try{
  if(b.dataset.tab){tab=b.dataset.tab;document.querySelectorAll('[data-tab]').forEach(x=>x.setAttribute('aria-pressed',x===b));render();if(b.closest('.discovery-announcement'))$('#content').scrollIntoView({block:'start'});if(tab==='book'){const seen=Popo.read().pets;await Popo.markDiscoveriesSeen(seen);render()}return}
  if(acting)return;acting=true;
  let type,id;
  if(b.dataset.adopt){type='adopt';id=b.dataset.adopt}
  if(b.dataset.select){type='select';id=b.dataset.select}
  if(b.dataset.care){type='care';id=b.dataset.care}
  if(b.dataset.shop){type='shop';id=b.dataset.shop}
  if(b.dataset.claim){type='claim';id=b.dataset.claim}
  if(b.id==='pet')type='pet';
  if(!type)return;
  const {message:msg,trigger}=await Popo.actWithReaction(type,id);
  if(msg){toast(msg);render();PetReactions.refresh();if(trigger)PetReactions.show(trigger);await showGrowth()}
 }catch(error){toast(error.message||'저장할 수 없어요. 브라우저 저장 공간 설정을 확인해주세요.')}finally{acting=false}
});
let growthTimer;
async function showGrowth(){const event=await Popo.takeGrowth();if(!event||Popo.read().activePet!==event.petId)return false;
 const name=PetCatalog.get(event.petId).name,stage=Popo.growthStages[event.stage];
 $('#growth-announcement').textContent=name+'가 '+stage.name+' 모습으로 자랐어요!';
 $('#room').classList.add('growth-celebration');clearTimeout(growthTimer);growthTimer=setTimeout(()=>{$('#room').classList.remove('growth-celebration');$('#growth-announcement').textContent=''},6500);
 PetReactions.show('GROWN',{sound:false});return true;
}
let restoring=false;
async function onReturn(){if(restoring)return;restoring=true;render();PetReactions.refresh();try{
 const recovery=await Popo.flushResults();render();PetReactions.refresh();
 if(recovery.applied)toast('지난 놀이 기록과 보상을 이어서 반영했어요.');
 if(recovery.failed)toast('아직 반영하지 못한 놀이 기록이 있어요. 저장 공간을 확인해 주세요.');
 const trigger=await Popo.takeReaction();if(!(await showGrowth())&&trigger)PetReactions.show(trigger,{sound:false});
}catch{}finally{restoring=false}}
addEventListener('storage',e=>{render();PetReactions.refresh();if(e.key?.startsWith(Popo.storageKey+'-result-'))onReturn()});addEventListener('focus',onReturn);onReturn();

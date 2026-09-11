async function grantPetReward(detail){try{const reward=await Popo.result(detail);let el=document.querySelector('#pet-reward');if(!el){el=document.createElement('p');el.id='pet-reward';el.setAttribute('role','status');document.querySelector('main').append(el)}el.textContent=reward>0 ? `우리의 방에 ${reward} P를 보냈어요! 오늘의 목표도 확인해 주세요.` : '이번 판의 포인트 보상은 없지만, 놀이 기록과 오늘의 게임 목표에 반영했어요.'}catch(error){const el=document.createElement('p');el.setAttribute('role','status');el.textContent=error.rewardQueued?'놀이 기록을 보관했어요. 다음 접속 때 보상을 다시 반영할게요.':'놀이 기록을 보관하지 못했어요. 브라우저 저장 공간을 확인해 주세요.';document.querySelector('main').append(el)}}
addEventListener('mines-win',()=>grantPetReward({game:'mines',won:true,difficulty:document.querySelector('#difficulty').value}));addEventListener('pet-result',e=>grantPetReward(e.detail));


Popo.flushResults().catch(()=>{});

import('../services/pet-account.js').catch(()=>{
 const status=document.querySelector('#account-status');
 if(status)status.textContent='계정 연결을 불러오지 못했어요. 인터넷 연결을 확인한 뒤 새로고침해 주세요.';
});

(function(){
const panel=document.querySelector('#backup-panel'),status=document.querySelector('#backup-status'),input=document.querySelector('#backup-file'),preview=document.querySelector('#backup-preview');
let candidate=null,busy=false,selection=0;
function message(text){status.textContent=text}
function clear(){candidate=null;preview.hidden=true;input.value=''}
function download(text,suffix=''){const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`malang-village-${Popo.day()}${suffix}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
input.addEventListener('change',async()=>{const ticket=++selection,file=input.files[0];candidate=null;preview.hidden=true;if(!file)return;
 try{if(file.size>1000000)throw Error('1 MB 이하의 말랑마을 백업 파일을 선택해 주세요.');const text=await file.text();if(ticket!==selection)return;const parsed=Popo.prepareRestore(text);candidate={text,baseline:parsed.baseline};const s=parsed.state;
 document.querySelector('#backup-summary').textContent=`${new Date(parsed.createdAt).toLocaleString('ko-KR')} 저장 · ${PetCatalog.get(s.activePet).name} · ${s.points.toLocaleString()} P · ${s.xp} XP · 소품 ${s.owned.length}개`;
 preview.hidden=false;message('파일을 확인했어요. 아래 내용을 확인한 뒤 복원해 주세요.');
 }catch(error){message(error.message)}});
panel.addEventListener('click',async event=>{const button=event.target.closest('button');if(!button||busy)return;const action=button.dataset.backup;if(!action)return;
 if(action==='cancel'){selection++;clear();message('복원을 취소했어요.');return}
 busy=true;panel.querySelectorAll('button,input').forEach(el=>el.disabled=true);
 try{
  if(action==='export'){await Popo.flushResults();download(await Popo.exportBackup());message('백업 파일 다운로드를 요청했어요. 다운로드 폴더를 확인해 주세요.')}
  if(action==='previous'){download(Popo.previousBackup(),'-before-restore');message('교체 전 기록의 다운로드를 요청했어요.')}
  if(action==='restore'&&candidate){await Popo.restoreBackup(candidate.text,candidate.baseline);clear();render();PetReactions.refresh();message('백업 기록을 복원했어요. 교체 전 기록도 아래에서 받을 수 있어요.')}
 }catch(error){message(error.message)}finally{busy=false;panel.querySelectorAll('button,input').forEach(el=>el.disabled=false)}
});
})();

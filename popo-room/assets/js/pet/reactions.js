(function(g){
let current='NORMAL',until=0,audioContext,enabled=false,lastSound=0,lastPet='';
try{enabled=localStorage.getItem('popo-sound')==='on'}catch{}
function play(voice){if(!enabled||document.hidden||Date.now()-lastSound<1000)return;lastSound=Date.now();
 if(voice.audioSrc){const audio=new Audio(voice.audioSrc);audio.volume=.15;audio.play().catch(()=>{});return}
 try{audioContext ||= new (window.AudioContext||window.webkitAudioContext)();if(audioContext.state!=='running')return;const now=audioContext.currentTime;voice.notes.forEach((frequency,i)=>{const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),start=now+i*.17;oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,start);oscillator.frequency.exponentialRampToValueAtTime(frequency*.82,start+.14);gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.07,start+.025);gain.gain.exponentialRampToValueAtTime(.001,start+.15);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(start);oscillator.stop(start+.16)})}catch{}
}
function refresh(){const s=Popo.read();if(lastPet!==s.activePet){lastPet=s.activePet;current='NORMAL';until=0;g.PopoMotion?.express({animation:'idle'})}if(current==='LONELY'&&s.daily.play>0)current='NORMAL';const r=PetLanguage.resolve(current,s.activePet,s.affinity);document.querySelector('#pet-call').textContent=r.voice.text;document.querySelector('#pet-icons').textContent=r.bubbleIcon;const interpretation=document.querySelector('#interpretation');interpretation.textContent=r.interpretation?'('+r.interpretation+')':'';interpretation.hidden=!r.interpretation;document.querySelector('#affinity').textContent=['아직 알아가는 중','조금씩 이해하는 사이','마음이 통하는 사이','작은 신호도 아는 사이'][r.affinityLevel];document.querySelector('#pet').dataset.expression=r.facialExpression;return r}
function show(trigger,{sound=true}={}){current=trigger;until=Date.now()+8000;const r=refresh();g.PopoMotion?.express(r);if(sound)play(r.voice)}
const button=document.querySelector('#sound-toggle');function soundLabel(){button.textContent=enabled?'♫ 소리 켜짐':'♪ 소리 꺼짐';button.setAttribute('aria-pressed',String(enabled))}soundLabel();
button.addEventListener('click',async()=>{enabled=!enabled;try{localStorage.setItem('popo-sound',enabled?'on':'off')}catch{}soundLabel();if(enabled){try{audioContext ||= new (window.AudioContext||window.webkitAudioContext)();await audioContext.resume();play(refresh().voice)}catch{}}});
function ambient(){if(document.hidden||Date.now()<until)return;show(PetLanguage.ambient(Popo.read()),{sound:false})}
g.PetReactions={show,refresh};show(PetLanguage.ambient(Popo.read()),{sound:false});setInterval(ambient,12000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)ambient()});
})(globalThis);

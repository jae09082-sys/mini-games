/* Room motion is cosmetic. Never awards points or changes saved pet stats. */
(function(global){
  const bounds={minX:7,maxX:57,minY:43,maxY:64};
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  function destination(random=Math.random){return {x:bounds.minX+random()*(bounds.maxX-bounds.minX),y:bounds.minY+random()*(bounds.maxY-bounds.minY)}}
  function step(position,target,dt,speed=7){const dx=target.x-position.x,dy=target.y-position.y,distance=Math.hypot(dx,dy),travel=Math.min(distance,speed*dt);return {x:clamp(position.x+(distance?dx/distance*travel:0),bounds.minX,bounds.maxX),y:clamp(position.y+(distance?dy/distance*travel:0),bounds.minY,bounds.maxY),arrived:distance<=travel+.001}}
  if(typeof module!=='undefined'&&module.exports){module.exports={bounds,destination,step};return}
  const pet=document.querySelector('#pet'),room=document.querySelector('#room');if(!pet)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let position={x:35,y:48},target=null,state='idle',remaining=1.2,last=0,frame=0,arrival=null;
  function setState(next,seconds){state=next;remaining=seconds;pet.dataset.state=next;pet.querySelector('.pet-emote').textContent={happy:'♡',eating:'🍎',sleeping:'z Z'}[next]||''}
  function place(){pet.style.left=position.x+'%';pet.style.top=position.y+'%'}
  function tick(now){frame=0;const dt=last?Math.min(.05,(now-last)/1000):0;last=now;
    if(state==='walking'&&target){position=step(position,target,dt);if(position.arrived){target=null;if(arrival){const next=arrival;arrival=null;setState(next,4)}else setState('idle',1.5+Math.random()*2.5)}}
    else{remaining-=dt;if(remaining<=0){if(reduced.matches)setState('idle',3);else if(state!=='idle'){setState('idle',1.5)}else if(Math.random()<.16){if(global.PetReactions)global.PetReactions.show('REST',{sound:false});else setState('sleeping',4)}else{target=destination();pet.dataset.direction=target.x<position.x?'left':'right';setState('walking',0)}}}
    place();if(!document.hidden)frame=requestAnimationFrame(tick);
  }
  function resume(){last=0;room.classList.toggle('motion-paused',document.hidden);if(frame)cancelAnimationFrame(frame);frame=0;if(!document.hidden)frame=requestAnimationFrame(tick)}
  global.PopoMotion={express(reaction){target=null;arrival=null;const destinations={hungry:{x:10,y:59},curious:{x:18,y:50}};if(destinations[reaction.animation]&&!reduced.matches){target=destinations[reaction.animation];arrival=reaction.animation;pet.dataset.direction=target.x<position.x?'left':'right';setState('walking',0)}else setState(reaction.animation,5);},react(action){target=null;const reactions={feed:['eating',3.5],play:['happy',3],pet:['happy',2],sleep:['sleeping',8]};if(reactions[action])setState(...reactions[action]);},getState(){return {state,x:position.x,y:position.y}}};
  reduced.addEventListener('change',()=>{target=null;arrival=null;setState('idle',1.2)});
  document.addEventListener('visibilitychange',resume);global.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0});global.addEventListener('pageshow',resume);place();resume();
})(globalThis);

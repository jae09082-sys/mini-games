/* Pet identity, voice text/audio mapping, and reactions are independent content data. */
(function(g){
const voice=(text,notes)=>({text,audioSrc:null,notes});
const voices={
 popo:{normal:voice('멍!',[360]),happy:voice('멍멍!',[380,460]),excited:voice('멍멍멍!!',[380,460,540]),hungry:voice('낑…',[440,350]),sad:voice('낑낑…',[450,360]),surprised:voice('멍?!',[350,550]),sleepy:voice('끙…',[290,230]),angry:voice('으르렁!',[220,200])},
 mochi:{normal:voice('먀…',[480]),happy:voice('먀앙!',[520,680]),excited:voice('먀아앙!',[540,700,780]),hungry:voice('먀우…',[410,340]),sad:voice('먀우…',[400,320]),surprised:voice('먀?!',[480,740]),sleepy:voice('먀…',[330]),angry:voice('먀우!',[430,410])},
 tori:{normal:voice('삐!',[900]),happy:voice('삐리리~',[900,1100,1000]),excited:voice('삐리리리~',[900,1100,1200]),hungry:voice('삐이…',[790,630]),sad:voice('삐…',[730]),surprised:voice('삐?!',[850,1200]),sleepy:voice('삐…',[600]),angry:voice('삐삐!',[900,900])},
 lumi:{normal:voice('미우…',[500,430]),happy:voice('르릉~',[380,440]),excited:voice('르르릉~',[380,440,520]),hungry:voice('미우…',[420,350]),sad:voice('미우…',[420,350]),surprised:voice('미?!',[490,780]),sleepy:voice('르…',[300]),angry:voice('미?!',[490,600])}
};
const pets={popo:{petId:'popo',voiceSet:'popo',personality:'호기심',canSpeakHuman:false},mochi:{petId:'mochi',voiceSet:'mochi',personality:'차분함',canSpeakHuman:false},tori:{petId:'tori',voiceSet:'tori',personality:'몽상가',canSpeakHuman:false},lumi:{petId:'lumi',voiceSet:'lumi',personality:'신비로움',canSpeakHuman:false}};
const reaction=(emotion,voice,animation,facialExpression,bubbleIcon,interpretation)=>({emotion,voice,animation,facialExpression,bubbleIcon,interpretation});
const reactions={
 GROWN:reaction('EXCITED','excited','happy','happy','✨ 🌱 ♥',['무척 기쁜 것 같다.','함께 자란 시간을 기뻐하는 것 같다.','당신의 돌봄 속에서 한 뼘 자란 게 뿌듯한 모양이다.']),
 NORMAL:reaction('CALM','normal','idle','neutral','♪',['주변이 궁금한 것 같다.','곁에서 편안함을 느끼는 것 같다.','익숙한 방에서 당신의 움직임을 살피는 것 같다.']),
 PETTED:reaction('HAPPY','happy','happy','happy','♥',['손길을 좋아하는 것 같다.','당신과 같이 있는 게 좋은 것 같다.','익숙한 손길에 안심하고 더 가까이 있고 싶은 모양이다.']),
 FED:reaction('HAPPY','happy','eating','happy','🍎 ♥',['먹이가 마음에 드는 것 같다.','배를 채우고 기분이 좋아진 것 같다.','먹이를 챙겨준 손길이 반가운 모양이다.']),
 PLAYED:reaction('EXCITED','excited','happy','happy','♥ ♪',['놀이가 즐거운 것 같다.','당신과 함께 노는 시간이 좋은 것 같다.','함께 놀고 나니 한결 신이 난 모양이다.']),
 REST:reaction('SLEEPY','sleepy','sleeping','sleepy','☾ zZ',['졸린 것 같다.','안심하고 쉬고 싶은 것 같다.','익숙한 공간에서 잠시 눈을 붙이려는 모양이다.']),
 HUNGRY:reaction('HUNGRY','hungry','hungry','sad','🍖…',['배가 고픈 것 같다.','밥그릇 쪽을 자꾸 살피는 것 같다.','배가 많이 고파서 먹이를 기다리는 모양이다.']),
 LONELY:reaction('SAD','sad','sad','sad','♥ …',['조금 서운한 것 같다.','함께 놀고 싶은 것 같다.','조금 서운한 모양이다. 오늘 아직 같이 놀지 않았다.']),
 NEW_FURNITURE:reaction('CURIOUS','surprised','curious','surprised','🛋️ ✨!?',['새로운 것이 궁금한 것 같다.','새 소품을 자세히 살피고 싶은 것 같다.','익숙한 방에 생긴 변화를 조심스럽게 살피는 모양이다.']),
 GAME_WIN:reaction('HAPPY','happy','happy','happy','🏅 ♥',['기분이 좋은 것 같다.','함께한 놀이가 즐거웠던 것 같다.','놀이를 마치고 돌아온 당신이 반가운 모양이다.']),
 MINIGAME_HIGH_SCORE:reaction('EXCITED','excited','happy','happy','🏆✨',['무척 신이 난 것 같다.','좋은 기록에 함께 들뜬 것 같다.','새로운 최고 기록을 세운 순간을 함께 기뻐하는 모양이다.'])
};
function affinityLevel(points){return points>=120?3:points>=60?2:points>=20?1:0}
function resolve(trigger,petId='popo',affinity=0){const pet=pets[petId]||pets.popo,r=reactions[trigger]||reactions.NORMAL,level=affinityLevel(affinity);return {...r,trigger,petId:pet.petId,voice:voices[pet.voiceSet][r.voice],affinityLevel:level,interpretation:level?r.interpretation[level-1]:''}}
function ambient(s){return s.hunger<30?'HUNGRY':s.energy<25?'REST':s.happy<50&&s.daily.play===0?'LONELY':'NORMAL'}
g.PetLanguage={pets,voices,reactions,resolve,affinityLevel,ambient};
})(globalThis);


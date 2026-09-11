/* Presentation data only; game and economy rules live in store.js. */
(function(g){
const pets={
 popo:{name:'포포',personality:'순둥한 호기심쟁이',description:'하얀 털과 긴 처진 귀, 분홍 볼의 포포',image:'assets/images/popo.png',theme:'햇살이 머무는 포근한 오후',window:'☁',picture:'✿'},
 mochi:{name:'모찌',personality:'조용하고 다정한 친구',description:'크림 털과 갈색 무늬의 둥근 고양이 모찌',image:'assets/images/mochi.png',theme:'살구빛이 감도는 아늑한 시간',window:'☀',picture:'♡'},
 tori:{name:'토리',personality:'새로운 꿈을 꾸는 몽상가',description:'머리에 초록 새싹이 난 노란 새 토리',image:'assets/images/tori.png',theme:'새싹처럼 자라나는 작은 꿈',window:'☁',picture:'🌱'},
 lumi:{name:'루미',personality:'별빛을 품은 신비로운 친구',description:'긴 귀와 별 무늬를 가진 짙은 보라색 루미',image:'assets/images/lumi.png',theme:'별빛이 내려앉은 고요한 밤',window:'☾',picture:'✦'}
};
const growthAppearances={"popo":{"baby":{"image":"assets/images/growth/popo-baby.png","custom":true,"faceX":-1.861,"faceY":14.551,"faceScale":1.028},"juvenile":{"image":"assets/images/growth/popo-juvenile.png","custom":true,"faceX":-2.751,"faceY":4.308,"faceScale":1.043},"grown":{"image":"assets/images/growth/popo-grown.png","custom":true,"faceX":2.33,"faceY":8.441,"faceScale":0.928}},"mochi":{"baby":{"image":"assets/images/growth/mochi-baby.png","custom":true,"faceX":-8.895,"faceY":17.157,"faceScale":1.043},"juvenile":{"image":"assets/images/growth/mochi-juvenile.png","custom":true,"faceX":-7.505,"faceY":3.805,"faceScale":1.006},"grown":{"image":"assets/images/growth/mochi-grown.png","custom":true,"faceX":-6.019,"faceY":-3.321,"faceScale":0.971}},"tori":{"baby":{"image":"assets/images/growth/tori-baby.png","custom":true,"faceX":-6.575,"faceY":7.705,"faceScale":1.144},"juvenile":{"image":"assets/images/growth/tori-juvenile.png","custom":true,"faceX":-2.551,"faceY":3.32,"faceScale":1.06},"grown":{"image":"assets/images/growth/tori-grown.png","custom":true,"faceX":6.353,"faceY":4.445,"faceScale":0.869}},"lumi":{"baby":{"image":"assets/images/growth/lumi-baby.png","custom":true,"faceX":-14.81,"faceY":17.908,"faceScale":1.15},"juvenile":{"image":"assets/images/growth/lumi-juvenile.png","custom":true,"faceX":-11.846,"faceY":7.609,"faceScale":1.012},"grown":{"image":"assets/images/growth/lumi-grown.png","custom":true,"faceX":-6.242,"faceY":8.795,"faceScale":0.907}}};
for(const id of Object.keys(pets))pets[id].appearances=growthAppearances[id];
function get(id){return pets[id]||pets.popo}
function appearance(id,stage){const pet=get(id);return pet.appearances?.[stage]||{image:pet.image,custom:false}}
g.PetCatalog={pets,get,appearance};
})(globalThis);

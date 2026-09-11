(function(g){
 let guest;
 try{guest=localStorage.getItem('malang-guest-name')}catch{}
 if(!/^여행자 \d{4}$/.test(guest||'')){
  guest='여행자 '+String(1000+Math.floor(Math.random()*9000));
  try{localStorage.setItem('malang-guest-name',guest)}catch{}
 }
 g.MalangName=()=>g.MalangPlayerName||guest;
})(globalThis);

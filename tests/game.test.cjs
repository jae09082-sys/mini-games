const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function harness(file){
 const elements=new Map(),timers=[],events={},strokes=[];
 const ctx={fillRect(){},setLineDash(x){strokes.push(x)},strokeRect(){strokes.push('ghost')}};
 function element(){return {value:'easy',children:[],dataset:{},style:{setProperty(){}},classList:{add(){}},setAttribute(){},setPointerCapture(){},getContext(){return ctx},append(...x){this.children.push(...x)},appendChild(x){this.children.push(x)},replaceChildren(...x){this.children=x},addEventListener(k,f){this[k]=f},querySelector(){return element()},querySelectorAll(){return []}}}
 const buttons=['left','right','down','rotate','drop'].map(k=>Object.assign(element(),{dataset:{key:k}}));
 const document={querySelector(k){if(!elements.has(k))elements.set(k,element());return elements.get(k)},querySelectorAll(){return buttons},createElement:element};
 const sandbox={document,console,performance:{now:()=>1000},Date,Math,crypto:require('node:crypto').webcrypto,ready:Promise.resolve('u1'),setupName(){},ranking(){return {save(){}}},playerName:()=> 'test',requestAnimationFrame(){},setTimeout(f){timers.push(f);return timers.length},setInterval(f){timers.push(f);return timers.length},clearTimeout(){},clearInterval(){},addEventListener(k,f){events[k]=f},dispatchEvent(){},CustomEvent:class{},ref(){},update:async()=>{},db:{}};
 const context=vm.createContext(sandbox);vm.runInContext(fs.readFileSync(file,'utf8').replace(/^import .*;\r?\n/gm,''),context);
 return {run:s=>vm.runInContext(s,context),buttons,timers,strokes,elements};
}
test('Tetris bag, collision, next piece, ghost, repeat and attacks',()=>{
 const h=harness('tetris.js');h.run('reset()');assert(h.strokes.includes('ghost'));
 assert.equal(h.run('new Set((bag=[],Array.from({length:7},()=>piece().m.flat().find(Boolean)))).size'),7);
 h.run('active={m:[[4,4],[4,4]],x:3,y:0}');
 h.buttons[1].onpointerdown({preventDefault(){},pointerId:1});assert.equal(h.run('active.x'),4);
 h.timers.at(-1)();h.timers.at(-1)();assert.equal(h.run('active.x'),5);
 h.run('active={m:[[1]],x:0,y:19};board=blank();board[19]=Array(10).fill(2);board[19][0]=0;score=0;lock()');assert.equal(h.run('score'),100);
 h.run('board=blank();active={m:[[1],[1]],x:0,y:18};board[18]=Array(10).fill(2);board[19]=Array(10).fill(2);board[18][0]=board[19][0]=0;sent=0;pending=0;lock()');assert.equal(h.run('sent'),1);
});
test('Mines long press flags without opening; first click safe',()=>{
 const h=harness('game.js');const cell=h.elements.get('#board').children[0];
 cell.pointerdown({pointerType:'touch',pointerId:1});h.timers.at(-1)();cell.click();assert.equal(h.run('cells[0].flag'),true);assert.equal(h.run('cells[0].open'),false);
 h.run('toggleFlag(0);openCell(0)');assert.equal(h.run('cells[0].mine'),false);assert.equal(h.run('cells.filter(c=>c.mine).length'),10);
});

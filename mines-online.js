import {setupName} from './firebase-client.js';
import {ranking} from './ranking.js';
setupName();
const ranks=ranking(()=> 'mines-'+document.querySelector('#difficulty').value);
document.querySelector('#difficulty').addEventListener('change',()=>ranks.load());
addEventListener('mines-win',e=>ranks.save(e.detail));

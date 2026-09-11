
import {ranking} from '../services/ranking.js';

const ranks=ranking(()=> 'mines-'+document.querySelector('#difficulty').value);
document.querySelector('#difficulty').addEventListener('change',()=>ranks.load());
addEventListener('mines-win',e=>ranks.save(e.detail));


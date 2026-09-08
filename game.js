const levels = { easy: [9, 10], medium: [12, 22], hard: [16, 40] };
const boardEl = document.querySelector('#board');
const mineCountEl = document.querySelector('#mine-count');
const timerEl = document.querySelector('#timer');
const messageEl = document.querySelector('#message');
const faceEl = document.querySelector('#face');
let cells, size, mines, state, seconds, interval, started;

function startGame() {
  [size, mines] = levels[document.querySelector('#difficulty').value];
  clearInterval(interval); seconds = 0; started = false;
  state = { over: false, flags: 0, opened: 0 };
  cells = Array.from({ length: size * size }, (_, index) => ({ index, mine: false, open: false, flag: false, around: 0 }));
  boardEl.style.setProperty('--cols', size); boardEl.innerHTML = '';
  cells.forEach(cell => { const button = document.createElement('button'); button.className = 'cell'; button.setAttribute('role', 'gridcell'); button.setAttribute('aria-label', `행 ${Math.floor(cell.index / size) + 1}, 열 ${cell.index % size + 1}`); button.addEventListener('click', () => openCell(cell.index)); button.addEventListener('contextmenu', e => { e.preventDefault(); toggleFlag(cell.index); }); let hold; button.addEventListener('touchstart', () => hold = setTimeout(() => toggleFlag(cell.index), 550), { passive: true }); button.addEventListener('touchend', () => clearTimeout(hold)); boardEl.append(button); });
  faceEl.textContent = '🙂'; messageEl.textContent = '첫 칸은 항상 안전합니다.'; messageEl.className = 'message'; render();
}
function neighbors(i) { const row = Math.floor(i / size), col = i % size, result = []; for (let r = row - 1; r <= row + 1; r++) for (let c = col - 1; c <= col + 1; c++) if (r >= 0 && r < size && c >= 0 && c < size && (r !== row || c !== col)) result.push(r * size + c); return result; }
function plantMines(safe) { const excluded = new Set([safe, ...neighbors(safe)]); let placed = 0; while (placed < mines) { const i = Math.floor(Math.random() * cells.length); if (!cells[i].mine && !excluded.has(i)) { cells[i].mine = true; placed++; } } cells.forEach(cell => cell.around = neighbors(cell.index).filter(i => cells[i].mine).length); }
function begin(i) { if (!started) { plantMines(i); started = true; interval = setInterval(() => { seconds++; render(); }, 1000); } }
function openCell(i) { if (state.over || cells[i].flag || cells[i].open) return; begin(i); const cell = cells[i]; cell.open = true; state.opened++; if (cell.mine) return lose(i); if (cell.around === 0) neighbors(i).forEach(openCell); if (state.opened === cells.length - mines) win(); render(); }
function toggleFlag(i) { const cell = cells[i]; if (state.over || cell.open) return; cell.flag = !cell.flag; state.flags += cell.flag ? 1 : -1; render(); }
function lose(hitIndex) { state.over = true; state.hitIndex = hitIndex; clearInterval(interval); cells.filter(c => c.mine).forEach(c => c.open = true); faceEl.textContent = '😵'; messageEl.textContent = '앗, 지뢰를 밟았어요. 다시 도전해 보세요!'; messageEl.className = 'message lost'; render(); }
function win() { state.over = true; clearInterval(interval); faceEl.textContent = '😎'; messageEl.textContent = '성공! 모든 안전한 칸을 열었어요.'; messageEl.className = 'message won'; }
function render() { mineCountEl.textContent = String(Math.max(0, mines - state.flags)).padStart(3, '0'); timerEl.textContent = String(seconds).padStart(3, '0'); cells.forEach((cell, i) => { const el = boardEl.children[i]; const exploded = state.hitIndex === i; el.className = `cell ${cell.open ? 'open' : ''} ${cell.flag ? 'flag' : ''} ${cell.open && cell.mine ? 'mine' : ''} ${exploded ? 'exploded' : ''}`; el.textContent = cell.flag ? '🚩' : cell.open && cell.mine ? exploded ? '💥' : '💣' : cell.open && cell.around ? cell.around : ''; if (cell.open && cell.around) el.classList.add(`n${cell.around}`); }); }
document.querySelector('#new-game').addEventListener('click', startGame); faceEl.addEventListener('click', startGame); document.querySelector('#difficulty').addEventListener('change', startGame); startGame();

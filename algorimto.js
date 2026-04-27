// ==========================================
//  ALGORITMO BLINDADO DE GENERACIÓN
// ==========================================

function generateBoardDataPure(words, inputSize) {
            const size = parseInt(inputSize, 10);
            if (isNaN(size) || size < 1) return { grid: [], placedWords: [] };
            
            let bestGrid = null; 
            let bestPlacedWords = []; 
            const dirs = [ [0,1], [1,0], [1,1], [-1,1] ]; 
            const sortedWords = [...words].sort((a, b) => String(b).length - String(a).length);
            
            for (let attempt = 0; attempt < 5; attempt++) {
                const grid = Array(size).fill(null).map(() => Array(size).fill('')); 
                const placedWords = [];
                
                sortedWords.forEach(word => {
                    if (!word) return;
                    const normWord = String(word).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    if (normWord.length === 0 || normWord.length > size) return; 
                    
                    let placed = false; 
                    let attempts = 0;
                    
                    // Colocación aleatoria
                    while (!placed && attempts < 200) {
                        const dir = dirs[Math.floor(Math.random() * dirs.length)]; 
                        const startX = Math.floor(Math.random() * size); 
                        const startY = Math.floor(Math.random() * size);
                        
                        let canPlace = true; 
                        let currX = startX, currY = startY;
                        
                        for (let i = 0; i < normWord.length; i++) {
                            // ESCUDO DE SEGURIDAD ABSOLUTA PARA EVITAR EL "Cannot read properties"
                            if (currX < 0 || currX >= size || currY < 0 || currY >= size || !grid || !grid[currY] || typeof grid[currY][currX] === 'undefined' || (grid[currY][currX] !== '' && grid[currY][currX] !== normWord[i])) { 
                                canPlace = false; 
                                break; 
                            }
                            currX += dir[1]; 
                            currY += dir[0];
                        }
                        
                        if (canPlace) {
                            let cx = startX, cy = startY; const coords = [];
                            for (let i = 0; i < normWord.length; i++) { 
                                grid[cy][cx] = normWord[i]; 
                                coords.push(`${cy}-${cx}`); 
                                cx += dir[1]; cy += dir[0]; 
                            }
                            placedWords.push({ word: word, normWord: normWord, coords }); 
                            placed = true;
                        }
                        attempts++;
                    }
                    
                    // Fallback (Fuerza bruta) si falla la aleatoria
                    if (!placed) {
                        for (let r = 0; r < size && !placed; r++) {
                            for (let c = 0; c < size && !placed; c++) {
                                for (let d = 0; d < dirs.length && !placed; d++) {
                                    const dir = dirs[d]; 
                                    let canPlace = true; 
                                    let currX = c, currY = r;
                                    
                                    for (let i = 0; i < normWord.length; i++) {
                                        // ESCUDO DE SEGURIDAD
                                        if (currX < 0 || currX >= size || currY < 0 || currY >= size || !grid || !grid[currY] || typeof grid[currY][currX] === 'undefined' || (grid[currY][currX] !== '' && grid[currY][currX] !== normWord[i])) { 
                                            canPlace = false; 
                                            break; 
                                        }
                                        currX += dir[1]; 
                                        currY += dir[0];
                                    }
                                    
                                    if (canPlace) {
                                        let cx = c, cy = r; const coords = [];
                                        for (let i = 0; i < normWord.length; i++) { 
                                            grid[cy][cx] = normWord[i]; 
                                            coords.push(`${cy}-${cx}`); 
                                            cx += dir[1]; cy += dir[0]; 
                                        }
                                        placedWords.push({ word: word, normWord: normWord, coords }); 
                                        placed = true;
                                    }
                                }
                            }
                        }
                    }
                });
                
                const possibleWordsCount = sortedWords.filter(w => String(w).normalize("NFD").replace(/[\u0300-\u036f]/g, "").length <= size && String(w).length > 0).length;
                if (placedWords.length === possibleWordsCount) { 
                    bestGrid = grid; 
                    bestPlacedWords = placedWords; 
                    break; 
                } else if (placedWords.length > bestPlacedWords.length) { 
                    bestGrid = grid; 
                    bestPlacedWords = placedWords; 
                }
            }
            
            // Failsafe: Si a pesar de los 5 intentos bestGrid quedó nulo, lo forzamos a existir vacío
            if (!bestGrid) {
                bestGrid = Array(size).fill(null).map(() => Array(size).fill(''));
            }

            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            for (let i = 0; i < size; i++) { 
                for (let j = 0; j < size; j++) { 
                    if (bestGrid[i][j] === '') bestGrid[i][j] = alphabet[Math.floor(Math.random() * alphabet.length)]; 
                } 
            }
            return { grid: bestGrid, placedWords: bestPlacedWords };
        }

        function updateTimerUI() {
            const el = document.getElementById('game-timer-display'); if (!el || State.endTime) return;
            const secs = Math.floor((Date.now() - State.startTime) / 1000); el.innerText = `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;
        }

        function renderGameUI() {
            const p = State.currentPuzzle; const size = parseInt(p.size, 10);
            const actualPlacedWords = State.gridData.placedWords.map(pw => pw.word);
            const isComplete = State.foundWords.length === actualPlacedWords.length && actualPlacedWords.length > 0;

            let html = `<div class="text-center mb-6 border-b pb-4"><h2 class="text-2xl sm:text-3xl font-black uppercase text-slate-800">${p.title}</h2><p class="text-slate-500">${p.subtitle}</p><div class="mt-4 flex flex-wrap justify-center gap-3 text-sm font-bold"><span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Puntos: ${State.score}</span><span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">${State.foundWords.length}/${actualPlacedWords.length} Palabras</span><span class="bg-orange-100 text-orange-800 px-3 py-1 rounded-full flex items-center gap-1"><i data-lucide="clock" class="w-4 h-4"></i> <span id="game-timer-display">0:00</span></span></div></div>`;

            if (isComplete && !State.showSolution) {
                if (!State.endTime) { State.endTime = Date.now(); clearInterval(State.timerInterval); }
                if (!State.confettiFired) {
                    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } }); State.confettiFired = true;
                    const timeSeconds = Math.floor((State.endTime - State.startTime) / 1000);
                    const timeStr = `${Math.floor(timeSeconds / 60)}:${(timeSeconds % 60).toString().padStart(2, '0')} min`;
                    apiCall('save_score', { puzzleId: p.id, puzzleTitle: p.title, student: State.studentName, score: State.score, timeStr: timeStr, reloads: State.reloads, hints: State.solutionUses, legacyUrl: p.id === 'legacy' ? p._originalUrl : null }).then(res => { if(res.status === 'success') State.reportId = res.report_id; });
                    if(typeof gtag === 'function') gtag('event', 'puzzle_completed', { puzzle_id: p.id, final_score: State.score });
                }
                html += `<div class="bg-green-100 border border-green-300 p-6 rounded-2xl text-center mb-6 shadow-sm animate-pulse"><h3 class="text-xl font-bold text-green-800 mb-2 flex items-center justify-center gap-2"><i data-lucide="trophy"></i> ¡Reto Completado!</h3><p class="text-green-700 mb-4">Puntuación final: <b>${State.score} pts</b></p><button onclick="showMyReport()" class="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 mx-auto w-full sm:w-auto"><i data-lucide="award"></i> Ver Reporte y Compartir</button></div>`;
            }

            html += `<div class="flex flex-col lg:flex-row gap-8 items-start"><div class="w-full flex-1 flex justify-center overflow-hidden"><div id="game-grid" class="grid gap-[1px] bg-slate-300 border border-slate-300 rounded shadow-inner" style="grid-template-columns: repeat(${size}, minmax(0, 1fr))">`;
            
            const foundCoords = new Set(); State.gridData.placedWords.forEach(pw => { if (State.foundWords.includes(pw.word) || State.showSolution) pw.coords.forEach(c => foundCoords.add(c)); });
            const selectedCells = getSelectedCells();

            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    const coord = `${r}-${c}`; const letter = State.gridData.grid[r][c];
                    let classes = "grid-cell w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-lg cursor-crosshair ";
                    if (selectedCells.includes(coord)) classes += "bg-blue-500 text-white shadow-md transform scale-110 rounded-sm z-10"; else if (foundCoords.has(coord)) classes += State.showSolution ? "bg-red-100 text-red-900" : "bg-green-200 text-green-900 rounded-sm"; else classes += "bg-white text-slate-700";
                    html += `<div class="${classes}" data-r="${r}" data-c="${c}" onmousedown="window.handleInteractionStart(${r}, ${c})" onmouseenter="window.handleInteractionMove(${r}, ${c})" ontouchstart="window.handleTouchStart(event, ${r}, ${c})" ontouchmove="window.handleTouchMove(event)">${letter}</div>`;
                }
            }
            html += `</div></div><div class="w-full lg:w-64 flex flex-col gap-4"><div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><h3 class="font-bold border-b pb-2 mb-3">Palabras</h3><ul class="grid grid-cols-2 lg:grid-cols-1 gap-2">`;
            actualPlacedWords.forEach(w => { const found = State.foundWords.includes(w) || State.showSolution; html += `<li class="text-sm font-mono flex items-center gap-2 ${found ? 'text-slate-400 line-through' : 'text-slate-700 font-bold'}"><span class="w-2 h-2 rounded-full ${found ? 'bg-green-500' : 'bg-slate-300'}"></span> ${w}</li>`; });
            html += `</ul></div><button onclick="regenerateBoard()" class="w-full bg-white border-2 border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 flex justify-center items-center gap-2"><i data-lucide="refresh-cw"></i> Restaurar / Refrescar</button><button onclick="toggleSolution()" class="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 flex justify-center items-center gap-2"><i data-lucide="eye"></i> ${State.showSolution ? 'Ocultar Solución' : 'Mostrar Solución'}</button></div></div>`;
            document.getElementById('view-play').innerHTML = html; lucide.createIcons(); if(!isComplete) updateTimerUI();
        }
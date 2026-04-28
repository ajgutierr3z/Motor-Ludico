// --- SISTEMA DE MOTOR DE CRUCIGRAMAS V2 (AMERICAN STYLE ESTRICTO) ---
        function generateLayout(wordsList) {
            let words = [...wordsList].sort(() => Math.random() - 0.5);
            let layout = [];
            const gridMax = 20; 
            
            let occupancy = Array(gridMax).fill().map(() => Array(gridMax).fill(''));

            words.forEach((wObj, index) => {
                const word = wObj.word.toUpperCase();
                let placed = false;

                if (index === 0) {
                    const r = Math.floor(gridMax/2);
                    const c = Math.floor((gridMax - word.length)/2);
                    placeWord(word, r, c, 'across', wObj.clue, index+1);
                    placed = true;
                } else {
                    for (let i = 0; i < layout.length && !placed; i++) {
                        const existing = layout[i];
                        for (let j = 0; j < existing.word.length && !placed; j++) {
                            const charExisting = existing.word[j];

                            for(let k = 0; k < word.length; k++) {
                                if (removeAccents(word[k]) === removeAccents(charExisting)) {
                                    const charIndex = k;
                                    const rE = existing.dir === 'across' ? existing.r : existing.r + j;
                                    const cE = existing.dir === 'across' ? existing.c + j : existing.c;
                                    
                                    const newDir = existing.dir === 'across' ? 'down' : 'across';
                                    const nR = newDir === 'across' ? rE : rE - charIndex;
                                    const nC = newDir === 'across' ? cE - charIndex : cE;

                                    if (isValidPlacement(word, nR, nC, newDir)) {
                                        placeWord(word, nR, nC, newDir, wObj.clue, index+1);
                                        placed = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                
                if(!placed) {
                     for(let tr=0; tr<gridMax && !placed; tr++){
                         for(let tc=0; tc<gridMax && !placed; tc++){
                             if(isValidPlacement(word, tr, tc, 'across')){
                                 placeWord(word, tr, tc, 'across', wObj.clue, index+1);
                                 placed = true;
                             }
                         }
                     }
                }
            });

            function isValidPlacement(word, r, c, dir) {
                if(r < 0 || c < 0) return false;
                if(dir === 'across' && c + word.length > gridMax) return false;
                if(dir === 'down' && r + word.length > gridMax) return false;

                let intersections = 0;
                for(let i=0; i<word.length; i++){
                    const cr = dir === 'across' ? r : r+i;
                    const cc = dir === 'across' ? c+i : c;
                    
                    if(occupancy[cr][cc] !== '' && removeAccents(occupancy[cr][cc]) !== removeAccents(word[i])) return false;
                    if(occupancy[cr][cc] !== '' && removeAccents(occupancy[cr][cc]) === removeAccents(word[i])) intersections++;
                    
                    if(occupancy[cr][cc] === '') {
                        if(dir === 'across') {
                            if(cr>0 && occupancy[cr-1][cc] !== '') return false;
                            if(cr<gridMax-1 && occupancy[cr+1][cc] !== '') return false;
                        } else {
                            if(cc>0 && occupancy[cr][cc-1] !== '') return false;
                            if(cc<gridMax-1 && occupancy[cr][cc+1] !== '') return false;
                        }
                    }
                }
                if(layout.length > 0 && intersections !== 1) return false;
                
                if(dir === 'across') {
                    if(c > 0 && occupancy[r][c-1] !== '') return false;
                    if(c + word.length < gridMax && occupancy[r][c+word.length] !== '') return false;
                } else {
                    if(r > 0 && occupancy[r-1][c] !== '') return false;
                    if(r + word.length < gridMax && occupancy[r+word.length][c] !== '') return false;
                }
                
                return true;
            }

            function placeWord(word, r, c, dir, clue, num) {
                layout.push({word, r, c, dir, clue, num});
                for(let i=0; i<word.length; i++){
                    const cr = dir === 'across' ? r : r+i;
                    const cc = dir === 'across' ? c+i : c;
                    if (occupancy[cr][cc] === '') {
                        occupancy[cr][cc] = word[i];
                    }
                }
            }

            let minR = gridMax, maxR = 0, minC = gridMax, maxC = 0;
            occupancy.forEach((row, r) => {
                row.forEach((cell, c) => {
                    if(cell !== ''){
                        if(r < minR) minR = r;
                        if(r > maxR) maxR = r;
                        if(c < minC) minC = c;
                        if(c > maxC) maxC = c;
                    }
                });
            });

            layout.forEach(l => {
                l.r -= minR;
                l.c -= minC;
            });

            return {
                layout,
                rows: maxR - minR + 1,
                cols: maxC - minC + 1
            };
        }

        // --- SISTEMA RENDERIZADO DEL EDITOR ---
        function openEditor() {
            document.getElementById('edit-title').value = '';
            document.getElementById('edit-subtitle').value = '';
            document.getElementById('editor-words-list').innerHTML = '';
            addEditorWordRow();
            addEditorWordRow();
            addEditorWordRow();
            navigate('editor');
        }
(function() {
    // 确保容器存在
    const container = document.getElementById('content');
    if (!container) return;
    
    // --- 新增：强制加载 CSS 样式 ---
    // 检查是否已经加载过，避免重复加载
    const  cssPath = 'CSS/game_2048.css';

    if (!document.querySelector(`link[href="${cssPath}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssPath; // 确保这个路径和你的文件实际位置一致
        document.head.appendChild(link);
    }
    // ----------------------------


    // 游戏状态
    let grid = [];
    let score = 0;
    let highScore = localStorage.getItem('2048_highScore') || 0;
    const size = 4;
    
    // 用于计算定位的常量 (需与CSS中的定义保持一致)
    const CSS_GRID_PADDING = 10;
    const CSS_CELL_SIZE = 85;
    const CSS_GRID_GAP = 12;
    // 计算每个单元格的步进距离 (方块大小 + 间距)
    const STEP_SIZE = CSS_CELL_SIZE + CSS_GRID_GAP;

    // --- 初始化 UI ---
    function initHTML() {
        container.innerHTML = `
            <div class="game-wrapper">
                <div class="game-container">
                    <div class="game-header">
                        <h1 class="game-title">2048</h1>
                        <div class="scores-wrapper">
                            <div class="score-box">
                                <div class="score-label">SCORE</div>
                                <span id="current-score">0</span>
                            </div>
                            <div class="score-box">
                                <div class="score-label">BEST</div>
                                <span id="best-score">${highScore}</span>
                            </div>
                        </div>
                    </div>

                    <div class="grid-container" id="grid-container">
                        ${Array(16).fill('<div class="grid-cell"></div>').join('')}
                        <div id="tile-container"></div>
                    </div>

                    <div id="game-overlay" class="game-overlay">
                        <h2 class="overlay-title">READY?</h2>
                        <button class="game-btn" id="btn-start">开始挑战</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-start').addEventListener('click', startGame);
    }

    // --- 游戏核心控制 ---
    function startGame() {
        document.getElementById('game-overlay').style.display = 'none';
        score = 0;
        updateScore(0);
        grid = Array(size).fill(null).map(() => Array(size).fill(0));
        document.getElementById('tile-container').innerHTML = '';
        
        addNewTile();
        addNewTile();
        renderTiles();

        document.removeEventListener('keydown', handleInput);
        document.addEventListener('keydown', handleInput);
    }

    function addNewTile() {
        let emptyCells = [];
        for (let r = 0; r < size; r++) 
            for (let c = 0; c < size; c++) 
                if (grid[r][c] === 0) emptyCells.push({r, c});
        
        if (emptyCells.length > 0) {
            let {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            grid[r][c] = Math.random() > 0.9 ? 4 : 2;
        }
    }

    function handleInput(e) {
        let moved = false;
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }

        switch(e.key) {
            case 'ArrowUp': moved = move(0, -1); break;
            case 'ArrowDown': moved = move(0, 1); break;
            case 'ArrowLeft': moved = move(-1, 0); break;
            case 'ArrowRight': moved = move(1, 0); break;
        }

        if (moved) {
            setTimeout(() => {
                addNewTile();
                renderTiles();
                if (checkGameOver()) showGameOver();
            }, 150);
        }
    }

    function move(dx, dy) {
        let moved = false;
        let merged = Array(size).fill(null).map(() => Array(size).fill(false));

        let rStart = dy === 1 ? size - 1 : 0;
        let cStart = dx === 1 ? size - 1 : 0;
        let rStep = dy === 1 ? -1 : 1;
        let cStep = dx === 1 ? -1 : 1;

        for (let r = rStart; r >= 0 && r < size; r += rStep) {
            for (let c = cStart; c >= 0 && c < size; c += cStep) {
                if (grid[r][c] === 0) continue;
                let val = grid[r][c];
                let nr = r, nc = c;
                while (true) {
                    let nextR = nr + dy; let nextC = nc + dx;
                    if (nextR < 0 || nextR >= size || nextC < 0 || nextC >= size) break;
                    let nextVal = grid[nextR][nextC];
                    if (nextVal === 0) { nr = nextR; nc = nextC; }
                    else if (nextVal === val && !merged[nextR][nextC]) {
                        nr = nextR; nc = nextC;
                        grid[r][c] = 0; grid[nr][nc] *= 2;
                        score += grid[nr][nc]; updateScore(score);
                        merged[nr][nc] = true; moved = true; val = 0; break; 
                    } else { break; }
                }
                if (val !== 0 && (nr !== r || nc !== c)) {
                    grid[nr][nc] = val; grid[r][c] = 0; moved = true;
                }
            }
        }
        if (moved) renderTiles();
        return moved;
    }

    // --- 渲染逻辑 (关键修改: 定位计算) ---
    function renderTiles() {
        const tContainer = document.getElementById('tile-container');
        tContainer.innerHTML = '';
        
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                let val = grid[r][c];
                if (val > 0) {
                    let tile = document.createElement('div');
                    tile.className = `tile tile-${val}`;
                    tile.innerText = val;
                    
                    // --- 核心修改：精确计算 Top 和 Left 值 ---
                    // 基础偏移(Padding) + 索引 * (方块大小 + 间距)
                    const topPosition = CSS_GRID_PADDING + r * STEP_SIZE;
                    const leftPosition = CSS_GRID_PADDING + c * STEP_SIZE;
                    
                    tile.style.top = topPosition + 'px';
                    tile.style.left = leftPosition + 'px';
                    
                    tContainer.appendChild(tile);
                }
            }
        }
    }

    function updateScore(s) {
        document.getElementById('current-score').innerText = s;
        if (s > highScore) {
            highScore = s;
            localStorage.setItem('2048_highScore', highScore);
            document.getElementById('best-score').innerText = highScore;
        }
    }

    function checkGameOver() {
        for(let r=0; r<size; r++)
            for(let c=0; c<size; c++)
                if(grid[r][c]===0) return false;
        for(let r=0; r<size; r++)
            for(let c=0; c<size; c++) {
                if(c<3 && grid[r][c] === grid[r][c+1]) return false;
                if(r<3 && grid[r][c] === grid[r+1][c]) return false;
            }
        return true;
    }

    function showGameOver() {
        const overlay = document.getElementById('game-overlay');
        overlay.style.display = 'flex';
        overlay.innerHTML = `
            <h2 class="overlay-title" style="color: #c0392b">Game Over!</h2>
            <p style="font-size:20px; margin-bottom:20px; color: var(--gb-text-dark)">最终得分: ${score}</p>
            <button class="game-btn" id="btn-restart">再试一次</button>
            <button class="game-btn" id="btn-menu" style="background:#95a5a6">返回</button>
        `;
        document.getElementById('btn-restart').addEventListener('click', startGame);
        document.getElementById('btn-menu').addEventListener('click', initHTML);
    }

    // 启动
    initHTML();
})();
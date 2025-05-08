const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const scoreBar = document.getElementById('score-bar');

// 设置画布大小
canvas.width = 800;
canvas.height = 600;

// 游戏状态
let score = 0;
let gameOver = false;
let showTutorial = true;  // 添加教程显示状态
let isPaused = false;  // 添加暂停状态
let highScore = Number(safeGetItem('space_high_score') || 0); // 移到这里
let gameStarted = false;  // 添加游戏开始状态

// 玩家飞机
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 40,
    height: 40,
    speed: 25,  // 移动速度从15增加到25
    color: '#1E90FF'
};

// 子弹数组
let bullets = [];
// 敌机数组
let enemies = [];
// 敌机子弹数组
let enemyBullets = [];
// 爆炸效果数组
let explosions = [];

// 控制玩家移动
let keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    // P键：暂停/继续
    if (e.key === 'p' || e.key === 'P') {
        if (gameStarted && !gameOver) {
            isPaused = !isPaused;
        }
    }
    // ESC键：关闭教程
    if (e.key === 'Escape') {
        showTutorial = false;
    }
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// 重置游戏
function resetGame() {
    score = 0;
    gameOver = false;
    isPaused = false;
    showTutorial = false;
    gameStarted = true;
    bullets = [];
    enemies = [];
    enemyBullets = [];
    explosions = [];
    player.x = canvas.width / 2;
    player.y = canvas.height - 50;
    scoreElement.textContent = score;
}

// 自动射击
let lastShot = 0;
const shootInterval = 30; // 射击间隔从50毫秒减少到30毫秒（每秒约33发）
const bulletSpeed = 25;   // 子弹速度从15增加到25

// 创建敌机
function createEnemy(type) {
    const enemyType = type !== undefined ? type : Math.random();
    let enemy = {
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: 2 + Math.random() * 2,
        color: '#FF4500',
        health: 1,
        vx: 0, // 横向速度
        ay: 0, // 加速度
        kind: 'normal',
        split: false // 是否分裂
    };

    // 普通敌机
    if (enemyType < 0.5) {
        enemy.health = 1;
        enemy.color = '#FF4500';
        enemy.kind = 'normal';
    } else if (enemyType < 0.7) { // 横向移动敌机
        enemy.health = 2;
        enemy.color = '#00C853';
        enemy.width = 36;
        enemy.height = 36;
        enemy.vx = Math.random() > 0.5 ? 2 : -2;
        enemy.kind = 'zigzag';
    } else if (enemyType < 0.85) { // 加速敌机
        enemy.health = 2;
        enemy.color = '#FFD600';
        enemy.width = 36;
        enemy.height = 36;
        enemy.ay = 0.08 + Math.random() * 0.07;
        enemy.kind = 'accelerate';
    } else { // 分裂敌机
        enemy.health = 3;
        enemy.color = '#2962FF';
        enemy.width = 44;
        enemy.height = 44;
        enemy.kind = 'split';
        enemy.split = true;
    }
    return enemy;
}

// 音效函数
function playSound(type) {
    const ctx = window._audioCtx || (window._audioCtx = new (window.AudioContext || window.webkitAudioContext)());
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    let freq = 500, dur = 0.08, vol = 0.08, wave = 'sine';
    if (type === 'hit') { freq = 500; dur = 0.08; vol = 0.08; wave = 'sine'; }
    if (type === 'explode') { freq = 350; dur = 0.18; vol = 0.13; wave = 'triangle'; }
    if (type === 'score') { freq = 700; dur = 0.06; vol = 0.07; wave = 'sine'; }
    o.type = wave;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.start();
    o.stop(ctx.currentTime + dur);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);
}

// 分数浮动提示
function showScoreFloat(x, y, text = '+10') {
    const float = document.createElement('div');
    float.className = 'score-float';
    float.textContent = text;
    float.style.left = (canvas.offsetLeft + x - 10) + 'px';
    float.style.top = (canvas.offsetTop + y - 20) + 'px';
    document.body.appendChild(float);
    playSound('score');
    setTimeout(() => float.remove(), 1000);
}

// 创建爆炸效果
function createExplosion(x, y, colorful = false) {
    return {
        x: x,
        y: y,
        radius: 1,
        maxRadius: 40,
        speed: 3,
        color: colorful ? `hsl(${Math.random()*360},100%,60%)` : '#FFD700',
        alpha: 1
    };
}

// 纯CSS粒子爆炸效果
function createCssExplosion(x, y) {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = (canvas.offsetLeft + x - 30) + 'px';
    container.style.top = (canvas.offsetTop + y - 30) + 'px';
    container.style.width = '60px';
    container.style.height = '60px';
    container.style.pointerEvents = 'none';
    container.style.zIndex = 99;
    for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        p.className = 'css-particle';
        const angle = (i / 18) * 2 * Math.PI;
        const dist = 30 + Math.random() * 20;
        p.style.setProperty('--angle', angle + 'rad');
        p.style.setProperty('--dist', dist + 'px');
        p.style.background = `hsl(${Math.random()*360},100%,60%)`;
        container.appendChild(p);
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 900);
}

// 游戏主循环
function gameLoop(timestamp) {
    if (!gameStarted) {
        // 自动开始游戏
        resetGame();
        gameStarted = true;
    }
    if (gameOver) {
        // 显示游戏结束画面
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束！', canvas.width/2, canvas.height/2 - 50);
        ctx.fillText(`最终得分：${score}`, canvas.width/2, canvas.height/2);
        ctx.fillText(`最高分：${highScore}`, canvas.width/2, canvas.height/2 + 50);
        ctx.font = '24px Arial';
        ctx.fillText('0.1秒后自动重新开始...', canvas.width/2, canvas.height/2 + 100);
        
        // 0.1秒后自动刷新页面
        setTimeout(() => {
            window.location.reload();
        }, 100);
        return;
    }

    if (isPaused) {
        // 显示暂停画面
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏暂停', canvas.width/2, canvas.height/2 - 50);
        ctx.fillText(`当前得分：${score}`, canvas.width/2, canvas.height/2);
        ctx.font = '24px Arial';
        ctx.fillText('按空格键继续', canvas.width/2, canvas.height/2 + 50);
        ctx.fillText('按P键继续', canvas.width/2, canvas.height/2 + 80);
        requestAnimationFrame(gameLoop);
        return;
    }

    // 控制分数栏显示
    if (!gameStarted || isPaused || gameOver) {
        scoreBar.style.display = 'none';
    } else {
        scoreBar.style.display = 'block';
    }

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新玩家位置 - 支持WASD和方向键
    if ((keys['ArrowLeft'] || keys['a'] || keys['A']) && player.x > 0) player.x -= player.speed;
    if ((keys['ArrowRight'] || keys['d'] || keys['D']) && player.x < canvas.width - player.width) player.x += player.speed;
    if ((keys['ArrowUp'] || keys['w'] || keys['W']) && player.y > 0) player.y -= player.speed;
    if ((keys['ArrowDown'] || keys['s'] || keys['S']) && player.y < canvas.height - player.height) player.y += player.speed;

    // 自动射击
    if (timestamp - lastShot > shootInterval) {
        // 发射三发子弹，形成扇形
        for (let i = -1; i <= 1; i++) {
            bullets.push({
                x: player.x + player.width / 2 - 2 + i * 5,  // 子弹位置稍微错开
                y: player.y,
                width: 4,
                height: 10,
                speed: bulletSpeed,
                color: '#00BFFF'
            });
        }
        lastShot = timestamp;
    }

    // 更新子弹位置
    bullets = bullets.filter(bullet => {
        bullet.y -= bullet.speed;
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        return bullet.y > 0;
    });

    // 随机生成敌机（分数越高越多，最多25个）
    let maxEnemies = 25;
    let baseProb = 0.04 + score / 50000;
    if (enemies.length < maxEnemies && Math.random() < baseProb) {
        enemies.push(createEnemy());
    }

    // 更新敌机位置
    enemies = enemies.filter(enemy => {
        if (enemy.health <= 0) {
            // 分裂敌机被击毁时生成两个小敌机
            if (enemy.split) {
                for (let i = 0; i < 2; i++) {
                    let mini = createEnemy(0.5); // 生成横向移动小敌机
                    mini.x = enemy.x + (i === 0 ? -10 : 10);
                    mini.y = enemy.y;
                    mini.width = 20;
                    mini.height = 20;
                    mini.health = 1;
                    mini.color = '#B388FF';
                    mini.vx = (i === 0 ? -2 : 2);
                    mini.kind = 'zigzag';
                    mini.split = false;
                    enemies.push(mini);
                }
            }
            return false;
        }
        // 横向移动
        if (enemy.kind === 'zigzag') {
            enemy.x += enemy.vx;
            if (enemy.x < 0 || enemy.x > canvas.width - enemy.width) {
                enemy.vx *= -1;
            }
        }
        // 加速下落
        if (enemy.kind === 'accelerate') {
            enemy.speed += enemy.ay;
        }
        enemy.y += enemy.speed;
        // 敌机阴影
        ctx.save();
        ctx.shadowColor = enemy.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.restore();

        // 检测子弹击中敌机
        bullets = bullets.filter(bullet => {
            if (isColliding(bullet, enemy)) {
                enemy.health--;  // 减少敌机生命值
                playSound('hit');
                if (enemy.health <= 0) {  // 如果敌机生命值为0，则击毁
                    score += 10;
                    scoreElement.textContent = score;
                    // 分数浮动提示
                    showScoreFloat(enemy.x + enemy.width/2, enemy.y, '+10');
                    playSound('explode');
                    createCssExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    // 创建多个爆炸效果
                    for (let i = 0; i < 6; i++) {
                        explosions.push(createExplosion(
                            enemy.x + enemy.width/2 + (Math.random() - 0.5) * 20,
                            enemy.y + enemy.height/2 + (Math.random() - 0.5) * 20,
                            true
                        ));
                    }
                    return false;
                }
                // 即使没有击毁，也显示小型爆炸效果
                explosions.push(createExplosion(
                    bullet.x + bullet.width/2,
                    bullet.y + bullet.height/2
                ));
                return false;  // 子弹消失
            }
            return true;
        });

        // 检测敌机与玩家碰撞
        if (isColliding(enemy, player)) {
            gameOver = true;
            return false;
        }

        return enemy.y < canvas.height;
    });

    // 敌机子弹加速
    let enemyBulletSpeed = 5 + Math.floor(score / 500) * 2;
    // 当分数超过1000时，敌机开始发射子弹
    if (score > 1000) {
        enemies.forEach(enemy => {
            if (Math.random() < 0.01) {
                enemyBullets.push({
                    x: enemy.x + enemy.width / 2 - 2,
                    y: enemy.y + enemy.height,
                    width: 4,
                    height: 10,
                    speed: enemyBulletSpeed,
                    color: '#f00'
                });
            }
        });
    }

    // 更新敌机子弹
    enemyBullets = enemyBullets.filter(bullet => {
        bullet.y += bullet.speed;
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // 检测敌机子弹击中玩家
        if (isColliding(bullet, player)) {
            gameOver = true;
            return false;
        }

        return bullet.y < canvas.height;
    });

    // 更新爆炸效果
    explosions = explosions.filter(explosion => {
        explosion.radius += explosion.speed;
        explosion.alpha -= 0.02;  // 逐渐降低透明度
        
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 0, ${explosion.alpha})`;  // 使用rgba实现透明度
        ctx.fill();
        
        // 添加爆炸光晕效果
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 69, 0, ${explosion.alpha * 0.5})`;  // 橙色光晕
        ctx.fill();
        
        return explosion.radius < explosion.maxRadius && explosion.alpha > 0;
    });

    // 绘制玩家
    ctx.save();
    ctx.shadowColor = player.color;
    ctx.shadowBlur = 16;
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.restore();

    // 显示教程
    if (showTutorial) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        
        const tutorialText = [
            '欢迎来到太空战机！',
            '',
            '控制方式：',
            'W 或 ↑ - 向上移动',
            'S 或 ↓ - 向下移动',
            'A 或 ← - 向左移动',
            'D 或 → - 向右移动',
            '',
            '游戏说明：',
            '- 自动发射子弹攻击敌机',
            '- 击毁敌机获得分数',
            '- 避免与敌机相撞',
            '- 分数超过1000分后敌机会发射子弹',
            '',
            '按 ESC 键开始游戏'
        ];
        
        tutorialText.forEach((text, index) => {
            ctx.fillText(text, canvas.width/2, 100 + index * 30);
        });
    }

    // 更新分数显示
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('space_high_score', highScore);
    }
    scoreElement.textContent = `分数: ${score} | 最高分: ${highScore}`;

    requestAnimationFrame(gameLoop);
}

// 碰撞检测
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 开始游戏
gameLoop();

// localStorage安全读写函数
function safeGetItem(key) {
    try { return localStorage.getItem(key); } catch { return null; }
}
function safeSetItem(key, value) {
    try { localStorage.setItem(key, value); } catch {}
}

// 窗口失焦自动暂停
window.addEventListener('blur', () => {
    if (gameStarted && !gameOver && !isPaused) {
        isPaused = true;
    }
});

// 方向键多键冲突保护：本游戏允许多方向同时按下，移动速度叠加，体验更灵活。 
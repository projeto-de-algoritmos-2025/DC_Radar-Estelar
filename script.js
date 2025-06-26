document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('starCanvas');
    const ctx = canvas.getContext('2d');

    const findPairDNCBtn = document.getElementById('findPairDNCBtn');
    const findPairBruteForceBtn = document.getElementById('findPairBruteForceBtn');
    const generateRandomBtn = document.getElementById('generateRandomBtn');
    const randomPointsInput = document.getElementById('random-points-input');
    const clearBtn = document.getElementById('clearBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    const modal = document.getElementById('aboutModal');
    const closeBtn = document.querySelector('.close-btn');

    const algorithmUsedSpan = document.getElementById('algorithm-used');
    const minDistanceSpan = document.getElementById('min-distance');
    const distanceCalculationsSpan = document.getElementById('distance-calculations');

    let points = [];
    let distanceCounter = 0;
    let closestPair = null; 
    let backgroundStars = [];
    function setupBackground() {
        for (let i = 0; i < 100; i++) {
            backgroundStars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5,
                alpha: Math.random() * 0.5 + 0.2
            });
        }
    }

    function animateBackground() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        backgroundStars.forEach(star => {
            star.y += 0.1;
            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.fill();
        });
        
        points.forEach(p => drawUserStar(p));
        
        if (closestPair && closestPair[0] && closestPair[1]) {
            drawLine(closestPair[0], closestPair[1]);
        }
        
        requestAnimationFrame(animateBackground);
    }


    function drawUserStar(point) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    function drawLine(p1, p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = '#4dd0e1';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#4dd0e1';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
    
    // --- LÓGICA DO ALGORITMO: PAR DE PONTOS ---
    function distanceSq(p1, p2) {
        distanceCounter++;
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }
    
    function findClosestPairBruteForce(pointSet) {
        let minDistanceSq = Infinity;
        let pair = [null, null];
        for (let i = 0; i < pointSet.length; i++) {
            for (let j = i + 1; j < pointSet.length; j++) {
                const dSq = distanceSq(pointSet[i], pointSet[j]);
                if (dSq < minDistanceSq) {
                    minDistanceSq = dSq;
                    pair = [pointSet[i], pointSet[j]];
                }
            }
        }
        return { pair: pair, distSq: minDistanceSq };
    }

    function findClosestPairDNC(pointSet) {
        const pointsSortedByX = [...pointSet].sort((a, b) => a.x - b.x);
        return closestPairRecursive(pointsSortedByX);
    }

    function closestPairRecursive(pointsSortedByX) {
        const n = pointsSortedByX.length;
        if (n <= 3) {
            return findClosestPairBruteForce(pointsSortedByX);
        }
        const mid = Math.floor(n / 2);
        const midPoint = pointsSortedByX[mid];
        const leftHalf = pointsSortedByX.slice(0, mid);
        const rightHalf = pointsSortedByX.slice(mid);
        const resultLeft = closestPairRecursive(leftHalf);
        const resultRight = closestPairRecursive(rightHalf);
        let minResult = (resultLeft.distSq < resultRight.distSq) ? resultLeft : resultRight;
        const strip = [];
        for (let i = 0; i < n; i++) {
            if (Math.pow(pointsSortedByX[i].x - midPoint.x, 2) < minResult.distSq) {
                strip.push(pointsSortedByX[i]);
            }
        }
        return closestInStrip(strip, minResult);
    }

    function closestInStrip(strip, currentMinResult) {
        let minResult = { ...currentMinResult };
        strip.sort((a, b) => a.y - b.y);
        for (let i = 0; i < strip.length; i++) {
            for (let j = i + 1; j < strip.length && Math.pow(strip[j].y - strip[i].y, 2) < minResult.distSq; j++) {
                const dSq = distanceSq(strip[i], strip[j]);
                if (dSq < minResult.distSq) {
                    minResult.distSq = dSq;
                    minResult.pair = [strip[i], strip[j]];
                }
            }
        }
        return minResult;
    }

    function updateResultsPanel(algorithm, result) {
        algorithmUsedSpan.textContent = algorithm;
        minDistanceSpan.textContent = Math.sqrt(result.distSq).toFixed(2);
        distanceCalculationsSpan.textContent = distanceCounter.toLocaleString('pt-BR');
    }

    function runAlgorithm(algorithmFn, algorithmName) {
        if (points.length < 2) {
            alert("Adicione pelo menos duas estrelas!");
            return;
        }
        distanceCounter = 0;
        const result = algorithmFn(points);
        
        closestPair = result.pair; 
        
        updateResultsPanel(algorithmName, result);
    }

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        points.push(point);
    });

    findPairDNCBtn.addEventListener('click', () => runAlgorithm(findClosestPairDNC, 'Divisão e Conquista'));
    findPairBruteForceBtn.addEventListener('click', () => runAlgorithm(findClosestPairBruteForce, 'Força Bruta'));
    
    clearBtn.addEventListener('click', () => {
        points = [];
        closestPair = null;
        algorithmUsedSpan.textContent = 'N/A';
        minDistanceSpan.textContent = 'N/A';
        distanceCalculationsSpan.textContent = 'N/A';
    });
    
    generateRandomBtn.addEventListener('click', () => {
        const numPoints = parseInt(randomPointsInput.value, 10);
        if (isNaN(numPoints) || numPoints < 2) {
            alert("Por favor, insira um número válido de pontos (pelo menos 2).");
            return;
        }
        points = [];
        closestPair = null;
        for (let i = 0; i < numPoints; i++) {
            points.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height
            });
        }
    });

    aboutBtn.addEventListener('click', () => { modal.style.display = 'block'; });
    closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', (e) => { if (e.target == modal) { modal.style.display = 'none'; } });
    setupBackground();
    animateBackground();
});
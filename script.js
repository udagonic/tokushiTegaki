// script.js
const uploadImage = document.getElementById('uploadImage');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const saveImage = document.getElementById('saveImage');
const resetCanvas = document.getElementById('resetCanvas');
const penColor = document.getElementById('penColor');
const penSize = document.getElementById('penSize');
const undo = document.getElementById('undo');
const redo = document.getElementById('redo');

let painting = false;
let currentColor = penColor.value;
let currentSize = penSize.value;
let undoStack = [];
let redoStack = [];

canvas.width = 800;
canvas.height = 600;

function saveState() {
    if (undoStack.length >= 10) {
        undoStack.shift(); // スタックの上限を10に制限
    }
    undoStack.push(canvas.toDataURL());
    redoStack = []; // 何か新しいものを描いたらやり直しスタックをクリア
}

uploadImage.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height); // 既存の描画をクリア
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                saveState();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

canvas.addEventListener('mousedown', () => {
    painting = true;
    saveState();
});

canvas.addEventListener('mouseup', () => {
    painting = false;
    ctx.beginPath();
});

canvas.addEventListener('mousemove', (e) => {
    if (!painting) return;
    draw(e);
});

penColor.addEventListener('input', (e) => {
    currentColor = e.target.value;
});

penSize.addEventListener('input', (e) => {
    currentSize = e.target.value;
});

undo.addEventListener('click', () => {
    if (undoStack.length > 0) {
        redoStack.push(canvas.toDataURL());
        const previousState = undoStack.pop();
        const img = new Image();
        img.src = previousState;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
});

redo.addEventListener('click', () => {
    if (redoStack.length > 0) {
        undoStack.push(canvas.toDataURL());
        const nextState = redoStack.pop();
        const img = new Image();
        img.src = nextState;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
});

function draw(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

saveImage.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'canvas-drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

resetCanvas.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    uploadImage.value = '';
    undoStack = []; // スタックをリセット
    redoStack = []; // スタックをリセット
});

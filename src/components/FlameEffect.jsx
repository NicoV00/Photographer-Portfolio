// src/components/FlameEffect.jsx
import React, { useEffect, useRef } from 'react';
import { clamp, map } from '/src/modules/num.js'; // Asegúrate de que estas rutas sean correctas
import { mix, smoothstep } from '/src/modules/num.js';

const flame = '...::/\\/\\/\\+=*abcdef01XYZ#'; // Caracteres para el efecto de llama
let cols, rows;
const noise = valueNoise();
const data = [];

export const FlameEffect = () => {
    const canvasRef = useRef(null);
    const cursorRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const resizeCanvas = () => {
            cols = Math.floor(canvas.width / 10); // Ajusta según el tamaño de los caracteres
            rows = Math.floor(canvas.height / 10);
            data.length = cols * rows; // No perder referencia
            data.fill(0);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const renderFrame = () => {
            pre({ cols, rows }, cursorRef.current);
            context.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas

            for (let i = 0; i < data.length; i++) {
                const u = data[i];
                if (u === 0) continue; // Inserta un espacio

                const char = flame[clamp(u, 0, flame.length - 1)];
                context.fillStyle = 'white'; // Color del texto
                context.font = '10px monospace'; // Ajusta el tamaño de la fuente
                const x = (i % cols) * 10; // Posición X
                const y = Math.floor(i / cols) * 10; // Posición Y
                context.fillText(char, x, y + 10); // Dibuja el carácter
            }

            requestAnimationFrame(renderFrame);
        };

        renderFrame();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            cursorRef.current.x = Math.floor(e.clientX / 10); // Ajusta según el tamaño de los caracteres
            cursorRef.current.y = Math.floor(e.clientY / 10);
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return <canvas ref={canvasRef} width={800} height={600} style={{ backgroundColor: 'black' }} />;
};

// Funciones pre y valueNoise aquí (mantenlas como están en tu código original)
function pre(context, cursor) {
    if (cols != context.cols || rows != context.rows) {
        cols = context.cols;
        rows = context.rows;
        data.length = cols * rows; // No perder referencia
        data.fill(0);
    }

    if (!cursor.pressed) {
        const t = Date.now() * 0.0015; // Usa tiempo para animación
        const last = cols * (rows - 1);
        for (let i = 0; i < cols; i++) {
            const val = Math.floor(map(noise(i * 0.05, t), 0, 1, 5, 40));
            data[last + i] = clamp(val + data[last + i], 0, 255); // Límite superior
        }
    } else {
        const cx = cursor.x;
        const cy = cursor.y;
        data[cx + cy * cols] = rndi(5, 50);
    }

    for (let i = 0; i < data.length; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const dest = row * cols + clamp(col + rndi(-1, 1), 0, cols - 1);
        const src = Math.min(rows - 1, row + 1) * cols + col;
        data[dest] = Math.max(0, data[src] - rndi(0, 2));
    }
}

function valueNoise() {
    // Implementación de value noise aquí...
}

// Función random int entre a y b inclusive!
function rndi(a, b=0) {
    if (a > b) [a, b] = [b, a];
    return Math.floor(a + Math.random() * (b - a + 1));
}

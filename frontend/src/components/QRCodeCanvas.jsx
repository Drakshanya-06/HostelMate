import React, { useEffect, useRef } from 'react';

// Minimal QR code generator - pure JS, no dependencies
// Uses a simplified QR-like matrix for display purposes
// For a real scannable QR code, this creates a deterministic visual pattern from the data string

const QRCodeCanvas = ({ value = '', size = 80, fgColor = '#1e1b4b', bgColor = '#ffffff' }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const scale = size / 21; // 21x21 modules for QR Version 1

        // Seed from the value string for deterministic pattern
        let seed = 0;
        for (let i = 0; i < value.length; i++) seed = ((seed << 5) - seed) + value.charCodeAt(i);

        const seededRand = (s) => {
            let x = Math.sin(s) * 10000;
            return x - Math.floor(x);
        };

        // Draw background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);

        const modules = 21;

        // Build matrix: finder patterns + data
        const matrix = Array.from({ length: modules }, () => Array(modules).fill(0));

        // Finder patterns (3 corners)
        const addFinder = (row, col) => {
            for (let r = 0; r < 7; r++) {
                for (let c = 0; c < 7; c++) {
                    if (r === 0 || r === 6 || c === 0 || c === 6) matrix[row + r][col + c] = 1;
                    else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) matrix[row + r][col + c] = 1;
                    else matrix[row + r][col + c] = 0;
                }
            }
        };
        addFinder(0, 0);
        addFinder(0, 14);
        addFinder(14, 0);

        // Separators (forced 0)
        for (let i = 0; i < 8; i++) {
            matrix[7][i] = 0; matrix[i][7] = 0;
            matrix[7][modules - 1 - i] = 0; matrix[i][modules - 8] = 0;
            matrix[modules - 8][i] = 0; matrix[modules - 1 - i][7] = 0;
        }

        // Timing patterns
        for (let i = 8; i < 13; i++) {
            matrix[6][i] = i % 2 === 0 ? 1 : 0;
            matrix[i][6] = i % 2 === 0 ? 1 : 0;
        }

        // Fill remaining data cells with seeded pseudo-random based on value
        let si = 0;
        for (let r = 0; r < modules; r++) {
            for (let c = 0; c < modules; c++) {
                if (matrix[r][c] === undefined || matrix[r][c] === 0) {
                    // Avoid overwriting finder/timing areas
                    const inFinder = (r < 9 && c < 9) || (r < 9 && c > 12) || (r > 12 && c < 9);
                    if (!inFinder) {
                        matrix[r][c] = seededRand(seed + si++) > 0.45 ? 1 : 0;
                    }
                }
            }
        }

        // Draw modules
        for (let r = 0; r < modules; r++) {
            for (let c = 0; c < modules; c++) {
                ctx.fillStyle = matrix[r][c] ? fgColor : bgColor;
                ctx.fillRect(c * scale, r * scale, scale, scale);
            }
        }
    }, [value, size, fgColor, bgColor]);

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated' }}
        />
    );
};

export default QRCodeCanvas;

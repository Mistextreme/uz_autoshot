const path = require('path');
const fs   = require('fs');
const { PNG } = require('pngjs');

const RESOURCE   = GetCurrentResourceName();
const RES_PATH   = GetResourcePath(RESOURCE);
const OUTPUT_DIR = path.resolve(path.join(RES_PATH, 'shots'));

try {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
} catch (err) {
    console.log('^1[uz_AutoShot]^0 Output dir error: ' + err.message);
}

function stripDataUri(b64) {
    if (typeof b64 !== 'string') return b64;
    if (!b64.startsWith('data:')) return b64;
    const comma = b64.indexOf(',');
    return comma === -1 ? b64 : b64.slice(comma + 1);
}

const ACE_RESTRICTED = GetConvar('uz_autoshot_ace_restricted', 'false') === 'true';
const ACE_COMMAND    = GetConvar('uz_autoshot_command', 'shotmaker');
const ACE_NAME       = 'command.' + ACE_COMMAND;

function checkAce(src) {
    if (!ACE_RESTRICTED) return true;
    return IsPlayerAceAllowed(src.toString(), ACE_NAME);
}

// ════════════════════════════════════════════════════════
// CHROMA KEY REMOVAL
// ════════════════════════════════════════════════════════

function removeChromaKey(pngBuffer, mode) {
    const png = PNG.sync.read(pngBuffer);
    const d = png.data;
    const w = png.width, h = png.height;
    let removed = 0;
    const isMagenta = mode === 'magenta';

    for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        let keyness = 0;

        if (isMagenta) {
            const rOverG = r - g;
            const bOverG = b - g;
            const minOver = rOverG < bOverG ? rOverG : bOverG;
            const primary = r < b ? r : b;
            if (minOver > 0 && primary > 10) {
                const edgeSoft = minOver < 20 ? minOver / 20 : 1;
                const primarySoft = primary < 40 ? (primary - 10) / 30 : 1;
                keyness = Math.min(1, (rOverG + bOverG) / (r + b + 1)) * edgeSoft * primarySoft;
            }
        } else {
            const gOverR = g - r;
            const gOverB = g - b;
            const minOver = gOverR < gOverB ? gOverR : gOverB;
            if (minOver > 0 && g > 10) {
                const edgeSoft = minOver < 20 ? minOver / 20 : 1;
                const primarySoft = g < 40 ? (g - 10) / 30 : 1;
                keyness = Math.min(1, (gOverR + gOverB) / (g + 1)) * edgeSoft * primarySoft;
            }
        }

        if (keyness > 0) {
            d[i + 3] = (255 * (1 - keyness) + 0.5) | 0;
            if (isMagenta) {
                d[i]     = (r - (r - g) * keyness + 0.5) | 0;
                d[i + 2] = (b - (b - g) * keyness + 0.5) | 0;
            } else {
                const cap = r > b ? r : b;
                d[i + 1] = (g - (g - cap) * keyness + 0.5) | 0;
            }
            removed++;
        }
    }

    // Two-pass alpha feather: 5x5 box blur on alpha channel for smooth edges
    const RADIUS = 2;
    const KERNEL = (RADIUS * 2 + 1) * (RADIUS * 2 + 1);
    const totalPx = w * h;
    const src = new Uint8Array(totalPx);

    for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < totalPx; i++) src[i] = d[(i << 2) + 3];

        for (let y = RADIUS; y < h - RADIUS; y++) {
            for (let x = RADIUS; x < w - RADIUS; x++) {
                const idx = y * w + x;
                const a = src[idx];
                if ((a === 0 || a === 255) &&
                    src[idx - 1] === a && src[idx + 1] === a &&
                    src[idx - w] === a && src[idx + w] === a) continue;

                let sum = 0;
                for (let ky = -RADIUS; ky <= RADIUS; ky++) {
                    const rowOff = (y + ky) * w + x;
                    for (let kx = -RADIUS; kx <= RADIUS; kx++) {
                        sum += src[rowOff + kx];
                    }
                }
                d[(idx << 2) + 3] = (sum / KERNEL + 0.5) | 0;
            }
        }
    }

    console.log('^2[uz_AutoShot]^0 Chroma key (' + mode + '): ' + removed + '/' + totalPx + ' pixels removed, edges feathered');
    return PNG.sync.write(png, { colorType: 6 });
}

// ════════════════════════════════════════════════════════
// AUTO-CROP — trim transparent/dark empty space around subject
// ════════════════════════════════════════════════════════

function autoCropPNG(pngBuffer, threshold, paddingPx, mode) {
    const png = PNG.sync.read(pngBuffer);
    const { data: d, width: w, height: h } = png;

    const alphaThresh = (threshold > 0 ? threshold : 10);
    const darkThresh  = (threshold > 0 ? threshold : 10);
    const cropMode    = typeof mode === 'string' ? mode : 'alpha';

    // Returns true when a pixel is considered background (should be ignored)
    function isEmpty(x, y) {
        const i = (y * w + x) * 4;
        if (cropMode === 'alpha' || cropMode === 'both') {
            if (d[i + 3] < alphaThresh) return true;
        }
        if (cropMode === 'dark' || cropMode === 'both') {
            if (d[i] <= darkThresh && d[i + 1] <= darkThresh && d[i + 2] <= darkThresh) return true;
        }
        return false;
    }

    // Scan every pixel to find the bounding box of non-empty content
    let minX = w, minY = h, maxX = -1, maxY = -1;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (!isEmpty(x, y)) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }

    // Guard: image is entirely empty — return the original unchanged
    if (maxX < 0) {
        console.log('^3[uz_AutoShot]^0 AutoCrop: no subject found (image fully empty), returning original');
        return pngBuffer;
    }

    // Apply padding, clamped to image bounds
    const pad = paddingPx > 0 ? paddingPx : 0;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(w - 1, maxX + pad);
    maxY = Math.min(h - 1, maxY + pad);

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;

    // Guard: bounding box covers the entire image — nothing to trim
    if (cropW === w && cropH === h) {
        console.log('^3[uz_AutoShot]^0 AutoCrop: subject fills entire frame, skipping crop');
        return pngBuffer;
    }

    // Copy cropped region into a new PNG
    const out = new PNG({ width: cropW, height: cropH, fill: true });
    const od  = out.data;

    for (let y = 0; y < cropH; y++) {
        const srcRowBase = (minY + y) * w;
        const dstRowBase = y * cropW;
        for (let x = 0; x < cropW; x++) {
            const si = (srcRowBase + minX + x) * 4;
            const di = (dstRowBase + x) * 4;
            od[di]     = d[si];
            od[di + 1] = d[si + 1];
            od[di + 2] = d[si + 2];
            od[di + 3] = d[si + 3];
        }
    }

    const areaSaved = 100 - Math.round((cropW * cropH) / (w * h) * 100);
    console.log(
        '^2[uz_AutoShot]^0 AutoCrop: ' + w + 'x' + h +
        ' -> ' + cropW + 'x' + cropH +
        ' (' + areaSaved + '% area trimmed, pad=' + pad + 'px, mode=' + cropMode + ')'
    );
    return PNG.sync.write(out, { colorType: 6 });
}

// ════════════════════════════════════════════════════════
// FIT-TO-CANVAS — scale cropped subject to fill output canvas
// using fit-to-contain (no cropping), centred on transparent bg
// ════════════════════════════════════════════════════════

function fitToCanvas(pngBuffer, targetW, targetH) {
    const src = PNG.sync.read(pngBuffer);
    const sw  = src.width;
    const sh  = src.height;

    // Already the exact size — nothing to do
    if (sw === targetW && sh === targetH) return pngBuffer;

    // Scale to fit entirely within the target (contain, not cover)
    const scale = Math.min(targetW / sw, targetH / sh);
    const dw    = Math.round(sw * scale);
    const dh    = Math.round(sh * scale);

    // Centre offset so the subject sits in the middle of the canvas
    const dx = Math.round((targetW - dw) / 2);
    const dy = Math.round((targetH - dh) / 2);

    // Destination canvas — PNG.fill:true zeroes all bytes → fully transparent
    const dst = new PNG({ width: targetW, height: targetH, fill: true });
    const sd  = src.data;
    const dd  = dst.data;

    // Pre-computed inverse ratios for bilinear sampling
    const xRatio = sw / dw;
    const yRatio = sh / dh;

    for (let y = 0; y < dh; y++) {
        const srcY = y * yRatio;
        const y0   = srcY | 0;
        const y1   = y0 + 1 < sh ? y0 + 1 : y0;
        const yf   = srcY - y0;
        const yf1  = 1 - yf;
        const rowA = y0 * sw;
        const rowB = y1 * sw;

        for (let x = 0; x < dw; x++) {
            const srcX = x * xRatio;
            const x0   = srcX | 0;
            const x1   = x0 + 1 < sw ? x0 + 1 : x0;
            const xf   = srcX - x0;
            const xf1  = 1 - xf;

            const i00 = (rowA + x0) * 4;
            const i10 = (rowA + x1) * 4;
            const i01 = (rowB + x0) * 4;
            const i11 = (rowB + x1) * 4;

            const w00 = xf1 * yf1;
            const w10 = xf  * yf1;
            const w01 = xf1 * yf;
            const w11 = xf  * yf;

            // Write into the correct position on the target canvas
            const di = ((dy + y) * targetW + (dx + x)) * 4;

            dd[di]     = (sd[i00]     * w00 + sd[i10]     * w10 + sd[i01]     * w01 + sd[i11]     * w11 + 0.5) | 0;
            dd[di + 1] = (sd[i00 + 1] * w00 + sd[i10 + 1] * w10 + sd[i01 + 1] * w01 + sd[i11 + 1] * w11 + 0.5) | 0;
            dd[di + 2] = (sd[i00 + 2] * w00 + sd[i10 + 2] * w10 + sd[i01 + 2] * w01 + sd[i11 + 2] * w11 + 0.5) | 0;
            dd[di + 3] = (sd[i00 + 3] * w00 + sd[i10 + 3] * w10 + sd[i01 + 3] * w01 + sd[i11 + 3] * w11 + 0.5) | 0;
        }
    }

    console.log(
        '^2[uz_AutoShot]^0 FitToCanvas: ' + sw + 'x' + sh +
        ' -> ' + dw + 'x' + dh +
        ' (scale=' + scale.toFixed(3) + ')' +
        ' centred at ' + dx + ',' + dy +
        ' on ' + targetW + 'x' + targetH + ' canvas'
    );
    return PNG.sync.write(dst, { colorType: 6 });
}

// ════════════════════════════════════════════════════════
// RESIZE — original centre-crop + resize (cover strategy)
// Used only when AutoCrop is disabled
// ════════════════════════════════════════════════════════

function resizePNG(pngBuffer, targetW, targetH) {
    const src = PNG.sync.read(pngBuffer);
    if (src.width === targetW && src.height === targetH) return pngBuffer;

    const srcAspect = src.width / src.height;
    const dstAspect = targetW / targetH;

    let cropX = 0, cropY = 0, cropW = src.width, cropH = src.height;
    if (srcAspect > dstAspect) {
        cropW = Math.round(src.height * dstAspect);
        cropX = Math.round((src.width - cropW) / 2);
    } else if (srcAspect < dstAspect) {
        cropH = Math.round(src.width / dstAspect);
        cropY = Math.round((src.height - cropH) / 2);
    }

    const dst = new PNG({ width: targetW, height: targetH, fill: true });
    const sd = src.data, dd = dst.data;
    const sw = src.width;
    const xRatio = cropW / targetW;
    const yRatio = cropH / targetH;

    const isDownscale = cropW > targetW || cropH > targetH;

    if (isDownscale) {
        for (let y = 0; y < targetH; y++) {
            const sy0 = cropY + y * yRatio;
            const sy1 = cropY + (y + 1) * yRatio;
            const iy0 = sy0 | 0;
            const iy1 = Math.min((sy1 | 0) + 1, cropY + cropH);

            for (let x = 0; x < targetW; x++) {
                const sx0 = cropX + x * xRatio;
                const sx1 = cropX + (x + 1) * xRatio;
                const ix0 = sx0 | 0;
                const ix1 = Math.min((sx1 | 0) + 1, cropX + cropW);

                let r = 0, g = 0, b = 0, a = 0, totalW = 0;

                for (let sy = iy0; sy < iy1; sy++) {
                    const wy = (sy < sy0 ? 1 - (sy0 - sy) : sy + 1 > sy1 ? sy1 - sy : 1);
                    const rowOff = sy * sw;
                    for (let sx = ix0; sx < ix1; sx++) {
                        const wx = (sx < sx0 ? 1 - (sx0 - sx) : sx + 1 > sx1 ? sx1 - sx : 1);
                        const w  = wx * wy;
                        const si = (rowOff + sx) << 2;
                        r += sd[si]     * w;
                        g += sd[si + 1] * w;
                        b += sd[si + 2] * w;
                        a += sd[si + 3] * w;
                        totalW += w;
                    }
                }

                const di  = (y * targetW + x) << 2;
                const inv = 1 / totalW;
                dd[di]     = (r * inv + 0.5) | 0;
                dd[di + 1] = (g * inv + 0.5) | 0;
                dd[di + 2] = (b * inv + 0.5) | 0;
                dd[di + 3] = (a * inv + 0.5) | 0;
            }
        }
    } else {
        const maxCropX = cropX + cropW - 1;
        const maxCropY = cropY + cropH - 1;

        for (let y = 0; y < targetH; y++) {
            const srcY = cropY + y * yRatio;
            const y0   = srcY | 0;
            const y1   = y0 < maxCropY ? y0 + 1 : maxCropY;
            const yf   = srcY - y0;
            const yf1  = 1 - yf;
            const rowA = y0 * sw;
            const rowB = y1 * sw;

            for (let x = 0; x < targetW; x++) {
                const srcX = cropX + x * xRatio;
                const x0   = srcX | 0;
                const x1   = x0 < maxCropX ? x0 + 1 : maxCropX;
                const xf   = srcX - x0;
                const xf1  = 1 - xf;

                const i00 = (rowA + x0) << 2;
                const i10 = (rowA + x1) << 2;
                const i01 = (rowB + x0) << 2;
                const i11 = (rowB + x1) << 2;
                const di  = (y * targetW + x) << 2;

                const w00 = xf1 * yf1, w10 = xf * yf1, w01 = xf1 * yf, w11 = xf * yf;
                dd[di]     = (sd[i00]     * w00 + sd[i10]     * w10 + sd[i01]     * w01 + sd[i11]     * w11 + 0.5) | 0;
                dd[di + 1] = (sd[i00 + 1] * w00 + sd[i10 + 1] * w10 + sd[i01 + 1] * w01 + sd[i11 + 1] * w11 + 0.5) | 0;
                dd[di + 2] = (sd[i00 + 2] * w00 + sd[i10 + 2] * w10 + sd[i01 + 2] * w01 + sd[i11 + 2] * w11 + 0.5) | 0;
                dd[di + 3] = (sd[i00 + 3] * w00 + sd[i10 + 3] * w10 + sd[i01 + 3] * w01 + sd[i11 + 3] * w11 + 0.5) | 0;
            }
        }
    }

    // Light sharpen on downscaled result
    if (isDownscale) {
        const STRENGTH = 0.3;
        for (let y = 1; y < targetH - 1; y++) {
            for (let x = 1; x < targetW - 1; x++) {
                const ci = (y * targetW + x) << 2;
                if (dd[ci + 3] === 0) continue;
                const t = ci - (targetW << 2);
                const b = ci + (targetW << 2);
                for (let c = 0; c < 3; c++) {
                    const sharp   = 5 * dd[ci + c] - dd[t + c] - dd[b + c] - dd[ci - 4 + c] - dd[ci + 4 + c];
                    const blended = dd[ci + c] + (sharp - dd[ci + c]) * STRENGTH;
                    dd[ci + c]    = blended < 0 ? 0 : blended > 255 ? 255 : (blended + 0.5) | 0;
                }
            }
        }
    }

    console.log(
        '^2[uz_AutoShot]^0 Crop+Resize: ' + src.width + 'x' + src.height +
        ' -> ' + cropW + 'x' + cropH +
        ' -> ' + targetW + 'x' + targetH +
        (isDownscale ? ' (area avg + sharpen)' : ' (bilinear)')
    );
    return PNG.sync.write(dst, { colorType: 6 });
}

// ════════════════════════════════════════════════════════
// CAPTURE EVENT HANDLER
// ════════════════════════════════════════════════════════

const MAX_PAYLOAD_BYTES = 20 * 1024 * 1024;

onNet('uz_autoshot:server:processCapture', (payload) => {
    const src = source;
    if (!checkAce(src)) {
        console.log('^1[uz_AutoShot]^0 Refused capture: player ' + src + ' lacks ' + ACE_NAME);
        return;
    }
    if (!payload || typeof payload !== 'object') return;

    const xFilename  = typeof payload.filename  === 'string' ? payload.filename  : '';
    const wantFormat = typeof payload.format    === 'string' ? payload.format.toLowerCase() : 'png';
    const wantTransp = payload.transparent === true || payload.transparent === '1' || payload.transparent === 1;
    const chromaKey  = typeof payload.chromaKey === 'string' ? payload.chromaKey.toLowerCase() : 'green';
    const wantWidth  = parseInt(payload.width)  || 0;
    const wantHeight = parseInt(payload.height) || 0;

    // AutoCrop params forwarded from client Customize table
    const wantAutoCrop      = payload.autoCrop === true;
    const autoCropPadding   = parseInt(payload.autoCropPadding)   || 8;
    const autoCropThreshold = parseInt(payload.autoCropThreshold) || 10;
    const autoCropMode      = typeof payload.autoCropMode === 'string' ? payload.autoCropMode : 'alpha';

    const imageData = payload.imageData;

    if (!xFilename || /[\\/]\.\.(?:[\\/]|$)/.test(xFilename) || path.isAbsolute(xFilename)) {
        console.log('^1[uz_AutoShot]^0 Refused capture: invalid filename: ' + xFilename);
        return;
    }
    if (typeof imageData !== 'string' || imageData.length === 0) {
        console.log('^1[uz_AutoShot]^0 Refused capture: empty image data for ' + xFilename);
        return;
    }
    if (imageData.length > Math.ceil(MAX_PAYLOAD_BYTES * 4 / 3) + 64) {
        console.log('^1[uz_AutoShot]^0 Refused capture: payload too large for ' + xFilename);
        return;
    }

    try {
        let outputData = Buffer.from(stripDataUri(imageData), 'base64');
        if (!outputData || outputData.length === 0) {
            console.log('^1[uz_AutoShot]^0 Refused capture: invalid base64 for ' + xFilename);
            return;
        }

        let ext = wantFormat;

        // ── Step 1: Chroma key removal ───────────────────────
        if (wantTransp) {
            try {
                outputData = removeChromaKey(outputData, chromaKey);
                ext = 'png';
            } catch (e) {
                console.log('^3[uz_AutoShot]^0 Chroma key skipped: ' + e.message);
            }
        }

        // ── Step 2a: AutoCrop path ────────────────────────────
        // autoCrop requires a PNG with valid alpha (i.e. TransparentBg = true).
        // When enabled it replaces the old centre-crop resize with:
        //   autoCropPNG()  → tight bbox trim around the subject
        //   fitToCanvas()  → scale to fit output size, centred, transparent bg
        if (wantAutoCrop && ext === 'png') {
            try {
                outputData = autoCropPNG(outputData, autoCropThreshold, autoCropPadding, autoCropMode);
            } catch (e) {
                console.log('^3[uz_AutoShot]^0 AutoCrop skipped: ' + e.message);
            }

            if (wantWidth > 0 && wantHeight > 0) {
                const MAX_DIM  = 4096;
                const clampedW = Math.min(Math.max(wantWidth,  16), MAX_DIM);
                const clampedH = Math.min(Math.max(wantHeight, 16), MAX_DIM);
                try {
                    outputData = fitToCanvas(outputData, clampedW, clampedH);
                } catch (e) {
                    console.log('^3[uz_AutoShot]^0 FitToCanvas skipped: ' + e.message);
                }
            }

        // ── Step 2b: Original centre-crop + resize path ───────
        } else if (wantWidth > 0 && wantHeight > 0 && ext === 'png') {
            const MAX_DIM  = 4096;
            const clampedW = Math.min(Math.max(wantWidth,  16), MAX_DIM);
            const clampedH = Math.min(Math.max(wantHeight, 16), MAX_DIM);
            try {
                outputData = resizePNG(outputData, clampedW, clampedH);
            } catch (e) {
                console.log('^3[uz_AutoShot]^0 Resize skipped: ' + e.message);
            }

        } else if (wantWidth > 0 && wantHeight > 0 && ext !== 'png') {
            console.log('^3[uz_AutoShot]^0 Resize requires PNG format; skipping for ' + ext);
        }

        // ── Step 3: Write to disk ─────────────────────────────
        const outputPath = path.resolve(path.join(OUTPUT_DIR, xFilename + '.' + ext));
        if (!outputPath.startsWith(OUTPUT_DIR + path.sep)) {
            console.log('^1[uz_AutoShot]^0 Refused capture: path traversal blocked for ' + xFilename);
            return;
        }

        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(outputPath, outputData);

        const sizeKB = Math.round(outputData.length / 1024);
        const label  = wantAutoCrop ? 'autocrop+fit' : wantTransp ? 'bg removed' : ext;
        console.log('^2[uz_AutoShot]^0 Saved: ' + xFilename + '.' + ext + ' (' + sizeKB + ' KB, ' + label + ')');

    } catch (err) {
        console.log('^1[uz_AutoShot]^0 Process error: ' + (err && err.message ? err.message : err));
    }
});

// ════════════════════════════════════════════════════════
// ROUTING BUCKET HELPERS
// ════════════════════════════════════════════════════════

onNet('uz_autoshot:server:setBucket', (bucket) => {
    const src = source;
    if (!checkAce(src)) {
        console.log('^1[uz_AutoShot]^0 Refused setBucket: player ' + src + ' lacks ' + ACE_NAME);
        return;
    }
    SetPlayerRoutingBucket(src.toString(), bucket);
    console.log('^2[uz_AutoShot]^0 Player ' + src + ' -> bucket ' + bucket);
});

onNet('uz_autoshot:server:resetBucket', () => {
    const src = source;
    if (!checkAce(src)) {
        console.log('^1[uz_AutoShot]^0 Refused resetBucket: player ' + src + ' lacks ' + ACE_NAME);
        return;
    }
    SetPlayerRoutingBucket(src.toString(), 0);
    console.log('^2[uz_AutoShot]^0 Player ' + src + ' -> bucket 0');
});

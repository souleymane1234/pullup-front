/** @param {string} filename @param {Blob} blob */
export function saveFile(filename, blob) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 4000);
}

/** @param {string} text */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }
    area.remove();
    return copied;
  }
}

/**
 * Recadre une image en carré (cadrage légèrement haut pour garder le visage) et renvoie une data URL JPEG.
 * @param {File} file
 * @param {number} [size]
 * @returns {Promise<string>}
 */
export function cropSquare(file, size = 320) {
  return new Promise((resolve, reject) => {
    if (!/^image\//.test(file.type)) {
      reject(new Error('Choisissez une image (jpg, png, webp).'));
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      reject(new Error('Image trop lourde : 12 Mo maximum.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Image illisible.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Image illisible.'));
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const side = Math.min(image.width, image.height);
        canvas.getContext('2d').drawImage(
          image,
          (image.width - side) / 2,
          (image.height - side) * 0.3,
          side,
          side,
          0,
          0,
          size,
          size,
        );
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/** @param {string[][]} rows */
export function toCsv(rows) {
  return `\ufeff${rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';')).join('\n')}`;
}

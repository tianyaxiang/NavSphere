export function uint8ArrayToBase64(data: Uint8Array): string {
    let binary = '';
    const len = data.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(data[i]);
    }
    return btoa(binary);
}

export function stringToBase64(str: string): string {
    // Handle UTF-8 strings correctly
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    return uint8ArrayToBase64(data);
}

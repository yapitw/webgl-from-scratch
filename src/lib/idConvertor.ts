export const id2rgb = (id: number) => {
    const r = (id >> 16) & 0xff
    const g = (id >> 8) & 0xff
    const b = id & 0xff
    return [r, g, b]
}

export const rgb2id = (rgb: number[] | Uint8Array) => {
    const [r, g, b] = rgb
    return (r << 16) + (g << 8) + b
}

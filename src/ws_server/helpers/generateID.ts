export const generateID = (prefix: string) => {
    return `${prefix}_${Date.now().toString(36) + Math.random().toString(36).slice(2)}`
}
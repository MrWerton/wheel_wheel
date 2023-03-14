export function isALetter(letter: string): boolean {
    if (letter.length != 1) {
        return false
    }

    if (/^[a-zA-Z]$/.test(letter)) {
        return true
    }

    return false
}
import argon2 from 'argon2'
import kdbxweb from 'kdbxweb'

/**
 * Convert single character string to trit array
 * @param {string} char - Input character
 * @returns {array} Output trit array
 */
export const charToByte = (char: string): number => '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(char.toUpperCase())

/**
 * Bind kdbxweb and argon2
 */
kdbxweb.CryptoEngine.argon2 = (password, salt, memory, iterations, length, parallelism, type, version) =>
    argon2.hash(password, {
        hashLength: length,
        timeCost: iterations,
        memoryCost: memory,
        parallelism,
        type,
        version,
        salt: Buffer.from(salt),
        raw: true,
    })

/**
 * Get seed from encrypt KDBX database
 *
 * @method importVault
 *
 * @param {arrayBuffer} Db - Encrypted binary KDBX database
 * @param {string} Password - Plain text password for decryption
 *
 * @returns {string} seed
 */
export const importVault = async (buffer: Buffer, password: string): Promise<string> => {
    const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(password))

    const db = await kdbxweb.Kdbx.load(buffer, credentials)

    const { entries } = db.getDefaultGroup()

    if (!entries.length) {
        throw new Error('No seed found.')
    }

    // NOTE: This implementation is different from the one done in Trinity
    // https://github.com/iotaledger/trinity-wallet/blob/develop/src/desktop/native/libs/kdbx.js#L57-L67
    // It only expects a single seed in seedvault file and returns the seed in plain text (rather than in bytes)
    return entries[0].fields.Seed.getText()
}

/**
 * Check for valid KDBX database format
 *
 * @method checkFormat
 *
 * @param {buffer} Buffer - Encrypted binary KDBX database file content
 *
 * @returns {boolean}
 */
export const checkFormat = (buffer: Buffer): boolean => {
    const signature = buffer.byteLength < 8 ? null : new Uint32Array(buffer, 0, 2)

    if (!signature || signature[0] !== kdbxweb.Consts.Signatures.FileMagic) {
        return false
    }

    if (signature[1] === kdbxweb.Consts.Signatures.Sig2Kdb) {
        return false
    }

    if (signature[1] !== kdbxweb.Consts.Signatures.Sig2Kdbx) {
        return false
    }

    return true
}

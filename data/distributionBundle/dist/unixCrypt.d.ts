/**
 * Implements the Unix crypt(3) DES-based hash.
 * @param givenPassword - The string to hash.
 * @param givenSalt - The salt to use (two character string from
 * [a-zA-Z0-9./]).
 * @param returnBytes - If "true", return an array of bytes or a string
 * otherwise.
 * @returns Returns crypted or encrypted buffer or string.
 */
export declare function unixCrypt(givenPassword: Array<number> | string, givenSalt?: Array<number> | string, returnBytes?: boolean): Array<number> | string;
export default unixCrypt;

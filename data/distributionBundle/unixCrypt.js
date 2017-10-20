// @flow
// #!/usr/bin/env node
// -*- coding: utf-8 -*-
/** @module unixCrypt */
'use strict'
/* !
    region header
    [Project page](http://torben.website/webNode)

    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See http://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
/**
 * Unix crypt(3) javascript implementation
 *
 * Straightforward implementation of the DES-based Unix crypt(3) hash, based
 * largely on crypt.c in the Seventh Edition Unix distribution released by
 * Caldera Systems under a BSD-style license.
 */
export default (():Function => {
    // Initial permutation:
    const IP:Array<number> = [
        58, 50, 42, 34, 26, 18, 10, 2,
        60, 52, 44, 36, 28, 20, 12, 4,
        62, 54, 46, 38, 30, 22, 14, 6,
        64, 56, 48, 40, 32, 24, 16, 8,
        /* eslint-disable no-multi-spaces */
        57, 49, 41, 33, 25, 17,  9, 1,
        /* eslint-enable no-multi-spaces */
        59, 51, 43, 35, 27, 19, 11, 3,
        61, 53, 45, 37, 29, 21, 13, 5,
        63, 55, 47, 39, 31, 23, 15, 7
    ]
    // Final permutation, FP = IP^(-1)
    const FP:Array<number> = [
        40, 8, 48, 16, 56, 24, 64, 32,
        39, 7, 47, 15, 55, 23, 63, 31,
        38, 6, 46, 14, 54, 22, 62, 30,
        37, 5, 45, 13, 53, 21, 61, 29,
        36, 4, 44, 12, 52, 20, 60, 28,
        35, 3, 43, 11, 51, 19, 59, 27,
        34, 2, 42, 10, 50, 18, 58, 26,
        /* eslint-disable no-multi-spaces */
        33, 1, 41,  9, 49, 17, 57, 25
        /* eslint-enable no-multi-spaces */
    ]
    /*
     * Permuted-choice 1 from the key bits to yield C and D.
     * NOTE: that bits 8,16... are left out: They are intended for a parity
     * check.
     */
    const PC1_C:Array<number> = [
        57, 49, 41, 33, 25, 17, 9,
        /* eslint-disable indent */
         1, 58, 50, 42, 34, 26, 18,
        /* eslint-disable no-multi-spaces */
        10,  2, 59, 51, 43, 35, 27,
        19, 11,  3, 60, 52, 44, 36
        /* eslint-enable indent,no-multi-spaces */
    ]
    const PC1_D:Array<number> = [
        63, 55, 47, 39, 31, 23, 15,
        /* eslint-disable indent */
         7, 62, 54, 46, 38, 30, 22,
        /* eslint-disable no-multi-spaces */
        14,  6, 61, 53, 45, 37, 29,
        21, 13,  5, 28, 20, 12,  4
        /* eslint-enable indent,no-multi-spaces */
    ]
    // Sequence of shifts used for the key schedule.
    const shifts:Array<number> = [
        1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1
    ]
    /*
     * Permuted-choice 2, to pick out the bits from the CD array that generate
       the key schedule.
     */
    const PC2_C:Array<number> = [
        /* eslint-disable indent,no-multi-spaces */
        14, 17, 11, 24,  1,  5,
         3, 28, 15,  6, 21, 10,
        23, 19, 12,  4, 26,  8,
        16,  7, 27, 20, 13,  2
        /* eslint-enable indent,no-multi-spaces */
    ]
    const PC2_D:Array<number> = [
        41, 52, 31, 37, 47, 55,
        30, 40, 51, 45, 33, 48,
        44, 49, 39, 56, 34, 53,
        46, 42, 50, 36, 29, 32
    ]
    // The C and D arrays used to calculate the key schedule.
    const C:Array<number> = []
    const D:Array<number> = []
    // The key schedule. Generated from the key.
    const keySchedule:Array<Array<number>> = []
    for (let index:number = 0; index < 16; index++)
        keySchedule[index] = []
    // Set up the key schedule from the key.
    const setKey:Function = (key:Array<number>):void => {
        /*
         * First, generate C and D by permuting the key. The low order bit of
         * each 8-bit char is not used, so C and D are only 28 bits apiece.
         */
        for (let index = 0; index < 28; index++) {
            C[index] = key[PC1_C[index] - 1]
            D[index] = key[PC1_D[index] - 1]
        }
        /*
         * To generate Ki, rotate C and D according to schedule and pick up a
         * permutation using PC2.
         */
        for (let index:number = 0; index < 16; index++) {
            // Rotate
            for (
                let subIndex:number = 0; subIndex < shifts[index]; subIndex++
            ) {
                let t:number = C[0]
                for (
                    let subSubIndex:number = 0; subSubIndex < 28 - 1;
                    subSubIndex++
                )
                    C[subSubIndex] = C[subSubIndex + 1]
                C[27] = t
                t = D[0]
                for (
                    let subSubIndex:number = 0; subSubIndex < 28 - 1;
                    subSubIndex++
                )
                    D[subSubIndex] = D[subSubIndex + 1]
                D[27] = t
            }
            // get Ki. Note C and D are concatenated.
            for (let subIndex:number = 0; subIndex < 24; subIndex++) {
                keySchedule[index][subIndex] = C[PC2_C[subIndex] - 1]
                keySchedule[index][subIndex + 24] = D[PC2_D[subIndex] - 28 - 1]
            }
        }
    }
    // The E bit-selection table.
    const E:Array<number> = []
    const e:Array<number> = [
        /* eslint-disable indent,no-multi-spaces */
        32,  1,  2,  3,  4,  5,
         4,  5,  6,  7,  8,  9,
         8,  9, 10, 11, 12, 13,
        12, 13, 14, 15, 16, 17,
        16, 17, 18, 19, 20, 21,
        20, 21, 22, 23, 24, 25,
        24, 25, 26, 27, 28, 29,
        28, 29, 30, 31, 32,  1
        /* eslint-enable indent,no-multi-spaces */
    ]
    /*
     * The 8 selection functions. For some reason, they give a 0-origin index,
     * unlike everything else.
     */
    const S:Array<Array<number>> = [
        [
            /* eslint-disable indent,no-multi-spaces */
            14,  4, 13, 1,  2, 15, 11,  8,  3, 10,  6, 12,  5,  9, 0,  7,
             0, 15,  7, 4, 14,  2, 13,  1, 10,  6, 12, 11,  9,  5, 3,  8,
             4,  1, 14, 8, 13,  6,  2, 11, 15, 12,  9,  7,  3, 10, 5,  0,
            15, 12,  8, 2,  4,  9,  1,  7,  5, 11,  3, 14, 10,  0, 6, 13
            /* eslint-enable indent,no-multi-spaces */
        ],
        [
            /* eslint-disable indent,no-multi-spaces */
            15, 1,   8, 14,  6, 11, 3,  4,  9, 7,  2, 13, 12, 0,  5, 10,
             3, 13,  4,  7, 15,  2, 8, 14, 12, 0,  1, 10,  6, 9, 11,  5,
             0, 14,  7, 11, 10,  4, 13, 1,  5, 8, 12,  6,  9, 3,  2, 15,
            13,  8, 10,  1,  3, 15,  4, 2, 11, 6,  7, 12,  0, 5, 14, 9
            /* eslint-enable indent,no-multi-spaces */
        ],
        [
            /* eslint-disable indent,no-multi-spaces */
            10,  0,  9, 14, 6,  3, 15,  5,  1, 13, 12,  7, 11,  4,  2,  8,
            13,  7,  0,  9, 3,  4,  6, 10,  2,  8,  5, 14, 12, 11, 15,  1,
            13,  6,  4,  9, 8, 15,  3,  0, 11,  1,  2, 12,  5, 10, 14,  7,
             1, 10, 13,  0, 6,  9,  8,  7,  4, 15, 14,  3, 11,  5,  2, 12
            /* eslint-enable indent,no-multi-spaces */
        ],
        [
            /* eslint-disable indent,no-multi-spaces */
            7,  13, 14, 3,  0,  6,  9, 10,  1, 2, 8,  5, 11, 12,  4, 15,
            13,  8, 11, 5,  6, 15,  0,  3,  4, 7, 2, 12,  1, 10, 14,  9,
            10,  6,  9, 0, 12, 11,  7, 13, 15, 1, 3, 14,  5,  2,  8,  4,
             3, 15,  0, 6, 10,  1, 13,  8,  9, 4, 5, 11, 12,  7,  2, 14
            /* eslint-enable indent,no-multi-spaces */
        ],
        [
            /* eslint-disable indent,no-multi-spaces */
             2, 12,  4,  1,  7, 10, 11,  6,  8,  5, 3,  15, 13, 0, 14,  9,
            14, 11,  2, 12,  4,  7, 13,  1,  5,  0, 15, 10,  3, 9,  8,  6,
             4,  2,  1, 11, 10, 13,  7,  8, 15,  9, 12,  5,  6, 3,  0, 14,
            11,  8, 12,  7,  1, 14,  2, 13,  6, 15,  0,  9, 10, 4,  5, 3
            /* eslint-enable indent,no-multi-spaces */
        ],
        [
            /* eslint-disable indent,no-multi-spaces */
            12,  1, 10, 15, 9,  2,  6,  8,  0, 13,  3,  4, 14,  7,  5, 11,
            10, 15,  4,  2, 7, 12,  9,  5,  6,  1, 13, 14,  0, 11,  3,  8,
             9, 14, 15,  5, 2,  8, 12,  3,  7,  0,  4, 10,  1, 13, 11,  6,
             4, 3,   2, 12, 9,  5, 15, 10, 11, 14,  1,  7,  6,  0,  8, 13
            /* eslint-enable indent,no-multi-spaces */
        ],
        [
            /* eslint-disable indent,no-multi-spaces */
             4, 11,  2, 14, 15, 0,  8, 13, 3,  12, 9,  7,  5, 10, 6,  1,
            13,  0, 11,  7,  4, 9,  1, 10, 14,  3, 5, 12,  2, 15, 8,  6,
             1,  4, 11, 13, 12, 3,  7, 14, 10, 15, 6,  8,  0,  5, 9,  2,
             6, 11, 13,  8,  1, 4, 10,  7,  9,  5, 0, 15, 14,  2, 3, 12
            /* eslint-enable indent,no-multi-spaces */
        ],
        [
            /* eslint-disable indent,no-multi-spaces */
            13,  2,  8, 4,  6, 15, 11,  1, 10,  9,  3, 14,  5,  0, 12,  7,
             1, 15, 13, 8, 10,  3,  7,  4, 12,  5,  6, 11,  0, 14,  9,  2,
             7, 11,  4, 1,  9, 12, 14,  2,  0,  6, 10, 13, 15,  3,  5,  8,
             2,  1, 14, 7,  4, 10,  8, 13, 15, 12,  9,  0,  3,  5,  6, 11
            /* eslint-enable indent,no-multi-spaces */
        ]
    ]
    // P is a permutation on the selected combination of the current L and key.
    const P:Array<number> = [
        /* eslint-disable indent,no-multi-spaces */
        16,  7, 20, 21,
        29, 12, 28, 17,
         1, 15, 23, 26,
         5, 18, 31, 10,
         2,  8, 24, 14,
        32, 27,  3,  9,
        19, 13, 30,  6,
        22, 11,  4, 25
        /* eslint-enable indent,no-multi-spaces */
    ]
    // The current block, divided into 2 halves.
    const L:Array<number> = []
    const R:Array<number> = []
    const tempL:Array<number> = []
    const f:Array<number> = []
    // The combination of the key and the input, before selection.
    const preS:Array<number> = []
    // The payoff: encrypt a block.
    const encrypt:Function = (
        block:Array<number>, edflag:boolean = false
    ):void => {
        // First, permute the bits in the input.
        const perm:Array<number> = []
        for (let index:number = 0; index < 64; index++)
            perm[index] = block[IP[index] - 1]
        for (let index:number = 0; index < 32; index++) {
            L[index] = perm[index]
            R[index] = perm[index + 32]
        }
        // Perform an encryption operation 16 times.
        for (let index:number = 0; index < 16; index++) {
            // Set direction
            const direction:number = edflag ? 15 - index : index
            // Save the R array, which will be the new L.
            for (let index:number = 0; index < 32; index++)
                tempL[index] = R[index]
            /*
             * Expand R to 48 bits using the E selector; exclusive-or with the
             * current key bits.
             */
            for (let index:number = 0; index < 48; index++)
                preS[index] = R[E[index] - 1] ^ keySchedule[direction][index]
            /*
             * The pre-select bits are now considered in 8 groups of 6 bits
             * each. The 8 selection functions map these 6-bit quantities into
             * 4-bit quantities and the results permuted to make an f(R, K).
             * The indexing into the selection functions is peculiar; it could
             * be simplified by rewriting the tables.
             */
            for (let index:number = 0; index < 8; index++) {
                let t:number = 6 * index
                const k:number = S[index][
                    (preS[t + 0] << 5) +
                    (preS[t + 1] << 3) +
                    (preS[t + 2] << 2) +
                    (preS[t + 3] << 1) +
                    (preS[t + 4] << 0) +
                    (preS[t + 5] << 4)
                ]
                t = 4 * index
                f[t + 0] = (k >> 3) & 0o1
                f[t + 1] = (k >> 2) & 0o1
                f[t + 2] = (k >> 1) & 0o1
                f[t + 3] = (k >> 0) & 0o1
            }
            /*
             * The new R is L ^ f(R, K). The f here has to be permuted first,
             * though.
             */
            for (let index:number = 0; index < 32; index++)
                R[index] = L[index] ^ f[P[index] - 1]
            // Finally, the new L (the original R) is copied back.
            for (let index = 0; index < 32; index++)
                L[index] = tempL[index]
        }
        // The output L and R are reversed.
        for (let index:number = 0; index < 32; index++) {
            const t:number = L[index]
            L[index] = R[index]
            R[index] = t
        }
        // The final output gets the inverse permutation of the very original.
        for (let index:number = 0; index < 32; index++) {
            perm[index] = L[index]
            perm[index + 32] = R[index]
        }
        for (let index:number = 0; index < 64; index++)
            block[index] = perm[FP[index] - 1]
    }
    // Transform a string to an array of bytes.
    const strToBytes:Function = (string:string):Array<number> => {
        const result:Array<number> = []
        for (let index:number = 0; index < string.length; index++)
            result[index] = string.charCodeAt(index)
        return result
    }
    const bytesToStr:Function = (bytes:Array<number>):string =>
        String.fromCharCode(...bytes)
    /**
     * Implements the Unix crypt(3) DES-based hash.
     * @param password - The string to hash.
     * @param salt - The salt to use (two character string from [a-zA-Z0-9./]).
     * @param returnBytes - If "true", return an array of bytes or a string
     * otherwise.
     * @returns Returns crypted or encrypted buffer or string.
     */
    return (
        password:Array<number>|string, salt:Array<number>|string = 'aa',
        returnBytes:boolean = false
    ):Array<number>|string => {
        if (typeof password === 'string')
            password = strToBytes(password)
        if (typeof salt === 'string') {
            if (salt === '')
                salt = 'aa'
            salt = strToBytes(salt)
        }
        const block:Array<number> = []
        const iobuf:Array<number> = []
        for (let index:number = 0; index < 66; index++)
            block[index] = 0
        let c:number
        for (
            let index:number = 0, otherIndex:number = 0;
            (c = password[otherIndex]) && index < 64;
            otherIndex++
        ) {
            for (let subIndex:number = 0; subIndex < 7; subIndex++, index++)
                block[index] = (c >> (6 - subIndex)) & 0o1
            index++
        }
        setKey(block)
        for (let index:number = 0; index < 66; index++)
            block[index] = 0
        for (let index:number = 0; index < 48; index++)
            E[index] = e[index]
        for (
            let index:number = 0, otherIndex:number = 0;
            index < 2; index++, otherIndex++
        ) {
            let c:number = salt[otherIndex]
            iobuf[index] = c
            if (c > 'Z'.charCodeAt(0))
                c -= 6
            if (c > '9'.charCodeAt(0))
                c -= 7
            c -= '.'.charCodeAt(0)
            for (let subIndex:number = 0; subIndex < 6; subIndex++)
                if ((c >> subIndex) & 0o1) {
                    const temp:number = E[6 * index + subIndex]
                    E[6 * index + subIndex] = E[6 * index + subIndex + 24]
                    E[6 * index + subIndex + 24] = temp
                }
        }
        for (let index:number = 0; index < 25; index++)
            encrypt(block)
        for (let index:number = 0; index < 11; index++) {
            c = 0
            for (let subIndex:number = 0; subIndex < 6; subIndex++) {
                c <<= 1
                c |= block[6 * index + subIndex]
            }
            c += '.'.charCodeAt(0)
            if (c > '9'.charCodeAt(0))
                c += 7
            if (c > 'Z'.charCodeAt(0))
                c += 6
            iobuf[index + 2] = c
        }
        if (iobuf[1] === 0)
            iobuf[1] = iobuf[0]
        return returnBytes ? iobuf : bytesToStr(iobuf)
    }
})()
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

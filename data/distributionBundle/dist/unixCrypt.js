import "core-js/modules/es.array.push.js";

;// external "core-js/modules/es.array.push.js"

;// ./src/unixCrypt.ts
// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module unixCrypt *//* !
    region header
    [Project page](https://tsickert.com/webNode)

    Copyright Torben Sickert (info["~at~"]tsickert.com) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 4.0 international license.
    See https://creativecommons.org/licenses/by/4.0/deed.de
    endregion
*//**
 * Unix crypt(3) JavaScript implementation.
 *
 * Straightforward implementation of the DES-based Unix crypt(3) hash, based
 * largely on crypt.c in the Seventh Edition Unix distribution released by
 * caldera systems under a BSD-style license.
 */// Initial permutation:
function _toConsumableArray(a){return _arrayWithoutHoles(a)||_iterableToArray(a)||_unsupportedIterableToArray(a)||_nonIterableSpread()}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(t,e){if(t){if("string"==typeof t)return _arrayLikeToArray(t,e);var o={}.toString.call(t).slice(8,-1);return"Object"===o&&t.constructor&&(o=t.constructor.name),"Map"===o||"Set"===o?Array.from(t):"Arguments"===o||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o)?_arrayLikeToArray(t,e):void 0}}function _iterableToArray(r){var e="undefined"!=typeof Symbol&&r[Symbol.iterator]||r["@@iterator"];if(Array.isArray(r)&&(null==e||e===("undefined"!=typeof Symbol&&[][Symbol.iterator])||e===[]["@@iterator"]))return r;if(null!=e){for(var t,o=[],a=e.call(r);!(t=a.next()).done;)o.push(t.value);return o}}function _arrayWithoutHoles(a){if(Array.isArray(a))return _arrayLikeToArray(a)}function _arrayLikeToArray(r,a){(null==a||a>r.length)&&(a=r.length);for(var e=0,n=Array(a);e<a;e++)n[e]=r[e];return n}var IP=[58,50,42,34,26,18,10,2,60,52,44,36,28,20,12,4,62,54,46,38,30,22,14,6,64,56,48,40,32,24,16,8,/* eslint-disable no-multi-spaces */57,49,41,33,25,17,9,1,/* eslint-enable no-multi-spaces */59,51,43,35,27,19,11,3,61,53,45,37,29,21,13,5,63,55,47,39,31,23,15,7];// Final permutation, FP = IP^(-1)
var FP=[40,8,48,16,56,24,64,32,39,7,47,15,55,23,63,31,38,6,46,14,54,22,62,30,37,5,45,13,53,21,61,29,36,4,44,12,52,20,60,28,35,3,43,11,51,19,59,27,34,2,42,10,50,18,58,26,/* eslint-disable no-multi-spaces */33,1,41,9,49,17,57,25/* eslint-enable no-multi-spaces */];/*
 * Permuted-choice 1 from the key bits to yield C and D.
 * NOTE: that bits 8,16... are left out: They are intended for a parity check.
 */var PC1_C=[57,49,41,33,25,17,9,/* eslint-disable indent */1,58,50,42,34,26,18,/* eslint-disable no-multi-spaces */10,2,59,51,43,35,27,19,11,3,60,52,44,36/* eslint-enable indent,no-multi-spaces */];var PC1_D=[63,55,47,39,31,23,15,/* eslint-disable indent */7,62,54,46,38,30,22,/* eslint-disable no-multi-spaces */14,6,61,53,45,37,29,21,13,5,28,20,12,4/* eslint-enable indent,no-multi-spaces */];// Sequence of shifts used for the key schedule.
var shifts=[1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];/*
 * Permuted-choice 2, to pick out the bits from the CD array that generate the
 * key schedule.
 */var PC2_C=[/* eslint-disable indent,no-multi-spaces */14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2/* eslint-enable indent,no-multi-spaces */];var PC2_D=[41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32];// The C and D arrays used to calculate the key schedule.
var C=[];var D=[];// The key schedule. Generated from the key.
var keySchedule=[];for(var index=0;index<16;index++)keySchedule[index]=[];// Set up the key schedule from the key.
var setKey=function setKey(key){/*
     * First, generate C and D by permuting the key. The low order bit of each
     * 8-bit char is not used, so C and D are only 28 bits apiece.
     */for(var _index=0;_index<28;_index++){C[_index]=key[PC1_C[_index]-1];D[_index]=key[PC1_D[_index]-1]}/*
     * To generate Ki, rotate C and D according to schedule and pick up a
     * permutation using PC2.
     */for(var _index2=0;_index2<16;_index2++){// Rotate
for(var subIndex=0;subIndex<shifts[_index2];subIndex++){var t=C[0];for(var subSubIndex=0;subSubIndex<28-1;subSubIndex++)C[subSubIndex]=C[subSubIndex+1];C[27]=t;t=D[0];for(var _subSubIndex=0;_subSubIndex<28-1;_subSubIndex++)D[_subSubIndex]=D[_subSubIndex+1];D[27]=t}// get Ki. Note C and D are concatenated.
for(var _subIndex=0;_subIndex<24;_subIndex++){keySchedule[_index2][_subIndex]=C[PC2_C[_subIndex]-1];keySchedule[_index2][_subIndex+24]=D[PC2_D[_subIndex]-28-1]}}};// The E bit-selection table.
var E=[];var e=[/* eslint-disable indent,no-multi-spaces */32,1,2,3,4,5,4,5,6,7,8,9,8,9,10,11,12,13,12,13,14,15,16,17,16,17,18,19,20,21,20,21,22,23,24,25,24,25,26,27,28,29,28,29,30,31,32,1/* eslint-enable indent,no-multi-spaces */];/*
 * The 8 selection functions. For some reason, they give a 0-origin index,
 * unlike everything else.
 */var S=[[/* eslint-disable indent,no-multi-spaces */14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7,0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8,4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0,15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13/* eslint-enable indent,no-multi-spaces */],[/* eslint-disable indent,no-multi-spaces */15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10,3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5,0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15,13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9/* eslint-enable indent,no-multi-spaces */],[/* eslint-disable indent,no-multi-spaces */10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8,13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1,13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7,1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12/* eslint-enable indent,no-multi-spaces */],[/* eslint-disable indent,no-multi-spaces */7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15,13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9,10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4,3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14/* eslint-enable indent,no-multi-spaces */],[/* eslint-disable indent,no-multi-spaces */2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9,14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6,4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14,11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3/* eslint-enable indent,no-multi-spaces */],[/* eslint-disable indent,no-multi-spaces */12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11,10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8,9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6,4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13/* eslint-enable indent,no-multi-spaces */],[/* eslint-disable indent,no-multi-spaces */4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1,13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6,1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2,6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12/* eslint-enable indent,no-multi-spaces */],[/* eslint-disable indent,no-multi-spaces */13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7,1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2,7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8,2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11/* eslint-enable indent,no-multi-spaces */]];// P is a permutation on the selected combination of the current L and key.
var P=[/* eslint-disable indent,no-multi-spaces */16,7,20,21,29,12,28,17,1,15,23,26,5,18,31,10,2,8,24,14,32,27,3,9,19,13,30,6,22,11,4,25/* eslint-enable indent,no-multi-spaces */];// The current block, divided into 2 halves.
var L=[];var R=[];var tempL=[];var f=[];// The combination of the key and the input, before selection.
var preS=[];// The payoff: encrypt a block.
var encrypt=function encrypt(block,edflag){if(edflag===void 0){edflag=false}// First, permute the bits in the input.
var perm=[];for(var _index3=0;_index3<64;_index3++)perm[_index3]=block[IP[_index3]-1];for(var _index4=0;_index4<32;_index4++){L[_index4]=perm[_index4];R[_index4]=perm[_index4+32]}// Perform an encryption operation 16 times.
for(var _index5=0;_index5<16;_index5++){// Set direction
var direction=edflag?15-_index5:_index5;// Save the R array, which will be the new L.
for(var _index6=0;_index6<32;_index6++)tempL[_index6]=R[_index6];/*
         * Expand R to 48 bits using the E selector; exclusive-or with the
         * current key bits.
         */for(var _index7=0;_index7<48;_index7++)preS[_index7]=R[E[_index7]-1]^keySchedule[direction][_index7];/*
         * The pre-select bits are now considered in 8 groups of 6 bits each.
         * The 8 selection functions map these 6-bit quantities into 4-bit
         * quantities and the results permuted to make an f(R, K). The
         * indexing into the selection functions is peculiar; it could be
         * simplified by rewriting the tables.
         */for(var _index8=0;_index8<8;_index8++){var t=6*_index8;var k=S[_index8][(preS[t/* + 0*/]<<5)+(preS[t+1]<<3)+(preS[t+2]<<2)+(preS[t+3]<<1)+(preS[t+4]<<0)+(preS[t+5]<<4)];t=4*_index8;f[t/* + 0*/]=k>>3&1;f[t+1]=k>>2&1;f[t+2]=k>>1&1;f[t+3]=k>>0&1}/*
         * The new R is L ^ f(R, K). The f here has to be permuted first,
         * though.
         */for(var _index9=0;_index9<32;_index9++)R[_index9]=L[_index9]^f[P[_index9]-1];// Finally, the new L (the original R) is copied back.
for(var _index0=0;_index0<32;_index0++)L[_index0]=tempL[_index0]}// The output L and R are reversed.
for(var _index1=0;_index1<32;_index1++){var _t=L[_index1];L[_index1]=R[_index1];R[_index1]=_t}// The final output gets the inverse permutation of the very original.
for(var _index10=0;_index10<32;_index10++){perm[_index10]=L[_index10];perm[_index10+32]=R[_index10]}for(var _index11=0;_index11<64;_index11++)block[_index11]=perm[FP[_index11]-1]};// Transform a string to an array of bytes.
var stringToBytes=function stringToBytes(string){var result=[];for(var _index12=0;_index12<string.length;_index12++)result[_index12]=string.charCodeAt(_index12);return result};var bytesToStr=function bytesToStr(bytes){return String.fromCharCode.apply(String,_toConsumableArray(bytes))};/**
 * Implements the Unix crypt(3) DES-based hash.
 * @param givenPassword - The string to hash.
 * @param givenSalt - The salt to use (two character string from
 * [a-zA-Z0-9./]).
 * @param returnBytes - If "true", return an array of bytes or a string
 * otherwise.
 * @returns Returns crypted or encrypted buffer or string.
 */function unixCrypt(givenPassword,givenSalt,returnBytes){if(givenSalt===void 0){givenSalt="aa"}if(returnBytes===void 0){returnBytes=false}var password=typeof givenPassword==="string"?stringToBytes(givenPassword):givenPassword;var salt=givenSalt;if(typeof givenSalt==="string"){if(givenSalt==="")givenSalt="aa";salt=stringToBytes(givenSalt)}var block=[];var iobuf=[];for(var _index13=0;_index13<66;_index13++)block[_index13]=0;var c;for(var _index14=0,otherIndex=0;(c=password[otherIndex])&&_index14<64;otherIndex++){for(var subIndex=0;subIndex<7;subIndex++,_index14++)block[_index14]=c>>6-subIndex&1;_index14++}setKey(block);for(var _index15=0;_index15<66;_index15++)block[_index15]=0;for(var _index16=0;_index16<48;_index16++)E[_index16]=e[_index16];for(var _index17=0,_otherIndex=0;_index17<2;_index17++,_otherIndex++){var _c=salt[_otherIndex];iobuf[_index17]=_c;if(_c>"Z".charCodeAt(0))_c-=6;if(_c>"9".charCodeAt(0))_c-=7;_c-=".".charCodeAt(0);for(var _subIndex2=0;_subIndex2<6;_subIndex2++)if(_c>>_subIndex2&1){var temp=E[6*_index17+_subIndex2];E[6*_index17+_subIndex2]=E[6*_index17+_subIndex2+24];E[6*_index17+_subIndex2+24]=temp}}for(var _index18=0;_index18<25;_index18++)encrypt(block);for(var _index19=0;_index19<11;_index19++){c=0;for(var _subIndex3=0;_subIndex3<6;_subIndex3++){c<<=1;c|=block[6*_index19+_subIndex3]}c+=".".charCodeAt(0);if(c>"9".charCodeAt(0))c+=7;if(c>"Z".charCodeAt(0))c+=6;iobuf[_index19+2]=c}if(iobuf[1]===0)iobuf[1]=iobuf[0];return returnBytes?iobuf:bytesToStr(iobuf)}/* harmony default export */ const src_unixCrypt = (unixCrypt);
export { src_unixCrypt as default, unixCrypt };

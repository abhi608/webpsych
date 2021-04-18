var nj = require('numjs');

// function norm( arr, clbk ) {
// 	var len = arr.length,
// 		t = 0,
// 		s = 1,
// 		r,
// 		val,
// 		abs,
// 		i;

// 	if ( !len ) {
// 		return null;
// 	}
// 	if ( clbk ) {
// 		for ( i = 0; i < len; i++ ) {
// 			val = clbk( arr[ i ], i );
// 			abs = ( val < 0 ) ? -val : val;
// 			if ( abs > 0 ) {
// 				if ( abs > t ) {
// 					r = t / val;
// 					s = 1 + s*r*r;
// 					t = abs;
// 				} else {
// 					r = val / t;
// 					s = s + r*r;
// 				}
// 			}
// 		}
// 	} else {
// 		for ( i = 0; i < len; i++ ) {
// 			val = arr[ i ];
// 			abs = ( val < 0 ) ? -val : val;
// 			if ( abs > 0 ) {
// 				if ( abs > t ) {
// 					r = t / val;
// 					s = 1 + s*r*r;
// 					t = abs;
// 				} else {
// 					r = val / t;
// 					s = s + r*r;
// 				}
// 			}
// 		}
// 	}
// 	return t * Math.sqrt( s );
// } 

// function tand(degrees) {
//     return Math.tan(degrees * Math.PI / 180);
// }

// function XYPixOfXYDeg(o, xyDeg){
//     let xyDegNew = [0, 0];
//     xyDegNew[0] = xyDeg[0] - o.nearPointXYDeg[0];
//     xyDegNew[1] = xyDeg[1] - o.nearPointXYDeg[1];
//     let rDeg = norm(xyDegNew);
//     let rPix = o.pixPerCm*o.viewingDistanceCm * tand(rDeg);
//     let xyPix=[0, 0];
//     if(rDeg > 0) {
//         xyPix[0] = xyDegNew[0]*rPix/rDeg;
//         xyPix[1] = xyDegNew[1]*rPix/rDeg;
//         xyPix[1] = -xyPix[1];
//     }
//     xyPix[0] += o.nearPointXYPix[0];
//     xyPix[1] += o.nearPointXYPix[1];
//     xyPix[0] = Math.round(xyPix[0]);
//     xyPix[1] = Math.round(xyPix[1]);
//     return xyPix;
// }

// let arr = [0.225, 0.225];
// let obj = {};
// obj.nearPointXYDeg = [0.225, 0.225];
// obj.nearPointXYPix = [0, 0];
// obj.viewingDistanceCm = 200;
// obj.pixPerCm = 37.7952755906;
// console.log(XYPixOfXYDeg(obj, arr));



var keylookup = {
    'backspace': 8,
    'tab': 9,
    'enter': 13,
    'shift': 16,
    'ctrl': 17,
    'alt': 18,
    'pause': 19,
    'capslock': 20,
    'esc': 27,
    'space': 32,
    'spacebar': 32,
    ' ': 32,
    'pageup': 33,
    'pagedown': 34,
    'end': 35,
    'home': 36,
    'leftarrow': 37,
    'uparrow': 38,
    'rightarrow': 39,
    'downarrow': 40,
    'insert': 45,
    'delete': 46,
    '0': 48,
    '1': 49,
    '2': 50,
    '3': 51,
    '4': 52,
    '5': 53,
    '6': 54,
    '7': 55,
    '8': 56,
    '9': 57,
    'a': 65,
    'b': 66,
    'c': 67,
    'd': 68,
    'e': 69,
    'f': 70,
    'g': 71,
    'h': 72,
    'i': 73,
    'j': 74,
    'k': 75,
    'l': 76,
    'm': 77,
    'n': 78,
    'o': 79,
    'p': 80,
    'q': 81,
    'r': 82,
    's': 83,
    't': 84,
    'u': 85,
    'v': 86,
    'w': 87,
    'x': 88,
    'y': 89,
    'z': 90,
    '0numpad': 96,
    '1numpad': 97,
    '2numpad': 98,
    '3numpad': 99,
    '4numpad': 100,
    '5numpad': 101,
    '6numpad': 102,
    '7numpad': 103,
    '8numpad': 104,
    '9numpad': 105,
    'multiply': 106,
    'plus': 107,
    'minus': 109,
    'decimal': 110,
    'divide': 111,
    'f1': 112,
    'f2': 113,
    'f3': 114,
    'f4': 115,
    'f5': 116,
    'f6': 117,
    'f7': 118,
    'f8': 119,
    'f9': 120,
    'f10': 121,
    'f11': 122,
    'f12': 123,
    '=': 187,
    ',': 188,
    '.': 190,
    '/': 191,
    '`': 192,
    '[': 219,
    '\\': 220,
    ']': 221
};

function convertKeyCodeToKeyCharacter(code) {
    for (var i in Object.keys(keylookup)) {
        if (keylookup[Object.keys(keylookup)[i]] == code) {
            return Object.keys(keylookup)[i];
        }
    }
    return undefined;
}

function getSizeInPx(deg) {
    let pixPerCm = 37.7952755906;
    return Math.round(Math.exp(deg) * pixPerCm);
}

function getSizeInDeg(pix) {
    let pixPerCm = 37.7952755906;
    return Math.log(pix / pixPerCm);
}

function getNewSymbol() {
    let low = 65, high = 90;
    let curSymbolCode = getRandomInt(65, 91);
    let retObj = {};
    retObj.symbol = convertKeyCodeToKeyCharacter(curSymbolCode).toUpperCase();
    retObj.keyCode = curSymbolCode;
    return retObj;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

for(let i=0; i<40; i++) {
    console.log(getNewSymbol());
}


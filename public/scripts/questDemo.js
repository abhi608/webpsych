var nj = require('numjs');
var math = require('mathjs');
var linear = require('everpolate').linear;
const QuickChart = require('quickchart-js');
class Quest {
    constructor(tGuess, tGuessSd, pThreshold, beta, delta, gamma, grain = 0.01, range = null, plotIt = false) {
        var dim;
        if(range == null) {
            dim = 500;
        } else {
            if(range <= 0) {
                throw "'range' must be greater than zero."
            }
            dim = range / grain;
            dim = 2 * Math.ceil(dim / 2.0);
        }
        this.updatePdf = true;
        this.warnPdf = true;
        this.normalizePdf = true;
        this.tGuess = tGuess;
        this.tGuessSd = tGuessSd;
        this.pThreshold = pThreshold;
        this.beta = beta;
        this.delta = delta;
        this.gamma = gamma;
        this.grain = grain;
        this.dim = dim;
        this.plotIt = true;
        this.recompute();
    }

    recompute() {
        if (this.updatePdf == null || this.updatePdf == undefined) {
            return;
        }

        if (this.gamma > this.pThreshold) {
            console.log(`WARNING: reducing gamma from ${this.gamma} to 0.5`);
            this.gamma = 0.5;
        }
        this.i = nj.arange(-this.dim / 2, this.dim / 2 + 1).selection.data;
        this.x = [];
        for (let index = 0; index < this.i.length; index++) {
            this.x.push(this.i[index] * this.grain);
        }
        this.pdf = [];
        for (let index = 0; index < this.x.length; index++) {
            this.pdf.push(Math.exp(-0.5 * Math.pow(this.x[index] / this.tGuessSd, 2)));
        }
        var temp = nj.sum(this.pdf);
        for (let index = 0; index < this.pdf.length; index++) {
            this.pdf[index] = this.pdf[index] / temp;
        }
        var i2 = nj.arange(-this.dim, this.dim + 1).selection.data;
        this.x2 = [];
        for (let index = 0; index < i2.length; index++) {
            this.x2.push(i2[index] * this.grain);
        }
        // handle large number calculation here
        this.p2 = [];
        for (let index = 0; index < this.x2.length; index++) {
            this.p2.push(this.delta * this.gamma + (1 - this.delta) * (1 - (1 - this.gamma) * calculation(-10, this.beta * this.x2[index])));
        }

        if(this.plotIt) {
            // plot(this.x2, this.p2)
            let tmpArr = [];
            for(let k=0; k<this.x2.length; k++) {
                tmpArr.push({"x": this.x2[k], "y": this.p2[k]});
            }
            plot([tmpArr], "./graphs/InitialPsychometricFunction.png", "Initial Psychometric Function", 1);
        }

        if((Math.min(this.p2[0], this.p2[this.p2.length - 1]) > this.pThreshold) || (Math.max(this.p2[0], this.p2[this.p2.length - 1]) < this.pThreshold)) {
            throw `psychometric function range [${Math.min(this.p2)} ${Math.max(this.p2)}] omits ${this.pThreshold} threshold`;
        }
        
        let index = findNonZero(diff(this.p2));
        if (index.length < 2) {
            throw `psychometric function has only ${index.length} strictly monotonic points`;
        }
        this.xThreshold = interp1(this.p2, this.x2, index, this.pThreshold);
        this.p2 = [];
        for (let index = 0; index < this.x2.length; index++) {
            this.p2.push(this.delta * this.gamma + (1 - this.delta) * (1 - (1 - this.gamma) * calculation(-10, this.beta * (this.x2[index] + this.xThreshold))));
        }
        
        let t1 = [];
        for(let i=0; i<this.p2.length; i++) {
            t1.push(1 - this.p2[i]);
        }
        this.s2 = fliplr([t1, this.p2]);
        if (!this.hasOwnProperty("intensity") || !this.hasOwnProperty("response")) {
            this.trialCount = 0;
            this.intensity = new Array(10000).fill(0);
            this.response = new Array(10000).fill(0);
        }

        var pL = this.p2[0];
        var pH = this.p2[this.p2.length - 1];
        let eps = Number.EPSILON; 
        var pE = pH * Math.log(pH + eps) - pL * Math.log(pL + eps) + (1 - pH + eps) * Math.log(1 - pH + eps) - (1 - pL + eps) * Math.log(1 - pL + eps);
        pE = 1 / (1 + Math.exp(pE / (pL - pH)));
        this.quantileOrder = (pE - pL) / (pH - pL);

        for(let k=0; k<this.trialCount; k++) {
            inten = Math.max(-1 * Math.pow(10, 10), Math.min(1 * Math.pow(10, 10), this.intensity[0]));
            ii = len(this.pdf) + this.i - round((inten - this.tGuess) / this.grain) - 1;
            if (ii[0] < 0) {
                ii = ii - ii[0];
            }
            if (ii[-1] >= this.s2[0].length) {
                ii = ii + this.s2[0].length - ii[-1] - 1;
            }
            iii = ii.astype(nj.int_);
            if (!nj.allclose(ii, iii)) {
                throw "truncation error";
            }

            for(let i=0; i<this.pdf.length; i++) {
                this.pdf[i] = this.pdf[i] * this.s2[this.response[k]][iii];
            }
            if (this.normalizePdf && ((k+1) % 100 == 0)) {
                this.pdf = normalize(this.pdf);
            }
        }
        if(this.normalizePdf) {
            this.pdf = normalize(this.pdf);
        }

    }

    quantile(quantileOrder = null) {
        if (quantileOrder == null) {
            quantileOrder = this.quantileOrder;
        }
        if(quantileOrder > 1 || quantileOrder < 0) {
            throw `quantileOrder ${quantileOrder} is outside range 0 to 1`;
        }
        let p = this.pdf.map((sum => value => sum += value)(0));
        // if (getinf(p[-1])[0].length) {
        //     throw "pdf is not finite";
        // }
        if(p[p.length-1] == 0) {
            throw "pdf is all zero";
        }
        let t = null;
        if(quantileOrder < p[0]) {
            t = this.tGuess + this.x[0];
            return t;
        }
        if(quantileOrder > p[p.length-1]) {
            t = this.tGuess + this.x[x.length-1];
            return t;
        }
        let tmp1 = JSON.parse(JSON.stringify(p));
        tmp1.unshift(-1);
        let index = findNonZero(greaterThanZero(diff(tmp1)));
        if (index.length < 2) {
            throw `pdf has only ${len(index)} nonzero point(s)`;
        }
        t = this.tGuess + interp1(p, this.x, index, quantileOrder * p[p.length-1]);
        return t;
    }

    simulate(tTest, tActual, plotIt = 0) {
        let x2min = Math.min(this.x2[0], this.x2[this.x2.length - 1]);
        let x2max = Math.max(this.x2[0], this.x2[this.x2.length - 1]);
        let t = Math.min(Math.max(tTest - tActual, x2min), x2max);
        let response = interp1(this.x2, this.p2, null, t) > Math.random();

        // plot graph here
        if(plotIt > 0) {
            let tc = t;
            const col = ['red', 'green'];
            let tmp = [];
            t = [];
            for(let i=0; i<this.trialCount; i++) {
                t.push(math.min(Math.max(this.intensity[i]-tActual, x2min), x2max));
            }
            let positive = null;
            let negative = null;
            let pcol = null; 
            if(plotIt == 2) {
                let tmp1 = [];
                for(let i=0; i<this.trialCount; i++) {
                    tmp1.push(this.response[i]);
                }
                positive = findGreaterThanZero(tmp1);
                negative = findLessThanEqualToZero(tmp1);
                pcol = 'rgb(0,128,0)';
            } else {
                positive = [...Array(this.trialCount).keys()];
                negative = [];
                pcol = 'rgb(0,0,0)';
            }

            // plot 1
            let data = [];
            let dataset = [];
            for(let i=0; i<this.x2.length; i++) {
                dataset.push({"x": this.x2[i]+tActual, "y": this.p2[i]});
            }
            let curObj = {
                showLine: true,
                fill: false,
                borderColor: 'rgb(0, 0, 139)',  // blue
                pointRadius: 0,
                data: dataset
            };
            data.push(curObj);
            
            // plot 2
            let tmp1 = [];
            dataset = [];
            for(let i=0; i<positive.length; i++) {
                tmp1.push(t[positive[i]]);
            }
            let tmp2 = interp1(this.x2, this.p2, null, tmp1);
            for(let i=0; i<tmp1.length; i++) {
                dataset.push({"x": tmp1[i] + tActual, "y": tmp2[i]});
            }
            curObj = {
                showLine: false,
                fill: false,
                pointBorderColor: pcol,  // green or black
                pointRadius: 5,
                data: dataset
            };
            data.push(curObj);

            // plot 3
            tmp1 = [];
            dataset = [];
            for(let i=0; i<negative.length; i++) {
                tmp1.push(t[negative[i]]);
            }
            tmp2 = interp1(this.x2, this.p2, null, tmp1);
            for(let i=0; i<tmp1.length; i++) {
                dataset.push({"x": tmp1[i] + tActual, "y": tmp2[i]});
            }
            curObj = {
                showLine: false,
                fill: false,
                pointBorderColor: 'rgb(255,0,0)',  // red
                pointRadius: 5,
                data: dataset
            };
            data.push(curObj);

            // plot 4
            tmp1 = [];
            for(let i=0; i<this.x2.length; i++) {
                tmp1.push(this.x2[i]+tActual);
            }
            tmp2 = interp1(tmp1, this.p2, null, tActual);
            dataset = [{"x": tActual, "y": tmp2}];
            curObj = {
                showLine: false,
                fill: false,
                pointRadius: 5,
                pointStyle: 'cross',
                pointBorderColor: 'rgb(255,255,0)',  // yellow
                data: dataset
            };
            data.push(curObj);

            // plot 5
            dataset = [{"x": tc+tActual, "y": interp1(this.x2, this.p2, null, tc)}];
            curObj = {
                showLine: false,
                fill: false,
                pointRadius: 5,
                pointStyle: 'rect',
                pointBorderColor: 'rgb(255,165,0)',  // orange
                data: dataset
            };
            data.push(curObj);
            if(response) return [1, data]; else return [0, data];
        }

        if(response) return 1; else return 0;
    }

    update(intensity, response) {
        if(response < 0 || response >= this.s2.length) {
            throw `response ${response} out of range 0 to ${this.s2.shape[0]}`;
        }
        if(this.updatePdf) {
            let inten = Math.max(-1*Math.pow(10, 10), Math.min(Math.pow(10, 10), intensity));
            let ii = []
            for(let k=0; k<this.i.length; k++) {
                ii.push(this.pdf.length + this.i[k] - Math.round((inten - this.tGuess) / this.grain) - 1);
            }
            if (ii[0] < 0 || ii[ii.length - 1] > this.s2[0].length) {
                if(this.warnPdf) {
                    low = (1 - this.pdf.length - this.i[0]) * this.grain + this.tGuess;
                    high = (this.s2[0].length - this.pdf.length - this.i[this.i.length - 1]) * this.grain + this.tGuess;
                    console.log(`WARNING: intensity ${intensity} out of range ${low} to ${high}. Pdf will be inexact.`);
                }
                if (ii[0] < 0) {
                    ii = ii - ii[0];
                } else {
                    ii = ii + this.s2[0].length - ii[ii.length - 1] - 1;
                }
            }
            let cur = []
            for(let k=0; k<ii.length; k++) {
                cur.push(this.s2[response][ii[k]]);
            }
            this.pdf = dotProduct(this.pdf, cur);
            if(this.normalizePdf) {
                this.pdf = normalize(this.pdf);
            }
        }
        if(this.trialCount + 1 > this.intensity.length) {
            for(let i=0; i<10000; i++) {
                this.intensity.push(0);
                this.response.push(0);
            }
        }
        this.intensity[this.trialCount] = intensity;
        this.response[this.trialCount] = response;
        this.trialCount = this.trialCount + 1;
    }

    mean() {
        let ret = this.tGuess + nj.sum(dotProduct(this.pdf, this.x)) / nj.sum(this.pdf);
        return ret;
    }

    sd() {
        let p = nj.sum(this.pdf);
        let expectation_x = nj.sum(dotProduct(this.pdf, this.x)) / p;
        let expectation_x2 = nj.sum(dotProduct(this.pdf, nthPow(this.x, 2))) / p;
        let sd = Math.sqrt(expectation_x2 - expectation_x*expectation_x);
        if(Number.isNaN(sd)) return 0;
        return sd;
    }
}

function nthPow(arr, n) {
    let ret = [];
    for(let i=0; i<arr.length; i++) {
        ret.push(Math.pow(arr[i], n));
    }
    return ret;
}

function dotProduct(arr1, arr2) {
    let ret = [];
    for(let i=0; i<arr1.length; i++) {
        ret.push(arr1[i] * arr2[i]);
    }
    return ret;
}

function greaterThanZero(arr) {
    let ret = [];
    for(let i=0; i<arr.length; i++) {
        if(arr[i] > 0) ret.push(1);
        else ret.push(0);
    }
    return ret;
}

function normalize(arr) {
    let s = nj.sum(arr);
    for(let i=0; i<arr.length; i++) {
        arr[i] = arr[i] / s;
    }
    return arr;
}

function fliplr(arr) {
    let ret = [];
    for(let i=0; i<arr.length; i++) {
        let tmp = [];
        for(let j=arr[i].length-1; j>=0; j--) {
            tmp.push(arr[i][j]);
        }
        ret.push(tmp);
    }
    return ret;
}

function interp1(x, y, idx, pred) {
    let tmpX = [];
    let tmpY = [];
    if(idx == null) {
        tmpX = x;
        tmpY = y;
    } else {
        for(let i=0; i<idx.length; i++) {
            tmpX.push(x[idx[i]]);
            tmpY.push(y[idx[i]]);
        }
    }
    let val = linear(pred, tmpX, tmpY);
    if(val.length == 1) return val[0];
    return val;
}

function calculation(base, exponent) {
    let tmp = null;
    if(base < 0) {
        tmp = math.exp(-1 * math.pow(-1 * base, exponent));
    } else {
        tmp = math.exp(math.pow(base, exponent));
    }
    // let tmp = math.exp(math.pow(base, exponent));
    let ret = null;
    try {
        ret = math.number(tmp);
    } catch (error) {
        ret = math.number(tmp.re);
    }
    if(ret  == 'Infinity' || ret == '-Infinity') return 0;
    return ret;
}

function diff(arr) {
    let tmp = [];
    for(let i=1; i<arr.length; i++) tmp.push(arr[i] - arr[i-1]);
    return tmp; 
}

function findNonZero(arr) {
    arr = (typeof arr != "undefined" && arr instanceof Array) ? arr : [arr]

    return arr.reduce((ret_arr, number, index) => {
        if (number != 0) ret_arr.push(index)
        return ret_arr
    }, [])
}

function findGreaterThanZero(arr) {
    arr = (typeof arr != "undefined" && arr instanceof Array) ? arr : [arr]

    return arr.reduce((ret_arr, number, index) => {
        if (number > 0) ret_arr.push(index)
        return ret_arr
    }, [])
}

function findLessThanEqualToZero(arr) {
    arr = (typeof arr != "undefined" && arr instanceof Array) ? arr : [arr]

    return arr.reduce((ret_arr, number, index) => {
        if (number <= 0) ret_arr.push(index)
        return ret_arr
    }, [])
}

function getSecsFunction() {
    let d = new Date();
    return d.getTime();
}

function getinf(x) {
    return findNonZero(isinf(x))
}

function isinf(arr) {
    arr = (typeof arr != "undefined" && arr instanceof Array) ? arr : [arr]

    return arr.reduce((ret_arr, number, index) => {
        if (isFinite(number)) {
            ret_arr.push(true)
        } else {
            ret_arr.push(false)
        }
        return ret_arr
    }, []);

}

function plot(dataPoints, fileName, title = "", type=null) {
    let dataset = [];
    if(type == 1) {
        for(let i=0; i<dataPoints.length; i++) {
            let curObj = {
                label: '',
                showLine: true,
                fill: false,
                pointRadius: 0,
                data: dataPoints[i]
            };
            dataset.push(curObj);
        }
    } else if(type == 2) {
        dataset = dataPoints;
    }
    
    const chart = new QuickChart();
    chart.setWidth(1500);
    chart.setHeight(1500);
    chart.setConfig({
        type: 'scatter',
        data: {
            datasets: dataset
        },
        options: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: title,
            },
        }
    });
    chart.toFile(fileName);
}

function demo() {
    console.log("Welcome to QuestDemo. Quest will now estimate an observer's threshold.\n");
    console.log("The intensity scale is abstract, but usually we think of it as representing\n");
    console.log("log contrast. \n");
    var animate = true; // change this to take user input
    console.log("\nQuest won't know, but in this demo we're testing a simulated observer. \n");
    var tActual = -2;  // change this to take user input
    console.log("Welcome to QuestDemo. Quest will now estimate an observer's threshold.\n");
    console.log("\nWhen you test a real human observer, instead of a simulated observer, \n");
    console.log("you won't know the true threshold. However you can still guess. You \n");
    console.log("must provide Quest with an initial threshold estimate as a mean and \n");
    console.log("standard deviation, which we call your 'guess' and 'sd'. Be generous \n");
    console.log("with the sd, as Quest will have trouble finding threshold if it's more\n");
    console.log("than one sd from your guess.\n");
    var tGuess = -1;  // change this to take user input
    var tGuessSd = 2;  // change this to take user input
    var pThreshold = 0.82;
    var beta = 3.5;
    var delta = 0.01;
    var gamma = 0.5;
    var q = new Quest(tGuess, tGuessSd, pThreshold, beta, delta, gamma);
    // console.log(q);
    q.normalizePdf = true;

    var trialsDesired = 40;
    var wrongRight = ["wrong", "right"];
    var timeZero = getSecsFunction();
    var arrToGraph = [];
    for (let k = 0; k < trialsDesired; k++) {
        tTest = q.quantile();
        timeSplit = getSecsFunction();
        let response = null;
        if(animate) {
            // plot figure here
            let tmpArr = q.simulate(tTest, tActual, 2);
            response = tmpArr[0];
            let data = tmpArr[1];
            plot(data, './graphs/psychometricFunc-Trial_' + (k+1) + '.png', 'Actual psychometric function, and the points tested.', 2);
        } else {
            response = q.simulate(tTest, tActual);
        }
        console.log(`Trial ${k+1} at ${tTest} is ${wrongRight[response]}`);
        timeZero = timeZero + getSecsFunction() - timeSplit;
        q.update(tTest, response);
        if(animate) {
            // plot figure here
            let tmpArr = [];
            for(let i=0; i<q.x.length; i++) {
                tmpArr.push({"x": q.x[i]+q.tGuess, "y": q.pdf[i]})
            }
            arrToGraph.push(tmpArr);
        }
    }
    plot(arrToGraph, './graphs/posteriorPDF.png', 'Posterior PDF', 1);
    // Print timing of results.
    console.log(`${1000*(getSecsFunction()-timeZero)/trialsDesired} ms/trial`);
    let t = q.mean();
    let sd = q.sd();
    console.log(`Final threshold estimate (mean+-sd) is ${t} +- ${sd}`);
}

demo();

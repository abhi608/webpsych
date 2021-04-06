class QuestObject {

    constructor(tGuess, tGuessSd, pThreshold, beta, delta, gamma, grain = 0.01, range = null) {
        // super(QuestObject, this).__init__()
        // grain = float(grain)

        var dim;
        if (range == null) {
            dim = 500;
        } else {
            if (range <= 0) {
                throw "argument range must be greater than zero.";
            }
            dim = range / grain;
            dim = 2 * Math.ceil(dim / 2.0);
        }

        this.updatePdf = true;
        this.warnPdf = true;
        this.normalizePdf = false;
        this.tGuess = tGuess;
        this.tGuessSd = tGuessSd;
        this.pThreshold = pThreshold;
        this.beta = beta;
        this.delta = delta;
        this.gamma = gamma;
        this.grain = grain;
        this.dim = dim;
        this.recompute();
    }





    beta_analysis(stream = null) {
        function _beta_analysis1(stream = null) {

            if (stream == null) {
                // CHECK
                stream = console.log;
            }

            q2 = [];


            for (let i = 1; i < 17; i++) {
                let q_copy = Object.assign({}, this);
                q_copy.beta = Math.pow(2,(i / 4.0));
                q_copy.dim = 250;
                q_copy.grain = 0.02;
                q_copy.recompute();
                q2.push(q_copy);
            }

            // Incomplete
            // t2    = nj.array([q2i.mean() for q2i in q2])
            // p2    = nj.array([q2i.pdf_at(t2i) for q2i,t2i in zip(q2,t2)])
            // sd2   = nj.array([q2i.sd() for q2i in q2])
            // beta2 = nj.array([q2i.beta for q2i in q2])

            i = nj.argsort(p2)[-1];

            t = t2[i];
            sd = q2[i].sd();

            p = nj.sum(p2);

            betaMean = nj.sum(p2 * beta2) / p;
            betaSd = Math.sqrt(nj.sum(p2 * Math.pow(beta2,2)) / p - Math.pow((nj.sum(p2 * beta2) / p), 2));
            iBetaMean = nj.sum(p2 / beta2) / p;
            iBetaSd = Math.sqrt(nj.sum(p2 / Math.pow(beta2,2)) / p - Math.pow((nj.sum(p2 / beta2) / p), 2));
            console.log(`${t} ${sd} ${1/iBetaMean} ${betaSd} ${this.gamma} \n`);

        }

        console.log("Now re-analyzing with beta as a free parameter. . . .");
        if (stream == Null) {
            stream = console.log;
        }
        // stream.write("logC 	 sd 	 beta	 sd	 gamma\n");
        _beta_analysis1(stream);

    }



    mean() {
        return this.tGuess + nj.sum(this.pdf * this.x) / nj.sum(this.pdf);
    }

    mode() {
        // CHECK HERE
        iMode = argsort(this.pdf)[this.pdf.length - 1];

        p = this.pdf[iMode];
        t = this.x[iMode] + this.tGuess;
        return t, p;
    }



    p(x) {
        if (x < this.x2[0]) {
            return this.x2[0];
        }
        if (x > this.x2[this.x2.length - 1]) {
            return this.x2[this.x2.length - 1];
        }

        return interp(x, this.x2, this.p2);
    }



    pdf_at(t) {
        i = Math.round((t - this.tGuess) / this.grain) + 1 + this.dim / 2;
        i = Math.min(this.pdf.length, Math.max(1, i)) - 1;
        p = this.pdf[i];
        return p;
    }



    quantile(quantileOrder = null) {
        if (quantileOrder == null) {
            quantileOrder = this.quantileOrder;
        }

        p = this.pdf.map((sum => value => sum += value)(0));

        if (getinf(p[-1])[0].length) {
            throw "pdf is not finite";
        }
        if (p[-1] == 0) {
            throw "pdf is all zero";
        }

        m1p = nj.concatenate(([-1], p));

        index = nonzero(m1p.slice(1) - m1p.slice(0, -1))[0];

        if (index.length < 2) {
            throw `pdf has only ${len(index)} nonzero point(s)`;
        }

        ires = interp([quantileOrder * p[p.length - 1]], p[index], this.x[index])[0];

        return this.tGuess + ires;

    }

    sd() {
        p = nj.sum(this.pdf);
        sd = (Math.sqrt(nj.sum(this.pdf * Math.pow(this.x, 2))) / (p - Math.pow((nj.sum(this.pdf * this.x) / p), 2)));
        return sd;
    }



    simulate(tTest, tActual) {
        t = Math.min(Math.max(tTest - tActual, this.x2[0]), this.x2[this.x2.length - 1]);
        response = interp([t], this.x2, this.p2)[0] > Math.random();
        return response;
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
        // this.x = this.i * this.grain;
        this.pdf = [];
        for (let index = 0; index < this.x.length; index++) {
            this.pdf.push(Math.exp(-0.5 * Math.pow(this.x[index] / this.tGuessSd, 2)));
        }
        var temp = nj.sum(this.pdf);
        for (let index = 0; index < this.pdf.length; index++) {
            this.pdf[index] = this.pdf[index] / nj.sum(this.pdf);
        }
        var i2 = nj.arange(-this.dim, this.dim + 1).selection.data;
        this.x2 = [];
        for (let index = 0; index < i2.length; index++) {
            this.x2.push(i2[index] * this.grain);
        }

        this.p2 = [];
        for (let index = 0; index < this.x2.length; index++) {
            this.p2.push(this.delta * this.gamma + (1 - this.delta) * (1 - (1 - this.gamma) * Math.exp(Math.pow(-10, (this.beta * this.x2[index])))));

        }

        console.log(this.i, this.x, this.pdf, this, i2, this.x2, this.p2);
        if (this.p2[0] >= this.pThreshold || this.p2[this.p2.length - 1] <= this.pThreshold) {
            throw `psychometric function range [${this.p2[0]} ${this.p2[this.p2.length - 1]}] omits ${this.pThreshold} threshold`;
        }
        // if(getinf(this.p2)[0].length){
        //     throw "psychometric function p2 xis not finite";
        // }

        let index = nonzero(this.p2.slice(1) - this.p2.slice(0, -1))[0];

        if (index.length < 2) {
            throw `psychometric function has only ${index.length} strictly monotonic points`;
        }

        this.xThreshold = interp([this.pThreshold], this.p2[index], this.x2[index])[0];
        this.p2 = this.delta * this.gamma + (1 - this.delta) * (1 - (1 - this.gamma) * nj.exp(Math.pow(-10, (this.beta * (this.x2 + this.xThreshold)))));

        // if(getinf(this.p2)[0].length){
        //     throw "psychometric function p2 is not finite";
        // }

        this.s2 = nj.array(((1 - this.p2).slice([null, null, -1]), this.p2.slice([null, null, -1])));

        if (!this.hasOwnProperty("intensity") || !this.hasOwnProperty("response")) {
            this.intensity = [];
            this.response = [];
        }

        if (getinf(this.s2)[0].length) {
            throw "psychometric function s2 is not finite";
        }

        eps = 1 * Math.pow(10, -14);

        pL = this.p2[0];
        pH = this.p2[this.p2.length - 1];

        pE = pH * Math.log(pH + eps) - pL * Math.log(pL + eps) + (1 - pH + eps) * Math.log(1 - pH + eps) - (1 - pL + eps) * Math.log(1 - pL + eps);
        pE = 1 / (1 + Math.exp(pE / (pL - pH)));
        this.quantileOrder = (pE - pL) / (pH - pL);

        if (getinf(this.pdf)[0].length) {
            throw "prior pdf is not finite";
        }

        for (x in zip(this.intensity, this.response)) {
            intensity = x[0];
            response = x[1];
            inten = Math.max(-1 * Math.pow(10, 10), Math.min(1 * Math.pow(10, 10), intensity));
            ii = len(this.pdf) + this.i - round((inten - this.tGuess) / this.grain) - 1;

            if (ii[0] < 0) {
                ii = ii - ii[0];
            }
            if (ii[-1] >= this.s2.shape[1]) {
                ii = ii + this.s2.shape[1] - ii[-1] - 1;
            }

            iii = ii.astype(nj.int_);

            if (!nj.allclose(ii, iii)) {
                throw "truncation error";
            }

            this.pdf = this.pdf * this.s2[response, iii];

            if (this.normalizePdf && k % 100 == 0) {
                this.pdf = this.pdf / nj.sum(this.pdf);

            }
        }


        if (this.normalizePdf) {
            this.pdf = this.pdf / nj.sum(this.pdf);
        }

        if (getinf(this.pdf)[0].length) {
            throw "prior pdf is not finite";
        }
    }



    update(intensity, response) {
        if (response < 0 || response > this.s2.shape[0]) {
            throw `response ${response} out of range 0 to ${this.s2.shape[0]}`;
        }
        if (this.updatePdf) {
            inten = Math.max(Math.pow(-1, 10), min(Math.pow(1, 10), intensity));

            ii = this.pdf.length + this.i - Math.round((inten - this.tGuess) / this.grain) - 1;

            if (ii[0] < 0 || ii[ii.length - 1] > this.s2.shape[1]) {
                if (this.warnPdf) {
                    low = (1 - this.pdf.length - this.i[0]) * this.grain + this.tGuess;

                    high = (this.s2.shape[1] - this.pdf.length - this.i[this.i.length - 1]) * this.grain + this.tGuess;

                    console.log(`WARNING: intensity ${intensity} out of range ${low} to ${high}. Pdf will be inexact.`);
                }

                if (ii[0] < 0) {
                    ii = ii - ii[0];
                } else {
                    ii = ii + this.s2.shape[1] - ii[ii.length - 1] - 1;
                }
            }

            iii = ii.astype(nj.int_);

            if (nj.allclose(ii, iii) != null) {
                throw "truncation error";
            }

            this.pdf = this.pdf * this.s2[response, iii];
            if (this.normalizePdf) {
                this.pdf = this.pdf / nj.sum(this.pdf);
            }
        }

        this.intensity.push(intensity);
        this.response.push(response);
    }




}

function demo() {
    console.log("The intensity scale is abstract, but usually we think of it as representing log contrast.")

    tActual = null;

    while (tActual == null) {
        console.log("Specify true threshold of simulated observer: ")
        inp = 0.4;
        try {
            tActual = inp;
        } catch (err) {
            pass;
        }
    }


    tGuess = null
    while (tGuess == null) {
        console.log("Estimate threshold: ")
        inp = 0.2;
        try {
            tGuess = inp;
        } catch (err) {
            pass;
        }
    }


    tGuessSd = 2.0;
    pThreshold = 0.82;
    beta = 3.5;
    delta = 0.01;
    gamma = 0.5;


    q = new QuestObject(tGuess, tGuessSd, pThreshold, beta, delta, gamma);

    console.log(q);
    trialsDesired = 100;
    wrongRight = ["wrong", "right"];
    d = new Date();
    timeZero = d.getTime();

    for (let k = 0; k < trialsDesired; k++) {

        // Get recommended level.  Choose your favorite algorithm.
        tTest = q.quantile()
        // tTest=q.mean()
        // tTest=q.mode()
        choices = [-0.1, 0, 0.1]


        tTest = tTest + choices[Math.floor(Math.random() * choices.length)]

        timeSplit = d.getTime();
        response = q.simulate(tTest, tActual)


        console.log(`Trial ${k+1} at ${tTest} is ${wrongRight[response]}`);

        timeZero = timeZero + d.getTime() - timeSplit;

        // Update the pdf
        q.update(tTest, response);
    }


    // Print results of timing.
    console.log(`${1000*(time.time()-timeZero)/trialsDesired} ms/trial`);

    // Get final estimate.
    t = q.mean();
    sd = q.sd();
    console.log(`Mean threshold estimate is ${t} +/- ${sd}`);
    // t=QuestMode(q);
    // console.log("Mode threshold estimate is %4.2f"%t)
    console.log(`\nQuest beta analysis. Beta controls the steepness of the Weibull function.\n`);
    q.beta_analysis();
    console.log(`Actual parameters of simulated observer:`);
    console.log(`logC	beta	gamma`);
    console.log(`${tActual}	${q.beta}	${q.gamma}`);

}


// Run demo 
demo()

// Helper functions

function zip() {
    var args = [].slice.call(arguments);
    var shortest = args.length == 0 ? [] : args.reduce(function (a, b) {
        return a.length < b.length ? a : b
    });

    return shortest.map(function (_, i) {
        return args.map(function (array) {
            return array[i]
        })
    });
}

function argsort(array) {

    const arrayObject = array.map((value, idx) => {
        return {
            value,
            idx
        };
    });

    arrayObject.sort((a, b) => {

        if (a.value < b.value) {

            return -1;

        }

        if (a.value > b.value) {

            return 1;

        }

        return 0;

    });

    const argIndices = arrayObject.map(data => data.idx);

    return argIndices;
}

function nonzero(arr) {
    arr = (typeof arr != "undefined" && arr instanceof Array) ? arr : [arr]

    return arr.reduce((ret_arr, number, index) => {
        if (number != 0) ret_arr.push(index)
        return ret_arr
    }, [])
}

function interp(value, r1, r2) {
    return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
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

function getinf(x) {
    return nonzero(isinf(x))
}

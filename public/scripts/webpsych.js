// CSV file loader
function LoadP5TableData(trials_data){
    var cond_obj = trials_data.getObject();
    var conditions = [];
    for (var val in cond_obj){
        var c = cond_obj[val];
        if (c != null){conditions.push(c);}
    }
    return conditions;
}

class Experiment{
    constructor(url = null, expname = ''){
        this.routines = [];
        this.currentRoutine = null;
        this.routineCounter = 0;
        this.server_url = url;
        this.data = [];
        this.currentTrial = {};
        this.expInfo = {};
        this.expname = expname;
    }
    
    addRoutine(routine){
        this.routines.push(routine);
    }

    start(){
        console.log('started')
        this.currentRoutine = this.routines[this.routineCounter];
        this.currentRoutine.setExperiment(this);
        this.currentRoutine.start();
    }

    nextRoutine(){
        if (this.routineCounter +1 == this.routines.length) {
            noLoop();
            this.computeQStats();
            this.sendData();
        } else{
            this.routineCounter += 1;
            this.currentRoutine = this.routines[this.routineCounter];
            this.currentRoutine.setExperiment(this);
            this.currentRoutine.start();
        }
    }

    update(){

        var next = this.currentRoutine.update();
        if (next){
            this.nextRoutine();
        }
    }

    setQ(q) {
        this.q = q;
    }

    computeQStats() {
        let mean = this.q.mean();
        let sd = this.q.sd();
        console.log("STATS: ", this.q, mean, sd);
    }

    addData(data){
        var row = Object.assign({}, this.currentTrial);
        for (var attr in this.expInfo) {row[attr] = this.expInfo[attr]; }
        for (var attr in data) {row[attr] = data[attr]; }
        this.data.push(row);
        console.log(this.data);
        console.log(row);
    }

    sendData(){
        var date = [year(), month(), day(), hour(), minute(), second()].join('-');
        if (this.server_url != null) {
            var curObj = {'title' : 'data', 'body' : this.data, 'date' : date, 'expname' : this.expname};
            console.log("EXPERIMENT: ", curObj);
            httpPost(this.server_url, 'text', JSON.stringify(curObj), function(result) {
                noLoop();
                background(255);
                fill(0);
                text('', width/3, height/3);
                text(result, width/2, height/1.5);
            });
        }
    }
}


class Routine{
    constructor(background = [255,255,255]){
        this.components = [];
        this.t_start = null;
        this.experiment = null;
        this.background = background;
    }

    setExperiment(experiment){
        this.experiment = experiment;
    }

    addComponent(component){
        this.components.push(component);
    }

    start(){
        this.t_start = millis();
        for (var i = 0; i< this.components.length; i++){
            this.components[i].start(this.t_start);
            this.components[i].setExperiment(this.experiment);
        }
    }

    update(){
        background(color(this.background));
        var finished = [];
        for (var i = 0; i< this.components.length; i++){
            var continueRoutine = this.components[i].update(this.t_start);
            this.components[i].draw();
            finished.push(this.components[i].finished);
        }
    
        if (continueRoutine == false){
            return true;
        }
    
        if (finished.every(x => x == true)){
            console.log(finished);
            return true;
        }
        return false;
    }

}

class Loop{
    constructor(conditions, nrep = 1, nTrials=null){
        this.nrep = nrep;
        this.conditions = [];
        for (var i = 0; i < this.nrep; i++){
            this.conditions = this.conditions.concat(conditions);
        }
        this.routines = [];
        this.currentTrial = conditions[0];
        this.experiment = null;
        this.routineCounter = 0;
        this.trialCounter = 0;
        this.currentRoutine = null;
        this.nTrials = nTrials;
    }

    setExperiment(experiment){
        this.experiment = experiment;
    }

    addRoutine(routine){
        this.routines.push(routine);
    }

    nextRoutine(){
        if (this.routineCounter + 1 == this.routines.length){
            if (this.trialCounter + 1 == this.conditions.length){
                return true;
            } else {
                this.routineCounter = 0;
                this.trialCounter += 1;
            }
        } else {
            this.routineCounter += 1;
        }
        this.currentTrial = this.conditions[this.trialCounter];
        this.currentRoutine = this.routines[this.routineCounter];
        this.currentRoutine.setExperiment(this.experiment);
        this.experiment.currentTrial = this.currentTrial;
        this.currentRoutine.start();
    }

    start(){
        this.currentRoutine = this.routines[this.routineCounter];
        this.currentRoutine.setExperiment(this.experiment);
        this.currentTrial = this.conditions[this.trialCounter];
        this.experiment.currentTrial = this.currentTrial;
        console.log(this.currentTrial);
        this.currentRoutine.start();
        
    }

    update(){
        var next = this.currentRoutine.update();
        if (next){
            return this.nextRoutine();
        }
    }

    addTrial(trial) {
        if(this.nTrials != null && this.conditions.length >= this.nTrials) return;
        this.conditions.push(trial);
    }
}


function setProperty(property){
    if (typeof property === "function"){
        return property();
    } else{
        return property;
    }
}



class BaseComponent{
    constructor({name, pos = [0.5, 0.5]} = {}){
        this.name = name;
        this.pos = setProperty(pos);
        this.experiment = null;
        this.routine = null;
    }

    setExperiment(experiment){
        this.experiment = experiment;
    }

    setRoutine(routine){
        this.routine = routine;
    }

    start(t_start){
        this.finished = null;
        this.t_start = t_start;
    }
}



class P5Component extends BaseComponent{
    constructor({name, pos, rotation = 0, timestart = 0, timestop = null} = {}){
        super({name, pos});
        this.rotation = rotation;
        this.timestart = timestart;
        this.timestop = timestop;
        this.t_start = null;
        this.finished = null;
    }

    drawDecorator(fun){
        if ((millis() - this.t_start > this.timestart)){
            if (this.timestop == null | (millis() - this.t_start) - this.timestop < 0 ){
                fun();
            }
        }
    }

    draw(){ }

    update(){
        for (var val in this.update_map){
            if (typeof this.update_map[val] !== 'undefined')
            {
                this[val] = setProperty(this.update_map[val]);
            }
        }
        if (this.timestop != null & (millis() - this.t_start) - this.timestop > 0 ){
            this.finished = true;
        }
        return true;
    }
}

class CodeComponent extends BaseComponent{
    constructor({name}){
        super({name});
        this.every_frame = [];
        this.at_the_start = [];
        this.finished = true;
    }

    start(t_start){
        for (var i = 0; i < this.at_the_start.length; i++){
            this.at_the_start[i]();
        }
    }

    update(){
        for (var i = 0; i < this.every_frame.length; i++){
            this.every_frame[i]();
        }
    }

    draw = function() {}
}

class TextStimulus extends P5Component{
    
    constructor({name,
        text,
        textFont = 'Helvetica',
        textSize = 32,
        pos,
        color = [0,0,0],
        rotation,
        timestart,
        timestop} = {}){
            super({name, pos, rotation, timestart, timestop});
            this.text = setProperty(text);
            this.color = setProperty(color);
            this.textSize = setProperty(textSize);
            this.textFont = setProperty(textFont);
            this.update_map = {'text' : text, 'textSize' : textSize, 'pos' : pos, 'color' : color, 'rotation': rotation, 'textFont': textFont};
        }

        draw(){
            var that = this;
            this.drawDecorator(function(){
                fill(color(that.color));
                textSize(that.textSize);
                textFont(that.textFont);
                textAlign(CENTER, CENTER);
                rectMode(CENTER);
                text(that.text, that.pos[0] * width, that.pos[1] * height, 2/3*width, 2/3*height);
            });
        }
    
}

class SoundStimulus extends P5Component{
    
    constructor({name,
        backgroundColor,
        sound,
        pos,
        rotation,
        timestart,
        timestop} = {}){
            super({name, pos, rotation, timestart, timestop});
            this.backgroundColor = setProperty(backgroundColor);
            this.sound = setProperty(sound);
            this.update_map = {'pos' : pos, 'rotation': rotation, 'sound': sound, 'backgroundColor': backgroundColor};
        }

        draw(){
            var that = this;
            this.drawDecorator(function(){
                that.sound.play();
                background(that.backgroundColor);
            });
        }
    
}

class QuestStats extends P5Component{
    
    constructor({name,
        q} = {}){
            super({name});
            this.q = q;
            this.update_map = {'q' : q};
        }

        draw(){
            // var that = this;
            // that.action;
            let mean = this.q.mean();
            let std = this.q.std();
            console.log("STATS: ", q, mean, std);
        }

        update() {
            this.finished = true;
            return true;
        }
    
}

class ImageStimulus extends P5Component{
    constructor({name,
        img,
        pos,
        rotation,
        timestop,
        timestart} = {}){
            super({name, pos, rotation, timestart, timestop})
            this.img = setProperty(img);
            this.update_map = {'img' : img, 'pos' : pos,  'rotation': rotation};
        }

    draw(){
            var that = this;
            this.drawDecorator(function() {
                    push();
                    translate(that.img.width/2 + that.pos[0]/2, that.img.height/2 + that.pos[1]/2);
                    rotate(radians(that.rotation));
                    imageMode(CENTER);
                    image(that.img, 0, 0);
                    pop();
            });
    }
    
}


class PolygonComponent extends P5Component{
    constructor({name,
        radius,
        n_v,
        pos,
        rotation,
        fill_color = [0,0,0],
        border_color = [0,0,0],
        timestart,
        timestop} = {}){
            super({name, pos, timestart, timestop});
            this.radius = setProperty(radius);
            this.n_v = setProperty(n_v);
            this.fill_color = setProperty(fill_color);
            this.border_color = setProperty(border_color);
            this.vectors = [];
            this.update_map = {'radius' : radius, 'n_v' : n_v, 'pos' : pos, 'rotation': rotation, 'fill_color' : fill_color, 'border_color' : border_color};
        }
    
        draw(){
            var that = this;
            this.drawDecorator(function(){
                        fill(that.fill_color);
                        var angle = TWO_PI / that.n_v;
                        beginShape();
                        this.vectors = [];
                        for (var a = 0; a < TWO_PI; a += angle) {
                            var sx = that.pos[0] * width + cos(a) * that.radius * width;
                            var sy = that.pos[1] * height + sin(a) * that.radius * width;
                            that.vectors.push(createVector(sx,sy));
                            vertex(sx, sy);
                        }
                        endShape(CLOSE);
            });
        }

        contains(mx, my){
            return collidePointPoly(mx, my, this.vectors);
        }
}


class RectComponent extends P5Component{
    constructor({name,
        width,
        height,
        pos,
        rotation,
        fill_color = [0,0,0],
        border_color = [0,0,0],
        timestart,
        timestop} = {}){
            super({name, pos, timestart, timestop});
            this.width = setProperty(width);
            this.height = setProperty(height);
            this.fill_color = setProperty(fill_color);
            this.border_color = setProperty(border_color);
            this.update_map = {'width' : width, 'height' : height, 'pos' : pos, 'rotation': rotation, 'fill_color' : fill_color, 'border_color' : border_color};
        }
    
        draw(){
            var that = this;
            this.drawDecorator(function(){
                fill(that.fill_color);
                rectMode(CORNER);
                rect(that.pos[0] * width, that.pos[1] * height, that.width*width, that.height * height,);
            });
        }

        contains(mx, my){
            return collidePointRect(mx, my, this.pos[0] * width, this.pos[1] * height, this.width * width, this.height * height);
        }
}

class KeyboardResponse extends P5Component{
    constructor({name,
        keys = [ENTER],
        timestart = 0,
        timestop = null,
        force_end_of_routine = true} = {}){

            super({name, timestart, timestop});
            this.keys = keys;
            this.lock = true;
            this.response = null;
            this.force_end_of_routine = force_end_of_routine;
        }
    
        update(){
            if (this.timestop != null & (millis() - this.t_start) - this.timestop > 0 ){
                this.finished = true;
            }
            if (!keyIsPressed & this.lock){
                this.lock = false;
            }
            if (keyIsPressed & this.keys.indexOf(keyCode) > -1 & !this.lock){
                this.lock = true;
                this.response = keyCode;
                this.experiment.addData({name: this.name, 'rt': millis() - this.t_start, 'resp' : this.response});
                if (this.force_end_of_routine){
                    return false;
                } else{
                    return true;
                }
            } else {
                return true;
            };
        
        
        }
}

class NewKeyboardResponse extends P5Component{
    constructor({name,
        keys = [ENTER],
        timestart = 0,
        timestop = null,
        force_end_of_routine = true,
        action = false,
        trialsLoop = null,
        q = null} = {}){

            super({name, timestart, timestop});
            this.keys = keys;
            this.lock = true;
            this.response = null;
            this.action = action;
            this.trialsLoop = trialsLoop;
            this.q = q;
            this.force_end_of_routine = force_end_of_routine;
        }
    
        update(){
            if (this.timestop != null & (millis() - this.t_start) - this.timestop > 0 ){
                this.finished = true;
            }
            if (!keyIsPressed & this.lock){
                this.lock = false;
            }
            if (keyIsPressed & this.keys.indexOf(keyCode) > -1 & !this.lock){
                this.lock = true;
                this.response = keyCode;

                if(this.action) {
                    console.log("IN ACTION: ", this.response, this.trialsLoop);
                    if (this.response == this.trialsLoop.currentTrial['corr']) {
                        console.log("correct!");
                        this.q.update(getSizeInDeg(this.trialsLoop.currentTrial['sizeInPix']), 1);
                        let sizeInPixels = getSizeInPx(this.q.quantile());
                        let curSymbol = getNewSymbol();
                        let newTrial = {"corr": curSymbol.keyCode, "stimuli": curSymbol.symbol, "sizeInPix": sizeInPixels};
                        this.trialsLoop.addTrial(newTrial);
                    } else {
                        console.log("incorrect!");
                        this.q.update(getSizeInDeg(this.trialsLoop.currentTrial['sizeInPix']), 0);
                        let sizeInPixels = getSizeInPx(this.q.quantile());
                        let curSymbol = getNewSymbol();
                        let newTrial = {"corr": curSymbol.keyCode, "stimuli": curSymbol.symbol, "sizeInPix": sizeInPixels};
                        this.trialsLoop.addTrial(newTrial);
                    }
                }
                this.experiment.setQ(this.q);
                this.experiment.addData({name: this.name, 'rt': millis() - this.t_start, 
                                        'resp' : convertKeyCodeToKeyCharacter(this.response),
                                        'actual': this.trialsLoop.currentTrial['stimuli']});
                if (this.force_end_of_routine){
                    return false;
                } else{
                    return true;
                }
            } else {
                return true;
            };
        
        
        }
}


class MouseResponse extends P5Component{
    constructor({name,
        valid = [],
        force_end_of_routine = true} = {}){
            super({name});
            this.valid = setProperty(valid);
            this.routine = null;
            this.response = null;
            this.force_end_of_routine = force_end_of_routine;
            this.updatate_map = {'valid' : valid};
        }
    
        update(){
            for (var val in this.update_map){
                if (typeof this.update_map[val] !== 'undefined')
                {
                    this[val] = setProperty(this.update_map[val]);
                }
            }
            if (mouseIsPressed){
                for (var i=0; i < this.valid.length; i++){
                    if (this.valid[i].contains(mouseX, mouseY)){
                        this.experiment.addData({name: this.name, 'rt': millis() - this.t_start, 'resp' : this.valid[i].name});
                        if (this.force_end_of_routine){
                            return false;
                        } else {
                            return true;}
                    } else{
                        return true;
                    }
                }
            }
        }
}


class SliderResponse extends BaseComponent{
    constructor({name,
        label,
        confirm_label,
        min = 1,
        max = 7,
        step = 1,
        pos = [0.5, 0.65]} = {}){
            super({name, pos});
            this.slider = null;
            this.resp = null;
            this.confirm_button = null;
            this.clicked = false;
            this.min = min;
            this.max = max;
            this.step = step;
            this.confirm_label = confirm_label;
            this.label = label;
        }
    

        start(t_start){
            super.start(t_start);
            this.clicked = false;
            this.slider = createSlider(this.min, this.max, this.min, this.step);
            this.slider.position(this.pos[0] * width - width/8, this.pos[1] * height);
            this.slider.style('width', width/4 + 'px');
            this.slider.elt.setAttribute('list', 'steplist');
            this.confirm_button = createButton(this.confirm_label);
            this.confirm_button.position(this.pos[0] * width, this.pos[1] * height + 0.1*height);
            var that = this;
            this.confirm_button.mousePressed(function(){that.clicked = true;});
            dlist = document.createElement('datalist');
            dlist.setAttribute('id', 'steplist');
            for (var i = this.min; i<this.max+1; i++){
                o = document.createElement('option');
                o.innerHTML = i;
                dlist.appendChild(o);
            }
            document.body.appendChild(dlist);
        }

        draw(){ }

        update() {
            this.resp = this.slider.value();
            console.log(this.clicked);
            if (this.clicked){
                this.experiment.addData({name: this.name, 'rt': millis() - this.t_start, 'resp' : this.resp});
                this.slider.remove();
                this.confirm_button.remove();
                return false;
            }
        }
}

class ExpInfoBox extends BaseComponent{
    constructor({name,
        pos,
        data,
        additional_info} = {}){
            super({name, pos});
            this.html_elements = [];
            this.data = data;
            this.clicked = false;
            this.additional_info = additional_info;
        }
   
        start(){
            var y = height/2 - 1/2*50*this.data.length;
            for (var i=0; i< this.data.length; i++){
                var input = createInput('');
                input.position(width/2, y);
                y += 50;
                this.html_elements.push(input);
            }
            var button = createButton('Start');
            button.position(width/2, y);
            var eb = this;
            button.mousePressed(function () {eb.clicked = true;});
            this.html_elements.push(button);
        }

        update(){
            background(255);
            var y = height/2 - 1/2*50*this.data.length;
            for (var i=0; i< this.data.length; i++){
                textSize(20);
                textAlign(CENTER, TOP);
                text(this.data[i], width/2 - 115, y);
                y += 50;
            };
            if (this.clicked){
                var expInfo = {};
                for (var i=0; i < this.data.length; i++){
                    expInfo[this.data[i]] = this.html_elements[i].value();
                }
                this.experiment.expInfo = Object.assign(expInfo, this.additional_info);
                for (var j = 0; j < this.html_elements.length; j++){
                    this.html_elements[j].remove();
                }
                console.log(expInfo);
                return true;
            };
        }
}

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
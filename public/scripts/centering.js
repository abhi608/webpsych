var exp;
var stimuli;
var trials_data;
var instructions_data;
var intersession_instructions_data;
var conditions;
var training;
var training_data;
var soundPositiveFeedback;
var soundNegativeFeedback;
var pelliFont;
var sloanFont;
var instructions;
var intersession_instructions;
var instructions_loop;
var intersession_instructions_loop;
var version;
var rv;
var loaded = false;
var alphabetsAndNumbers = Array.from({length: 43}, (x, i) => i + 48);

function setup() {
    trials_data = loadTable('../data/trials.csv', 'csv', 'header',
        function () {
            conditions = LoadP5TableData(trials_data);
            instructions_data = loadTable('../data/instructions.csv', 'csv', 'header',
                function () {
                    instructions = LoadP5TableData(instructions_data);
                    intersession_instructions_data = loadTable('../data/intersession_instructions.csv', 'csv', 'header',
                        function () {
                            intersession_instructions = LoadP5TableData(intersession_instructions_data);
                            training_data = loadTable('../data/training.csv', 'csv', 'header', function () {
                                training = LoadP5TableData(training_data);
                                console.log(training);
                                // load fonts and sound here
                                soundPositiveFeedback = loadSound('../sound/positiveFeedback.mp3', function () {
                                    soundNegativeFeedback = loadSound('../sound/negativeFeedback.mp3', function () {
                                        pelliFont = loadFont('../fonts/Pelli.otf', function () {
                                            sloanFont = loadFont('../fonts/Sloan.otf', function () {
                                                console.log("Everything loaded!");
                                                console.log("conditions: ", conditions);
                                                setupExp();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                });
        });
}

function setupExp() {
    createCanvas(windowWidth, windowHeight);

    // Instantiate experiment object and keep on adding new routines to it
    var url = 'https://webpsychv1.herokuapp.com/api/addExperiment';
    // var url = 'http://localhost:3000/api/addExperiment';
    version = 1;
    exp = new Experiment(url, 'centeringf' + '_' + version);



    // Experiment info starts here 
    var exp_info_box = new ExpInfoBox({
        name: 'expinfo',
        data: ['Name', 'Age'],
        additional_info: {
            'participant': Math.random().toString(36).substring(7)
        }
    });
    exp.addRoutine(exp_info_box);
    // Experiment info ends here



    // Instructions Loop starts here
    var instructions_loop = new Loop(instructions, 1);
    // instr routine starts here
    var instr = new Routine();
    instr.addComponent(new TextStimulus({
        name: 'instruction',
        text: function () {
            return instructions_loop.currentTrial['instructions'];
        },
        pos: [0.5, 0.5]
    }));
    instr.addComponent(new KeyboardResponse({
        name: 'instr_resp'
    }));
    instructions_loop.addRoutine(instr);
    //instr routine ends here
    exp.addRoutine(instructions_loop);
    // Instructions loop ends here



    // Training Session Loop starts here
    var trainingLoop = new Loop(training, 2);

    // interStimuliBreakTrainingRoutine starts here
    var interStimuliBreakTrainingRoutine = new Routine();
    var breakTextTraining = new TextStimulus({
        name: 'break_text',
        text: 'Another set of experiments are about to begin.',
        timestop: 2000,
        pos: [0.5, 0.5]
    });
    var timeSettingsTraining = new CodeComponent({
        name: 'break_randomizer'
    });
    var progressBarTraining = new RectComponent({
        name: 'progress_bar',
        height: 0.05,
        width: function () {
            return 0.5 - (0.5 * (millis() - breakTextTraining.t_start) / breakTextTraining.timestop);
        },
        pos: [0.2, 0.8],
        fill_color: [255, 0, 0],
        timestop: 2000
    });
    timeSettingsTraining.at_the_start.push(function () {
        var timestop = random(1000, 2000);
        progressBarTraining.timestop = timestop;
        breakTextTraining.timestop = timestop;
    });
    var tsb = new CodeComponent({
        name: 'training_session_breaker'
    });
    tsb.p_counter = 0;
    tsb.n_counter = 0;
    tsb.at_the_start.push(function () {
        tsb.p_counter = tsb.n_counter;
        console.log(tsb.n_counter);
        console.log(tsb.p_counter);
        if (tsb.n_counter == 6) {
            tsb.experiment.nextRoutine();
        }
    });
    interStimuliBreakTrainingRoutine.addComponent(timeSettingsTraining);
    interStimuliBreakTrainingRoutine.addComponent(breakTextTraining);
    // interStimuliBreakTrainingRoutine.addComponent(progressBarTraining);
    interStimuliBreakTrainingRoutine.addComponent(tsb);
    trainingLoop.addRoutine(interStimuliBreakTrainingRoutine);
    // interStimuliBreakTrainingRoutine ends here

    // fixationInstrTrainingRoutine starts here
    var fixationInstrTrainingRoutine = new Routine();
    var fixationInstrTraining = new TextStimulus({
        name: 'fixation_instruction',
        text: 'In the next step, fix your vision on the + symbol and press ENTER.\nPress ENTER when ready.'
    });
    var fixationInstrResponseTraining = new KeyboardResponse({
        name: 'fixation_instruction_response_training'
    });
    fixationInstrTrainingRoutine.addComponent(fixationInstrTraining);
    fixationInstrTrainingRoutine.addComponent(fixationInstrResponseTraining);
    trainingLoop.addRoutine(fixationInstrTrainingRoutine);
    // fixationInstrTrainingRoutine ends here

    // stimuliTrainingRoutine starts here
    var stimuliTrainingRoutine = new Routine();
    var fixationTraining = new TextStimulus({
        name: 'fixation',
        text: '+'
        // timestop: 1000
    });
    var fixationResponseTraining = new KeyboardResponse({
        name: 'fixation_response_training'
    });
    stimuliTrainingRoutine.addComponent(fixationTraining);
    stimuliTrainingRoutine.addComponent(fixationResponseTraining);
    trainingLoop.addRoutine(stimuliTrainingRoutine);
    // stimuliTrainingRoutine ends here

    // stimuliTextTrainingRoutine starts here
    var stimuliTextTrainingRoutine = new Routine();
    var trainingTextComponent = new TextStimulus({
        name: 'stimulitrain',
        text: function () {
            return trainingLoop.currentTrial['stimuli'];
        },
        textFont: sloanFont,
        timestop: 2000
    });
    stimuliTextTrainingRoutine.addComponent(trainingTextComponent);
    trainingLoop.addRoutine(stimuliTextTrainingRoutine);
    // stimuliTextTrainingRoutine ends here

    // stimuliResponseTrainingRoutine starts here
    var stimuliResponseTrainingRoutine = new Routine();
    var responseHelpTrainingComponent = new TextStimulus({
        name: 'instruction',
        text: 'Press the alphabet/number key on keyboard corresponding to the alphabet/number that you saw'
    });
    var responseKeyboardTrainingComponent = new KeyboardResponse({
        name: 'response_sensible',
        keys: alphabetsAndNumbers
    });
    stimuliResponseTrainingRoutine.addComponent(responseHelpTrainingComponent);
    stimuliResponseTrainingRoutine.addComponent(responseKeyboardTrainingComponent);
    trainingLoop.addRoutine(stimuliResponseTrainingRoutine);
    // stimuliResponseTrainingRoutine ends here

    // feedbackTrainingRoutine starts here
    var feedbackTrainingRoutine = new Routine();
    var isCorrect = false;
    var feedbackSound = new SoundStimulus({
        name: 'feedback_sound',
        sound: function () {
            if (responseKeyboardTrainingComponent.response == trainingLoop.currentTrial['corr']) {
                tsb.n_counter = tsb.p_counter + 1;
                isCorrect = true;
                console.log("correct!");
                return soundPositiveFeedback;
            } else {
                tsb.n_counter = 0;
                isCorrect = false;
                console.log("incorrect!");
                return null;
            }
        },
        timestop: 50
    });
    feedbackTrainingRoutine.addComponent(feedbackSound);
    trainingLoop.addRoutine(feedbackTrainingRoutine);
    // feedbackTrainingRoutine ends here
    // exp.addRoutine(trainingLoop);
    // Training Session Loop ends here



    // intersessionInstructionsLoop starts here
    var intersessionInstructionsLoop = new Loop(intersession_instructions, 1);

    // intersessionInstructionsRoutine starts here
    var intersessionInstructionsRoutine = new Routine();
    intersessionInstructionsRoutine.addComponent(new TextStimulus({
        name: 'intersession_instruction',
        text: function () {
            return intersessionInstructionsLoop.currentTrial['instructions'];
        },
        pos: [0.5, 0.5]
    }));
    intersessionInstructionsRoutine.addComponent(new KeyboardResponse({
        name: 'iinstr_resp'
    }));
    intersessionInstructionsLoop.addRoutine(intersessionInstructionsRoutine);
    // intersessionInstructionsRoutine ends here
    exp.addRoutine(intersessionInstructionsLoop);
    // intersessionInstructionsLoop ends here



    // Now begins the main trial. Initialize quest and start
    let tGuess = -1;
    let tGuessSd = 2;
    let pThreshold = 0.82;
    let beta = 3.5;
    let delta = 0.01;
    let gamma = 0.5;
    var q = new Quest(tGuess, tGuessSd, pThreshold, beta, delta, gamma);
    console.log("q: ", q);
    q.normalizePdf = true;
    let trialsDesired = 10;
    let sizeInPixels = getSizeInPx(q.quantile());
    let curSymbol = getNewSymbol();
    let initialCond = [{"": "0", "corr": curSymbol.keyCode, "stimuli": curSymbol.symbol, "sizeInPix": sizeInPixels}];


    // Main session (trialsLoop) starts here
    var trialsLoop = new Loop(initialCond, 1, trialsDesired);

    // interStimuliBreakRoutine starts here
    var interStimuliBreakRoutine = new Routine();
    var breakText = new TextStimulus({
        name: 'break_text',
        text: 'Another set of experiments are about to begin.',
        timestop: 2000,
        pos: [0.5, 0.5]
    });
    var timeSettings = new CodeComponent({
        name: 'break_randomizer'
    });
    var progressBar = new RectComponent({
        name: 'progress_bar',
        height: 0.05,
        width: function () {
            return 0.5 - (0.5 * (millis() - breakText.t_start) / breakText.timestop);
        },
        pos: [0.2, 0.8],
        fill_color: [255, 0, 0],
        timestop: 2000
    });
    timeSettings.at_the_start.push(function () {
        var timestop = random(1000, 2000);
        progressBarTraining.timestop = timestop;
        breakTextTraining.timestop = timestop;
    });
    var tsbMain = new CodeComponent({
        name: 'main_session_breaker'
    });
    tsbMain.p_counter = 0;
    tsbMain.n_counter = 0;
    tsbMain.at_the_start.push(function () {
        tsbMain.p_counter = tsbMain.n_counter;
        console.log(tsbMain.n_counter);
        console.log(tsbMain.p_counter);
        if (tsbMain.n_counter == 6) {
            tsbMain.experiment.nextRoutine();
        }
    });
    interStimuliBreakRoutine.addComponent(timeSettings);
    interStimuliBreakRoutine.addComponent(breakText);
    // interStimuliBreakRoutine.addComponent(progressBar);
    interStimuliBreakRoutine.addComponent(tsbMain);
    trialsLoop.addRoutine(interStimuliBreakRoutine);
    // interStimuliBreakRoutine ends here

    // fixationInstrMainRoutine starts here
    var fixationInstrMainRoutine = new Routine();
    var fixationInstrMain = new TextStimulus({
        name: 'fixation_instruction',
        text: 'In the next step, fix your vision on the + symbol and press ENTER.\nPress ENTER when ready.'
    });
    var fixationInstrResponseMain = new KeyboardResponse({
        name: 'fixation_instruction_response_training'
    });
    fixationInstrMainRoutine.addComponent(fixationInstrMain);
    fixationInstrMainRoutine.addComponent(fixationInstrResponseMain);
    trialsLoop.addRoutine(fixationInstrTrainingRoutine);
    // fixationInstrMainRoutine ends here

    // stimuliMainRoutine starts here
    var stimuliMainRoutine = new Routine();
    var fixationMain = new TextStimulus({
        name: 'fixation',
        text: '+'
    });
    var fixationResponseMain = new KeyboardResponse({
        name: 'fixation_response_main'
    });
    stimuliMainRoutine.addComponent(fixationMain);
    stimuliMainRoutine.addComponent(fixationResponseMain);
    trialsLoop.addRoutine(stimuliMainRoutine);
    // stimuliMainRoutine ends here

    // stimuliTextMainRoutine starts here
    var stimuliTextMainRoutine = new Routine();
    var mainTextComponent = new TextStimulus({
        name: 'stimuli',
        text: function () {
            return trialsLoop.currentTrial['stimuli'];
        },
        textFont: sloanFont,
        textSize: function() {
            return trialsLoop.currentTrial['sizeInPix'];
        },
        // timestart: 1000,
        timestop: 2000
    });
    stimuliTextMainRoutine.addComponent(mainTextComponent);
    trialsLoop.addRoutine(stimuliTextMainRoutine);
    // stimuliTextMainRoutine ends here

    // stimuliResponseRoutine starts here
    var stimuliResponseRoutine = new Routine();
    var responseHelpComponent = new TextStimulus({
        name: 'instruction',
        text: 'Press the alphabet/number key on keyboard corresponding to the alphabet/number that you saw'
    });
    var responseKeyboardComponent = new NewKeyboardResponse({
        name: 'main_trail',
        keys: alphabetsAndNumbers,
        trialsLoop: trialsLoop,
        q: q,
        action: true
    });
    stimuliResponseRoutine.addComponent(responseHelpComponent);
    stimuliResponseRoutine.addComponent(responseKeyboardComponent);
    trialsLoop.addRoutine(stimuliResponseRoutine);
    // stimuliResponseRoutine ends here

    // // feedbackMainRoutine starts here
    // var feedbackMainRoutine = new Routine();
    // var feedbackMainSound = new NextTrialStimulus({
    //     name: 'next_trial_decision',
    //     action: function() {
    //         console.log("In action: ", responseKeyboardTrainingComponent.response, trainingLoop.currentTrial['corr']);
    //         if (responseKeyboardTrainingComponent.response == trainingLoop.currentTrial['corr']) {
    //             tsb.n_counter = tsb.p_counter + 1;
    //             console.log("correct!");
    //             q.update(getSizeInDeg(trainingLoop.currentTrial['sizeInPix']), 1);
    //             tTest = getSizeInPx(q.quantile());
    //             let newTrial = {"": "0", "corr": 49, "stimuli": "B", "sizeInPix": tTest};
    //             trialsLoop.addTrial(newTrial);
    //         } else {
    //             tsb.n_counter = 0;
    //             console.log("incorrect!");
    //             q.update(getSizeInDeg(trainingLoop.currentTrial['sizeInPix']), 0);
    //             tTest = getSizeInPx(q.quantile());
    //             let newTrial = {"": "0", "corr": 49, "stimuli": "C", "sizeInPix": tTest};
    //             trialsLoop.addTrial(newTrial);
    //         }
    //     },
        
    // });
    // feedbackMainRoutine.addComponent(feedbackMainSound);
    // trialsLoop.addRoutine(feedbackMainRoutine);
    // // feedbackMainRoutine ends here


    // var questComputeRoutine = new Routine();
    // var questDataComponent = new QuestStats({
    //     name: 'quest_result',
    //     q: q
    // });
    // questComputeRoutine.addComponent(questDataComponent);
    // trialsLoop.addRoutine(questComputeRoutine);


    exp.addRoutine(trialsLoop);
    // trialsLoop ends here



    // thanksRoutine starts here - this routine can be understood as single routine in a single loop
    var thanksRoutine = new Routine();
    thanksRoutine.addComponent(new TextStimulus({
        name: 'thankyou',
        text: 'Thank you for participating in the experiment! Pelli Lab, NYU',
        timestop: 2000
    }));
    exp.addRoutine(thanksRoutine);
    // thanksRoutine ends here




    // start the experiment now
    exp.start();
    loaded = true;
}

function draw() {
    if (loaded) {
        exp.update();
    }
}

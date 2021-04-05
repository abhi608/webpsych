var exp;
var stimuli;
var trials_data;
var instructions_data;
var intersession_instructions_data;
var conditions;
var training;
var training_data;
var instructions;
var intersession_instructions;
var instructions_loop;
var intersession_instructions_loop;
var version;
var rv;
var loaded = false;

function setup() {
    trials_data = loadTable('trials.csv', 'csv', 'header',
        function () {
            conditions = LoadP5TableData(trials_data);

            instructions_data = loadTable('instructions.csv', 'csv', 'header',
                function () {
                    instructions = LoadP5TableData(instructions_data);
                    intersession_instructions_data = loadTable('intersession_instructions.csv', 'csv', 'header',
                        function () {
                            intersession_instructions = LoadP5TableData(intersession_instructions_data);
                            training_data = loadTable('training.csv', 'csv', 'header', function () {
                                training = LoadP5TableData(training_data);
                                console.log(training);
                                setupExp();
                            });
                        });
                });
        });
}

function setupExp() {
    createCanvas(windowWidth, windowHeight);
    // Instructions Loop
    var instructions_loop = new Loop(instructions, 1);
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


    // Training Session Loop
    var trainingLoop = new Loop(training, 2);

    var interStimuliBreakTraining = new Routine();


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

    interStimuliBreakTraining.addComponent(timeSettingsTraining);
    interStimuliBreakTraining.addComponent(breakTextTraining);
    interStimuliBreakTraining.addComponent(progressBarTraining);

    var stimuliTrainingRoutine = new Routine();
    var stimuliResponseTrainingRoutine = new Routine();

    var feedbackTraining = new Routine();

    var fixationTraining = new TextStimulus({
        name: 'fixation',
        text: '+',
        timestop: 1000
    });

    var trainingTextComponent = new TextStimulus({
        name: 'stimulitrain',
        text: function () {
            return trainingLoop.currentTrial['stimuli'];
        },
        timestart: 1000,
        timestop: 2000
    });

    var responseHelpTrainingComponent = new TextStimulus({
        name: 'instruction',
        text: 'Press the alphabet/number key on keyboard corresponding to the alphabet/number that you saw'
    });

    var responseKeyboardTrainingComponent = new KeyboardResponse({
        name: 'response_sensible',
        keys: [49, 51]
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

    var feedbackText = new TextStimulus({
        name: 'feedback_text',
        text: function () {
            if (responseKeyboardTrainingComponent.response == trainingLoop.currentTrial['corr']) {
                tsb.n_counter = tsb.p_counter + 1;
                console.log(tsb.n_counter);
                return 'Your answer was correct.';
            } else {
                tsb.n_counter = 0;
                return "Your answer was incorrect.";
            }
        }
    });


    var feedbackResponseTraining = new KeyboardResponse({
        name: 'feedback_next_training'
    });

    interStimuliBreakTraining.addComponent(tsb);
    stimuliTrainingRoutine.addComponent(fixationTraining);
    stimuliTrainingRoutine.addComponent(trainingTextComponent);

    stimuliResponseTrainingRoutine.addComponent(responseHelpTrainingComponent);
    stimuliResponseTrainingRoutine.addComponent(responseKeyboardTrainingComponent);

    feedbackTraining.addComponent(feedbackText);
    feedbackTraining.addComponent(feedbackResponseTraining);


    // Inter-session instruction
    var intersessionInstructionsLoop = new Loop(intersession_instructions, 1);
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





    // Main session
    var trials = new Loop(conditions, 1);
    var interStimuliBreak = new Routine();


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

    interStimuliBreak.addComponent(timeSettings);
    interStimuliBreak.addComponent(breakText);
    interStimuliBreak.addComponent(progressBar);

    var stimuliRoutine = new Routine();
    var stimuliResponseRoutine = new Routine();

    var feedback = new Routine();

    var fixation = new TextStimulus({
        name: 'fixation',
        text: '+',
        timestop: 1000
    });

    var textComponent = new TextStimulus({
        name: 'stimuli',
        text: function () {
            return trials.currentTrial['stimuli'];
        },
        timestart: 1000,
        timestop: 2000
    });

    var responseHelpComponent = new TextStimulus({
        name: 'instruction',
        text: 'Press the alphabet/number key on keyboard corresponding to the alphabet/number that you saw'
    });

    var responseKeyboardComponent = new KeyboardResponse({
        name: 'response_sensible',
        keys: [49, 51]
    });

    var tsb = new CodeComponent({
        name: 'session_breaker'
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

    var feedbackText = new TextStimulus({
        name: 'feedback_text',
        text: function () {
            if (responseKeyboardComponent.response == trials.currentTrial['corr']) {
                tsb.n_counter = tsb.p_counter + 1;
                console.log(tsb.n_counter);
                return 'Your answer was correct.';
            } else {
                tsb.n_counter = 0;
                return "Your answer was incorrect.";
            }
        }
    });


    var feedbackResponse = new KeyboardResponse({
        name: 'feedback_next'
    });

    interStimuliBreak.addComponent(tsb);
    stimuliRoutine.addComponent(fixation);
    stimuliRoutine.addComponent(textComponent);

    stimuliResponseRoutine.addComponent(responseHelpComponent);
    stimuliResponseRoutine.addComponent(responseKeyboardComponent);

    feedback.addComponent(feedbackText);
    feedback.addComponent(feedbackResponse);

    instructions_loop.addRoutine(instr);

    trainingLoop.addRoutine(interStimuliBreakTraining);
    trainingLoop.addRoutine(stimuliTrainingRoutine);
    trainingLoop.addRoutine(stimuliResponseTrainingRoutine);
    trainingLoop.addRoutine(feedbackTraining);

    intersessionInstructionsLoop.addRoutine(intersessionInstructionsRoutine);

    trials.addRoutine(interStimuliBreak);
    trials.addRoutine(stimuliRoutine);
    trials.addRoutine(stimuliResponseRoutine);


    var thanks = new Routine();
    thanks.addComponent(new TextStimulus({
        name: 'thankyou',
        text: 'Thank you for participating in the experiment! Pelli Lab, NYU',
        timestop: 2000
    }));


    var url = 'http://localhost:5000/saveData';

    version = 1;
    exp = new Experiment(url, 'centeringf' + '_' + version);


    var exp_info_box = new ExpInfoBox({
        name: 'expinfo',
        data: ['Name', 'Age'],
        additional_info: {
            'participant': Math.random().toString(36).substring(7)
        }
    });

    exp.addRoutine(exp_info_box);

    exp.addRoutine(instructions_loop);
    exp.addRoutine(trainingLoop);
    exp.addRoutine(intersessionInstructionsLoop);
    exp.addRoutine(trials);
    exp.addRoutine(thanks);

    exp.start();

    loaded = true;
}

function draw() {
    if (loaded) {
        exp.update();
    }
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var serverURL = "http://localhost:3000/";

fetch('http://localhost:3000/api/experimentdata')
    .then(response => response.json())
    .then(data => console.log(data));

// addEventListener('keydown', getKeyStroke);

function postResults(result) {

    fetch(serverURL + "api/result/" + window.location.pathname.replace("/criticalspacing/", ""), {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },

        body: JSON.stringify(result)
    })
        .then((response) => {
            console.log(response);
        });
}

function XYPixOfXYDeg(o, xyDeg){
    xyDeg = xyDeg - o.nearPointXYDeg;
    rDeg = norm(xyDeg);
    rPix = o.pixPerCm*o.viewingDistanceCm * tand(rDeg);
    if(rDeg>0){
        xyPix=xyDeg*rPix/rDeg;
        xyPix[1] = -xyPix[1];
    }
    else{
        xyPix=[0, 0];
    }
    
    xyPix = xyPix + o.nearPointXYPix;
    xyPix = Math.round(xyPix);
    return xyPix;
}



function XYDegOfXYPix(o,xyPix){
    xyPix=xyPix-o.nearPointXYPix;

    rPix=norm(xyPix);
    rDeg=atan2d(rPix/o.pixPerCm,o.viewingDistanceCm);

    if(rPix>0){
        xyPix[1] = -xyPix[1];
        xyDeg = xyPix*rDeg/rPix;
    }
    else{
        xyDeg=[0, 0];
    }
    xyDeg = xyDeg+o.nearPointXYDeg;
    return xyDeg;
    
}

function tand(degrees) {
    return Math.tan(degrees * Math.PI / 180);
}

function sind(degrees){
    return Math.sin(degrees * Math.PI / 180);
}

function atan2d(x, y) {
  return Math.atan2(y, x) * 180 / Math.PI;
}

function norm( arr, clbk ) {
	var len = arr.length,
		t = 0,
		s = 1,
		r,
		val,
		abs,
		i;

	if ( !len ) {
		return null;
	}
	if ( clbk ) {
		for ( i = 0; i < len; i++ ) {
			val = clbk( arr[ i ], i );
			abs = ( val < 0 ) ? -val : val;
			if ( abs > 0 ) {
				if ( abs > t ) {
					r = t / val;
					s = 1 + s*r*r;
					t = abs;
				} else {
					r = val / t;
					s = s + r*r;
				}
			}
		}
	} else {
		for ( i = 0; i < len; i++ ) {
			val = arr[ i ];
			abs = ( val < 0 ) ? -val : val;
			if ( abs > 0 ) {
				if ( abs > t ) {
					r = t / val;
					s = 1 + s*r*r;
					t = abs;
				} else {
					r = val / t;
					s = s + r*r;
				}
			}
		}
	}
	return t * Math.sqrt( s );
} 


function setupExperiment(oIn){

    if(oIn == null || oIn == undefined){
        oIn.script = [];
    }

    // PROCEDURE

    o = {};

    o.procedure='Quest'; // 'Constant stimuli'

    o.experimenter=''; //  Assign your name to skip the runtime question.
    o.flipScreenHorizontally=false; //  Set to true when using a mirror.
    
    o.observer=''; //  Assign the name to skip the runtime question.
    
    o.getAlphabetFromDisk=true; //  true makes the program more portable.
    o.secsBeforeSkipCausesGuess=8;
    o.takeSnapshot=false; //  To illustrate your talk or paper.
    o.task='identify'; //  identify, read, readAloud
    o.textFont='Verdana';
    o.textSizeDeg=0.4;
    o.thresholdParameter='spacing'; // 'spacing' or 'size'
    o.trialsDesired=20; // Number of trials (i.e. responses) for the threshold estimate.
    o.viewingDistanceCm=400; // Default.
    o.maxViewingDistanceCm=0; // Max over remaining blocks in experiment.

    // THIS SEEMS TO BE A CLUMSY ANTECEDENT TO THE NEARPOINT IDEA. DGP

    o.measureViewingDistanceToTargetNotFixation=true;
    o.endsAtMin=[];
    o.askExperimenterToSetDistance=true;
    o.experiment=''; // Name of this experiment. Used to select files for analysis.
    o.block=1; // Each block may contain more than one condition.
    o.blocksDesired=1;
    o.condition=1; // Integer count of the condition within each block, starting at 1.
    o.conditionName='';
    o.quitBlock=false;
    o.quitExperiment=false;
    o.trialsSkipped=0;
    o.askForPartingComments=true;
    o.partingComments='';
    o.spacings=[]; // For o.procedure='Constant stimuli'.
    o.fixationCheck=false; // True designates condition as a fixation check.
    o.fixationCheckMakeupPresentations=1; // After a mistake, how many correct presentation to require.

    // SOUND & FEEDBACK
    o.beepNegativeFeedback=false;
    o.beepPositiveFeedback=true;
    o.showProgressBar=true;
    o.speakEachLetter=true;
    o.speakEncouragement=false;
    o.speakViewingDistance=false;
    o.usePurring=true;
    o.useSpeech=false;
    o.showCounter=true;
    o.soundVolume=0.25;

    // VISUAL STIMULUS
    o.contrast=1; // Nominal contrast, not calibrated.
    o.eccentricityXYDeg = [0, 0]; // eccentricity of target center re fixation, + for right & up.
    o.nearPointXYInUnitSquare=[0.5, 0.5]; // location on screen. [0 0]  lower right, [1 1] upper right.
    o.durationSec=inf; // Duration of display of target and flankers

    o.fixedSpacingOverSize=1.4; // Requests size proportional to spacing, horizontally and vertically.
    o.relationOfSpacingToSize='fixed ratio'; // 'none' 'fixed by font'
    o.fourFlankers=0;
    o.oneFlanker=0;
    o.targetSizeIsHeight=nan; // false, true (or nan to depend on o.thresholdParameter)
    o.minimumTargetPix=6; //  Minimum viewing distance depends soley on this & pixPerCm.
    o.flankingDirection='radial'; // 'radial' or 'tangential' or 'horizontal' or 'vertical'.
    o.flankingDegVector=[]; // Specify x,y vector, or [] to specify named o.flankingDirection.

    o.maxFixationErrorXYDeg=[3, 3]; // Repeat targets enough to cope with errors up to this size.

    o.setTargetHeightOverWidth=false; // Stretch font to achieve a particular aspect ratio.
    o.spacingDeg=nan;
    o.spacingGuessDeg=nan;
    o.targetDeg=nan;
    o.targetGuessDeg=nan;
    o.stimulusMarginFraction=0.0; // White margin around stimulusRect.
    o.targetMargin = 0.25; // Minimum from edge of target to edge of o.stimulusRect, as fraction of targetDeg height.
    o.measuredScreenWidthCm = []; // Allow users to provide their own measurement when the OS gives wrong value.
    o.measuredScreenHeightCm = [];// Allow users to provide their own measurement when the OS gives wrong value.
    o.isolatedTarget=false; // Set to true when measuring acuity for a single isolated letter. Not yet fully supported.

    // TARGET FONT
    // o.targetFont='Sloan';
    //o.alphabet='DHKNORSVZ'; // Sloan alphabet, excluding C
    // o.borderLetter='X';
    // o.alphabet='HOTVX'; // alphabet of Cambridge Crowding Cards
    // o.borderLetter='$';
    o.targetFont='Pelli';
    o.alphabet='123456789';
    o.borderLetter='$';
    o.flankerLetter='';
    // o.targetFont='ClearviewText';
    // o.targetFont='Gotham Cond SSm XLight';
    // o.targetFont='Gotham Cond SSm Light';
    // o.targetFont='Gotham Cond SSm Medium';
    // o.targetFont='Gotham Cond SSm Book';
    // o.targetFont='Gotham Cond SSm Bold';
    // o.targetFont='Gotham Cond SSm Black';
    // o.targetFont='Arouet';
    // o.targetFont='Pelli';
    // o.targetFont='Retina Micro';

    // GEOMETRY
    // Default to external monitor if there is one.
    o.screen=max(Screen('screens'));
    o.nearPointXYDeg=[0, 0]; // Set this explicitly if you set setNearPointEccentricityTo='value'.
    o.setNearPointEccentricityTo='fixation'; // 'target' or 'fixation' or 'value'

    // FIXATION
    o.useFixation=true;
    o.blankingClipRectInUnitSquare=[0.1, 0.1, 0.9, 0.9];
    o.isFixationClippedToStimulusRect=false;
    o.isTargetLocationMarked=false; // true to mark target location
    o.fixationThicknessDeg=0.03; // Typically 0.03. Make it much thicker for scotopic testing.
    o.fixationMarkDeg=1;      // Diameter of fixation mark +
    o.targetMarkDeg=0.5;      // Diameter of target mark X
    o.isFixationBlankedNearTarget=true;
    o.fixationBlankingRadiusReTargetHeight=2;
    o.fixationBlankingRadiusReEccentricity=0.5;
    o.blankingClipRectInUnitSquare=[0.1, 0.1, 0.9, 0.9]; 
    o.fixationOffsetBeforeTargetOnsetSecs=0;
    o.fixationOnsetAfterTargetOffsetSecs=0.2; // Pause after stimulus before display of fixation.
    o.forceFixationOffScreen=false;
    // CriticalSpacing requires that the on-screen fixation mark be at least
    // o.fixationCoreSizeDeg/2 away from edge of clipping rect. (Implemented in
    // CriticalSpacing.m, not in ComputeFixationLines3.m.)
    o.fixationCoreSizeDeg=1; // Fixation-centered diameter cannot be clipped.
    o.useFixationDots=false;
    o.fixationDotsNumber=100;
    o.fixationDotsWithinRadiusDeg=2;
    o.fixationDotsColor=0;
    o.fixationDotsWeightDeg=0.05;

    // RESPONSE
    o.labelAnswers=false; // Useful for non-Roman fonts, like Chinese and Animals.
    o.responseLabels='abcdefghijklmnopqrstuvwxyz123456789';
    o.alphabetPlacement='bottom'; // 'top' placement currently collides with instructions.

    o.instructionPlacement='topLeft'; // 'topLeft' 'bottomLeft'. NOT YET IMPLEMENTED.
    o.counterPlacement='bottomRight'; // 'bottomLeft' 'bottomCenter' 'bottomRight'

    // GROUP
    o.group=''; // A "group" of conditions is defined by having the same
    // nonempty string in o.group. This designation requests that all conditions
    // in the group be presented with the same fixation and noise, which
    // considers all possible target positions. Empty o.group requests that the
    // condition be presented independently of the rest. All conditions were
    // independent in CriticalSpacing until June 21, 2020.

    // SIMULATE OBSERVER
    o.simulateObserver=false;
    o.simulatedLogThreshold=0;
    // o.dontWait must be double 0 or 1. Screen gives a fatal error if it's logical
    // boolean.
    o.dontWait=0;

    // QUEST threshold estimation
    // QUEST INPUT
    o.beta=2.3; // Mean for Gus & Ashley for radial crowding distance.
    o.delta=0.01;
    o.measureBeta=false;
    o.pThreshold=nan;
    o.tGuess=nan;
    o.tGuessSd=nan;
    o.useQuest=true; // true or false
    o.spacingGuessDeg = 1;
    // QUEST OUTPUT
    o.q=struct([]); // Quest data structure. Use Quest routines to access it.
    o.questMean=[]; // Mean of posterior pdf. The threshold estimate. Log10 scale.
    o.questSD=[]; // SD of posteriod pdf. 95// confidence is +/-2 SD. Log10 scale.


    // DEBUGGING AIDS
    o.frameTheTarget=false;
    o.printScreenResolution=false;
    o.printSizeAndSpacing=false;
    o.showAlphabet=false;
    o.showBounds=false;
    o.showLineOfLetters=false;
    o.speakSizeAndSpacing=false;
    o.useFractionOfScreenToDebug=0;
    o.endsAtMin=0;

    // BLOCKS AND BRIGHTNESS
    // To save time, we set brightness only before the first block, and restore
    // it only after the last block. Each call to AutoBrightness seems to take
    // about 30 s on an iMac under Mojave. CriticalSpacing doesn't know the
    // block number, so we provide two flags to designate the first and last
    // blocks. If you provide o.lastBlock=true then brightness
    // will be restored at the end of the block (or when CriticalSpacing
    // terminates). Otherwise the brightness will remain ready for the next
    // block. I think this code eliminates an annoying dead time of 30 to 60 s
    // per block.
    o.isFirstBlock=true;
    o.pleaseReopenWindow=false;
    o.isLastBlock=true;
    o.skipScreenCalibration=false;
    skipScreenCalibration=o.skipScreenCalibration; // Global for CloseWindowsAndCleanup.

    // TO MEASURE BETA
    // o.measureBeta=false;
    // o.offsetToMeasureBeta=-0.4:0.1:0.2; // offset of t, i.e. log signal intensity
    // o.trialsDesired=200;

    // TO HELP CHILDREN
    // o.fractionEasyTrials=0.2; // 0.2 adds 20// easy trials. 0 adds none.
    // o.speakEncouragement=true; // true to say "good," "very good," or "nice" after every trial.
    // o.practicePresentations=3;   // 0 for none. Ignored unless repeatedTargets==true.
    // Provides easy practice presentations, ramping up
    // the number of targets after each correct report
    // of both letters in a presentation, until the
    // observer gets three presentations right. Then we
    // seamlessly begin the official block.

    // PRACTICE PRESENTATIONS.
    // In several instances, very young children (4 years old) refused to even
    // try to guess the letters when the screen is covered by letters in the
    // repeated-letters condition. 8 year olds and adults are unphased. Sarah
    // Waugh found that the 4 years olds were willing to identify one or two
    // target letters, and we speculated that once they succeeded at that, they
    // might be willing to try the repeated-letters condition, with many more
    // letters.
    //
    // You can now request this by setting o.practicePresentations=3. My hope is
    // that children will be emboldened by their success on the first three
    // trials to succeed on the repeated condition, in which letters cover most
    // of the screen.
    //
    // o.practicePresentations=3 only affects the repeated-targets condition,
    // i.e. when o.repeatedTargets=true. This new options adds 3 practice
    // presentations at the beginning of every repeatedTargets block. The first
    // presentation has only a few target letters (two unique) in a single row.
    // Subsequent presentations are similar, until the observer gets both
    // targets right. Then it doubles the number of targets. Again it waits for
    // the observer to get both targets right, and then doubles the number of
    // targets. After 3 successful practice presentations, the official block
    // begins. The practice presentation responses are discarded and not passed
    // to Quest.
    //
    // You can restore the old behavior by setting o.practicePresentations=0.
    // After the practice, the block estimates threshold by the same procedure
    // whether o.practicePresentation is 0 or 3.

    // NOT SET BY USER

    o.quitBlock=false;
    o.quitExperiment=false;
    o.script='';
    o.scriptFullFileName='';
    o.scriptName='';
    o.targetFontNumber=[];
    o.targetHeightOverWidth=nan;
    o.actualDurationSec=[];
    o.actualDurationGetSecsSec=[];
    o.actualDurationVBLSec=[];

    

}


// Raj's code will give Display size. For now, this is only for testing.
function GetDisplaySize(){
    return [30.4,21.24]
}

function SetUpScreen(){

// [screenWidthMm,screenHeightMm]=Screen('DisplaySize',oo[0].screen);
[screenWidthCm,screenHeightCm] = GetDisplaySize();

screenRect=Screen('Rect',oo[0].screen);

// May not be required in remote version
// if(oo[0].useFractionOfScreenToDebug){
//     r=Math.round(oo(oi).useFractionOfScreenToDebug*screenRect);
//     screenRect=AlignRect(r,screenRect,'bottom','right');
// }


// Check this
oo.stimulusRect=screenRect;

ff=1; 

// I don't think we can learn native width when running remotely, so
// just take whatever resolution we find to be "native".
// actualScreenRect=Screen('Rect',oo[0].screen,1);

oo[0].nativeWidth=screenWidthCm;
oo[0].nativeHeight=screenHeightCm;

// I think Raj's calibrator will give us this info.
// oo[0].resolution=Screen('Resolution',oo[0].screen);

}

function SetUpFixation(window,oo,oi,ff){

// white=WhiteIndex(window);
// black=BlackIndex(window);
// escapeKeyCode=KbName('ESCAPE');
// spaceKeyCode=KbName('space');
// returnKeyCode=KbName('Return');
// graveAccentKeyCode=KbName('`~');
// escapeChar=char(27);
// graveAccentChar='`';
// returnChar=char(13);

    oo[oi].fixationXYPix = XYPixOfXYDeg(oo[oi],[0, 0]);

    if(!oo[oi].useFixation){
        oo[oi].fixationIsOffscreen = false;
    }
    else{
        oo[oi].fixationIsOffscreen = !IsXYInRect(oo[oi].fixationXYPix,oo[oi].stimulusRect);
        if(oo[oi].fixationIsOffscreen){
            console.log(`${oi}: Fixation is off screen. fixationXYPix ${oo[oi].fixationXYPix}, o.stimulusRect [${oo[oi].stimulusRect}]\n`);

            rDeg=norm(oo[oi].nearPointXYDeg);

            ori=atan2d(-oo[oi].nearPointXYDeg[1],-oo[oi].nearPointXYDeg[0]);
            rCm=2*sind(0.5*rDeg)*oo[oi].viewingDistanceCm;
            fixationOffsetXYCm=[Math.cos(ori)*rCm, Math.sin(ori)*rCm];

            // if(0){
            //     oriCheck=atan2d(fixationOffsetXYCm[1],fixationOffsetXYCm[0]);
            //     rCmCheck=norm(fixationOffsetXYCm);
            //     rDegCheck=2 * Math.asin(0.5*rCm/oo[oi].viewingDistanceCm);
            //     xyDegCheck=-[Math.cos(ori), Math.sin(ori)]*rDeg;
            //     console.log('CHECK NEAR-POINT GEOMETRY: ori %.1f %.1f; rCm %.1f %.1f; rDeg %.1f %.1f; xyDeg [%.1f %.1f] [%.1f %.1f]\n',ori,oriCheck,rCm,rCmCheck,rDeg,rDegCheck,oo[oi].nearPointXYDeg,xyDegCheck);
            // }
            
        
            fixationOffsetXYCm[1] = -fixationOffsetXYCm[1]; 

            string='';
            if(fixationOffsetXYCm[0] != 0){
                if(fixationOffsetXYCm[1] < 0){
                    string = console.log(`${string} Please create an off-screen fixation mark ${-fixationOffsetXYCm[0]} cm to the left of the cross. `);
                    console.log(ff + `${oi}: Requesting fixation mark ${-fixationOffsetXYCm[0]} cm to the left of the cross.\n`);
                }
                else{
                    string = console.log(`${string}Please create an off-screen fixation mark ${fixationOffsetXYCm[0]} cm to the right of the cross. `);
                    console.log(ff+`${oi}: Requesting fixation mark ${fixationOffsetXYCm[0]} cm to the right of the cross.\n`);    
                }
            }

            if(fixationOffsetXYCm(2)!=0){
                if(fixationOffsetXYCm(2) < 0){
                    string = console.log(`${string} Please create an off-screen fixation mark ${-fixationOffsetXYCm[1]} cm higher than the cross below. `);
                    console.log(ff,`${oi}: Requesting fixation mark ${-fixationOffsetXYCm[1]} cm above the cross.\n`,);
                }  
                else{
                    console.log(`${string} Please create an off-screen fixation mark ${fixationOffsetXYCm[1]} cm lower than the cross. `);
                    console.log(ff+`${oi}: Requesting fixation mark ${fixationOffsetXYCm[1]} cm below the cross.\n`);
                }
            }
            
        
        // string = console.log('%sAdjust the viewing distances so both your fixation mark and the cross below are %.1f cm from the observer''s eye. ',string,oo[oi].viewingDistanceCm);
        // string = [string 'Tilt and swivel the display so that the cross is orthogonal to the observer''s line of sight. '...
        //     'Once the fixation is properly arranged, hit RETURN to proceed. Otherwise hit ESCAPE to quit. '];
    
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 50, 50);

        drawText(string,0,0,oo[oi].textSize,'Verdana',textAlign,textBaseline,'black');

        DrawFormattedText(window,string,oo[oi].textSize,1.5*oo[oi].textSize,black,oo[oi].textLineLength,[],[],1.3);

        x = oo[oi].nearPointXYPix[0]; 
        y = oo[oi].nearPointXYPix[1];

        // a = 0.1*RectHeight(oo[oi].stimulusRect);
        a = 0.1*RectHeight(oo[oi].stimulusRect);


        // Screen('DrawLine',window,black,x-a,y,x+a,y,a/20);
        // Screen('DrawLine',window,black,x,y-a,x,y+a,a/20);

        DrawCounter(oo);

        // Screen('Flip',window,0,0,oo[0].dontWait); 

        
        string='';

        response=GetKeypress([escapeKeyCode,returnKeyCode,graveAccentKeyCode]);

        answer=[];

        if(ismember(response,[escapeChar, graveAccentChar])){
            answer=0;
        }
        
        if(ismember(response,[returnChar])){
            answer=1;
        }

        // Screen('FillRect',window,white);
        ctx.fillStyle = 'white';

        DrawCounter(oo);

        Screen('Flip',window,0,0,oo[0].dontWait);
        if(answer){
            oo[oi].fixationIsOffscreen = 1;
            console.log(ff,'%d: Offscreen fixation mark (%.1f,%.1f) cm from near point of display.\n',oi,fixationOffsetXYCm);
        }
        else{
            oo[oi].fixationIsOffscreen = 0;
            console.log(ff,'\n\n' + string + '\n');
            console.log(`ERROR: User declined to set up off-screen fixation.\n Consider reducing viewing distance (${oo[oi].viewingDistanceCm} cm) or o.eccentricityXYDeg (${oo[oi].eccentricityXYDeg})).\n`);
            console.log('ERROR: User declined to set up off-screen fixation.');
        }
        }
            
        else{

        }

    oo[oi].targetXYPix=XYPixOfXYDeg(oo[oi],oo[oi].eccentricityXYDeg);

    if(oo[oi].isFixationBlankedNearTarget){
        console.log(ff,'%d: Fixation cross is blanked near target. No delay in showing fixation after target.\n',oi);
    }
    else{
        if(oo[oi].fixationOffsetBeforeTargetOnsetSecs>0){
            console.log(ff,'%d: Fixation cross is blanked %.2f s before target. No selective blanking near target. \n',...
            oi,oo[oi].fixationOffsetBeforeTargetOnsetSecs);
        }
        if(oo[oi].fixationOnsetAfterTargetOffsetSecs>0){
            console.log(ff,'%d: Fixation cross is blanked during and until %.2f s after target. No selective blanking near target. \n',...
            oi,oo[oi].fixationOnsetAfterTargetOffsetSecs);
        }  
        else{
            console.log(ff,'%d: Fixation cross is not blanked.\n');
        }
    }
        
    }
        

    return oo;
}

function setupConditionsList(conditions){
    for (let oi = 0; oi < conditions.length; oi++) {
        if(!oo[oi].fixationCheck){
            condList=[condList, repmat(oi,1,oo[oi].presentations)];
        }
        else{
            condList=[condList, repmat(oi,1,oo[oi].presentations-1)];
        }

        oo[oi].spacingsSequence=shuffle(oo[oi].spacingsSequence);
        oo[oi].q=QuestObject(oo[oi].tGuess,oo[oi].tGuessSd,oo[oi].pThreshold,oo[oi].beta,oo[oi].delta,gamma,grain,range);
        oo[oi].trialData={};
        oo[oi].condition = oi;
        
    }
}


// Function to display instructions
function displayInstructions(conditions){
    let usingDigits = false;
    let usingLetters = false;

    for (let i = 0; i < conditions.length; i++) {
        usingDigits = usingDigits || oo[oi].alphabet.split("").every(r => '0123456789'.indexOf(r) >= 0);
        usingLetters = usingLetters || oo[oi].alphabet.split("").some(r => '0123456789'.indexOf(r) >= 0);
    }

    if(usingDigits && usingLetters){
        symbolName='character';
    }
    else if(usingDigits && !usingLetters){
        symbolName='digit';
    }else if(!usingDigits && usingLetters){
        symbolName='letter';
    }
    else if(!usingDigits && !usingLetters){
        console.log('ERROR: Targets are neither digits nor letters');
    }

    let string = "";

    if(oo[oi].observer){
        string='Hello ' + oo[oi].observer;
    }
    else{
        string='Hello. ';
    }

    string += `Please make sure this computer''s sound is enabled. 
        Press CAPS LOCK at any time to see the alphabet of possible letters. 
        You might also have the alphabet on a piece of paper.
        You can respond by typing or speaking, 
        or by pointing to a letter on your piece of paper. `;


    for (let oi = 0; oi < conditions.length; oi++) {
        if(!oo[oi].repeatedTargets && oo[oi].thresholdParameter === 'size'){
            string += `When you see a letter, please report it.`;
            break;
        }
    }   

    for (let oi = 0; oi < conditions.length; oi++) {
        if(!oo[oi].repeatedTargets && oo[oi].thresholdParameter === 'spacing'){
            string += `When you see three letters, please report just the middle letter. `;
            break;
        }
    }


    string += `Sometimes the letters will be easy to identify. Sometimes they will be nearly impossible. `;
    string += `You can''t get much more than half right, so relax. 
                Think of it as a guessing game, and just get as many as you can. 
                Type slowly. (Quit anytime by pressing ESCAPE.`;

    if(oo.useFixation){
        string += `Look in the middle of the screen, ignoring the edges of the screen. `;
    }

    string += `To continue, please hit RETURN. `;
    
    tryAgain = true;

    string='';

    // To do
    
}


function main(){

    while(presentation < condList.length){

        if(!isempty(oo[oi].spacingsSequence) && oo[oi].spacingsSequence.length != sum(condList==oi)){
            console.log(`presentation ${presentation} of ${condList.length} in block ${oo[oi].block}. `);

            console.log(`${oo.length} conditions with [`);

            // Bug
            for (let oii = 0; oii < oo.length; oii++) {
                console.log(sum(condList == oii));
            }


            console.log(`trials. trialsSkipped [ ${oo.trialsSkipped} ], fixationaCheck [ ${oo.fixationCheck} ]`);

            console.log(`presentation ${presentation} condition ${oi}. Mismatching length of spacingsSequence ${oo[oi].spacingsSequence.length} and sum(condList==%d) ${sum(condList==oi)}`);

        }

        
        if(skipTrial){
            // We arrive here if user canceled (or mispronounced) last presentation. 
            // In that case, we don't count that presentation and reshuffle 
            // all the remaining conditions, including that of the last presentation. 

            i = sum(condList.slice(0,presentation)==oi);

            // Shuffle all trials not yet completed. 
            // Check following

            shuffledSequences = shuffle(oo[oi].spacingsSequence.slice(i,end));

            for (let index = i; index < end; index++) {
                oo[oi].spacingsSequence[index] = shuffledSequences[index-i];
                
            }

            shuffledCondList = shuffle(condList.slice(presentation,end));

            for (let index = presentation; index < end; index++) {
                condList[index] = shuffledCondList[index-presentation];
            }

            oo[oi].trialsSkipped += 1; 

        }    
        else{
            presentation += 1;
        }
        
        blockTrial = presentation;
        blockTrials = condList.length; 

        oi = condList[presentation];

        easyModulus = Math.ceil(1/oo[oi].fractionEasyTrials - 1);
        easyPresentation = easeRequest > 0 || ((presentation - 1) % easyModulus == 0);

        intensity = QuestObject(oo[oi].q);

        if(oo[oi].measureBeta){
            offsetToMeasureBeta = shuffle(offsetToMeasureBeta);
            intensity = intensity + offsetToMeasureBeta[0];
        }
 
        if(easyPresentation){
            easyCount += 1;
            oo[oi].easyCount += 1;
            intensity += oo[oi].easyBoost;

            if(easeRequest>1){
                intensity += (easeRequest-1) * oo[oi].easyBoost;
            }
        }

        switch(oo[oi].thresholdParameter){
            case 'spacing':

            fixationXY = XYPixOfXYDeg(oo[oi], [0, 0]);
            targetXY = XYPixOfXYDeg(oo[oi], oo[oi].eccentricityXYDeg);

            switch(oo[oi].flankingDirection){
                case 'radial':
                    deltaXY = targetXY - fixationXY;
                case 'tangential':
                    // deltaXY = (targetXY - fixationXY) * rotate90;
                    deltaXY = (targetXY - fixationXY);
                case 'horizontal':
                    deltaXY=[1 ,0];
                case 'vertical':
                    deltaXY=[0 ,1];
            }
               
            
            deltaXY = deltaXY/norm(deltaXY);

            // Check HERE
            deltaXY=deltaXY*RectWidth(oo[oi].stimulusRect);

            [far1XY,far2XY] = ClipLineSegment2(targetXY+deltaXY,targetXY-deltaXY,oo[oi].stimulusRect);

            delta1XYDeg=XYDegOfXYPix(oo[oi],far1XY)-oo[oi].eccentricityXYDeg;
            delta2XYDeg=XYDegOfXYPix(oo[oi],far2XY)-oo[oi].eccentricityXYDeg;

            maxSpacingDeg = Math.min(norm(delta1XYDeg),norm(delta2XYDeg));
            maxSpacingDeg -= oo[oi].targetDeg * 0.75; 
            maxSpacingDeg = Math.max(0,maxSpacingDeg);


            if(!oo[oi].fixationCheck){
                oo[oi].spacingDeg = Math.min(Math.pow(10,intensity,maxSpacingDeg));
            }
            else{
                oo[oi].spacingDeg=0.3;

            }


            switch(oo[oi].relationOfSpacingToSize){
                case 'fixed ratio':
                    oo[oi].targetDeg = oo[oi].spacingDeg / oo[oi].fixedSpacingOverSize;
                    break;
                case 'none':
                    oo[oi].spacingDeg= Math.max(oo[oi].spacingDeg, 1.1*oo[oi].targetDeg);
                    break;
                case 'fixed by font':
                    break;
                default:
                    console.log(`o.relationOfSpacingToSize has unknown value ${oo[oi].relationOfSpacingToSize}`);
                    break;
            }

                break;

            case 'size':
                if(!oo[oi].fixationCheck){
                    oo[oi].targetDeg = Math.pow(10,intensity);
                }

                break;

        }

        oo[oi].targetPix = oo[oi].targetDeg * pixPerDeg;
        oo[oi].targetPix = Math.max(oo[oi].targetPix, oo[oi].minimumTargetPix);
        
        if(oo[oi].targetSizeIsHeight){
            oo[oi].targetPix = Math.max(oo[oi].targetPix,oo[oi].minimumTargetPix*oo[oi].targetHeightOverWidth);
        }
        
        oo[oi].targetDeg=oo[oi].targetPix/pixPerDeg;

        if(oo[oi].thresholdParameter == 'size'){
            switch(oo[oi].relationOfSpacingToSize){
                case 'fixed ratio':
                    oo[oi].spacingDeg=oo[oi].targetDeg*oo[oi].fixedSpacingOverSize;
                    break;
                case 'none':
                    break;
                case 'fixed by font':
                    break;
            }
            

        }

        spacingPix = oo[oi].spacingDeg*pixPerDeg; 

        switch(oo[oi].relationOfSpacingToSize){
            case 'fixed ratio':
                spacingPix=Math.max(spacingPix, oo[oi].minimumTargetPix*oo[oi].fixedSpacingOverSize);
                break;
            case 'none':
                break;
            case 'fixed by font':
                break;
        }
            

        switch(oo[oi].thresholdParameter){
            case 'spacing':
                if(oo[oi].fourFlankers){
                    minSpacesY=2;
                    minSpacesX=2;
                }  
                else{
                    if(oo[oi].targetSizeIsHeight){
                    minSpacesY=2;
                    minSpacesX=0;
                    }
                    else{
                    minSpacesY=0;
                    minSpacesX=2;
                    }
                }
                break;

            case 'size':
                minSpacesY=0;
                minSpacesX=0;
                break;
        }

        if(oo[oi].targetSizeIsHeight){
            switch(oo[oi].relationOfSpacingToSize){
                case 'fixed ratio':
                    spacingPix = Math.min(spacingPix,Math.floor(RectHeight(oo[oi].stimulusRect)/(minSpacesY+1/oo[oi].fixedSpacingOverSize)));
                    spacingPix = Math.min(spacingPix,Math.floor(oo[oi].targetHeightOverWidth*RectWidth(oo[oi].stimulusRect)/(minSpacesX+1/oo[oi].fixedSpacingOverSize)));
                    oo[oi].targetPix = spacingPix/oo[oi].fixedSpacingOverSize;
                    break;

                case 'none':
                    spacingPix = Math.min(spacingPix, Math.floor((RectHeight(oo[oi].stimulusRect)-oo[oi].targetPix)/minSpacesY));
                    spacingPix = Math.min(spacingPix, Math.floor(oo[oi].targetHeightOverWidth*(RectWidth(oo[oi].stimulusRect)-oo[oi].targetPix/oo[oi].targetHeightOverWidth)/minSpacesX));
                    break;

                case 'fixed by font':
                    break;
            }
        }
        else{
            switch(oo[oi].relationOfSpacingToSize){
                case 'fixed ratio':
                    spacingPix = Math.min(spacingPix, Math.floor(RectWidth(oo[oi].stimulusRect)/(minSpacesX+1/oo[oi].fixedSpacingOverSize)));
                    spacingPix = Math.min(spacingPix, Math.floor(RectHeight(oo[oi].stimulusRect)/(minSpacesY+1/oo[oi].fixedSpacingOverSize)/oo[oi].targetHeightOverWidth));
                    oo[oi].targetPix=spacingPix/oo[oi].fixedSpacingOverSize;
                    break;
                case 'none':
                    spacingPix = Math.min(spacingPix,Math.floor((RectHeight(oo[oi].stimulusRect)-oo[oi].targetPix)/minSpacesX));
                    spacingPix = Math.min(spacingPix,Math.floor(oo[oi].targetHeightOverWidth*(RectWidth(oo[oi].stimulusRect)-oo[oi].targetHeightOverWidth*oo[oi].targetPix)/4));
                    break;
                case 'fixed by font':
                    break;
            }
           
        }

        oo[oi].targetDeg=oo[oi].targetPix/pixPerDeg;
        oo[oi].spacingDeg=spacingPix/pixPerDeg; 

        tXY = XYPixOfXYDeg(oo[oi],oo[oi].eccentricityXYDeg); 

        spacingPix = Math.round(spacingPix);

        fXY=[];

        if(oo[oi].flankingDirection == 'horizontal' || oo[oi].flankingDirection == 'tangential' || (oo[oi].fourFlankers && oo[oi].thresholdParameter == 'spacing')){

            switch(oo[oi].flankingDirection){
                case 'horizontal':
                    flankingDegVector=[1 ,0];
                    break;
                case 'fourFlankers':
                    flankingDegVector=[1 ,0];
                    break;
                case 'vertical':
                    flankingDegVector=[0 ,1];
                    break;
                case 'tangential':
                    // flankingDegVector=oo[oi].eccentricityDegVector*rotate90;
                    flankingDegVector=oo[oi].eccentricityDegVector;
                    break;
            }
            
            // Check Here
            // flankingPixVector = flankingDegVector.*[1, -1]; 

            switch(oo[oi].relationOfSpacingToSize){
                case 'fixed ratio':
                    pix = spacingPix/oo[oi].fixedSpacingOverSize;
                case 'none':
                    pix = oo[oi].targetPix;
                case 'fixed by font':
                    pix = spacingPix/oo[oi].fixedSpacingOverSize;
            }
                
            
            if(oo[oi].targetSizeIsHeight){
                height=pix;
            }
            else{
                height=pix*oo[oi].targetHeightOverWidth;
            }
            
            r = InsetRect(oo[oi].stimulusRect,0.5*height/oo[oi].targetHeightOverWidth,0.5*height);
            r = Math.round(r); 
           
            r = InsetRect(r,-1,-1);

            if(!IsXYInRect(tXY,r)){
                let height;
                let tXY;
                let r = Math.round(r);
                let screenRect;
                oo[oi].stimulusRect;
                console.log('ERROR: The target fell off the screen. Please reduce the viewing distance.\n');
                console.log('NOTE: Perhaps this would be fixed by enhancing CriticalSpacing with another call to ShiftPointInRect.\n Ask denis.pelli@nyu.edu.\n');
                stimulusSize = [RectWidth(oo[oi].stimulusRect) ,RectHeight(oo[oi].stimulusRect)];

                console.log('o.stimulusRect pix, deg, fixation at deg, eccentricity deg, target at  deg.',stimulusSize,stimulusSize/pixPerDeg,oo[oi].fix.xy/pixPerDeg,oo[oi].eccentricityXYDeg,tXY/pixPerDeg);
                
                sca;
                console.log('Error: Sorry, the target (%.0f pix=%.0f deg high at eccentricity [%.0f %.0f] deg) is falling off the screen. Please reduce the viewing distance.',height,height/pixPerDeg,oo[oi].eccentricityXYDeg[0],oo[oi].eccentricityXYDeg[1]);
            }
                
            
            // assert(length(spacingPix)==1);

            fXY=nj.zeros([2,2]);

            // switch(oo[oi].relationOfSpacingToSize){
            //     case 'fixed ratio':
                
            //     fXY(1,:)=tXY+spacingPix*(1+0.5/oo[oi].fixedSpacingOverSize)*flankingPixVector;
            //     fXY(2,:)=tXY-spacingPix*(1+0.5/oo[oi].fixedSpacingOverSize)*flankingPixVector;
            //     [fXY(1,:),fXY(2,:)]=ClipLineSegment2(fXY(1,:),fXY(2,:),oo[oi].stimulusRect);
            //     v=fXY;
            //     for i=1:size(fXY,1)
            //         v(i,1:2)=fXY(i,1:2)-tXY;
            //     end
            //     spacingPix=min(norm(v(1,:)),norm(v(2,:)))/(1+0.5/oo[oi].fixedSpacingOverSize);
            // case 'none':
            //     % Clip the nominal spacingPix, allowing for half a letter
            //     % beyond the spacing, clipped by the stimulusRect.
            //     fXY(1,:)=tXY+(spacingPix+0.5*oo[oi].targetPix)*flankingPixVector;
            //     fXY(2,:)=tXY-(spacingPix+0.5*oo[oi].targetPix)*flankingPixVector;
            //     [fXY(1,:),fXY(2,:)]=ClipLineSegment2(fXY(1,:),fXY(2,:),oo[oi].stimulusRect);
            //     v=fXY;
            //     for i=1:size(fXY,1)
            //         v(i,1:2)=fXY(i,1:2)-tXY;
            //     end
            //     spacingPix=min(norm(v(1,:)),norm(v(2,:)))-0.5*oo[oi].targetPix;
            //     break;

            // case 'fixed by font':
            //     break;
            // }
                
            
            // assert(length(spacingPix)==1);
            // spacingPix=max(0,spacingPix);
            // assert(length(spacingPix)==1);
            // fXY(1,:)=tXY+spacingPix*flankingPixVector;
            // fXY(2,:)=tXY-spacingPix*flankingPixVector;
            // outerSpacingPix=0;
        
        
        }

            if(oo[oi].flankingDirection =='radial' || (oo[oi].fourFlankers && oo[oi].thresholdParamete=='spacing')){
                flankingDegVector=oo[oi].eccentricityDegVector;
                // flankingPixVector=flankingDegVector.*[1 -1];

                eccentricityPix=norm(oo[oi].eccentricityXYPix);
                if(eccentricityPix==0){
                    // Target at fixation. Symmetric flankers must fit on screen.
                    switch(oo[oi].relationOfSpacingToSize){
                        case 'fixed ratio':
                            spacingPix = Math.min(spacingPix,RectWidth(oo[oi].stimulusRect)/(minSpacesX+1/oo[oi].fixedSpacingOverSize));
                            break;
                        case 'none':
                            spacingPix=Math.min(spacingPix,(RectWidth(oo[oi].stimulusRect)-oo[oi].targetPix)/minSpacesX);
                            break;
                        case 'fixed by font':
                            break;
                    }
                
                
                // assert(spacingPix>=0);

                // fXY(end+1,1:2)=tXY+spacingPix*flankingPixVector;
                // fXY(end+1,1:2)=tXY-spacingPix*flankingPixVector;

                console.log(`${ff} spacing reduced from ${requestedSpacing} to ${spacingPix} pixels (${requestedSpacing/pixPerDeg} to ${spacingPix/pixPerDeg} deg)`);
                outerSpacingPix = 0;

                // if oo[oi].printSizeAndSpacing; 
                // fprintf('%d: %d: targetPix %.0f, targetDeg %.2f, spacingPix %.0f, spacingDeg %.2f\n',...
                //         oi,MFileLineNr,oo[oi].targetPix,oo[oi].targetDeg,spacingPix,oo[oi].spacingDeg); end

                }
                else{

                    // assert(spacingPix>=0);
                    spacingPix = Math.min(eccentricityPix,spacingPix); // Inner flanker must be between fixation and target.
                    // assert(spacingPix>=0);
                    switch(oo[oi].relationOfSpacingToSize){
                        case 'fixed ratio':
                            spacingPix=Math.min(spacingPix,norm(tXY)/(1+1/oo[oi].fixedSpacingOverSize/2)); // Inner flanker is on screen.
                        // assert(spacingPix>=0);
                        for (let i = 0; i <100; i++) {
                            outerSpacingPix=Math.pow((eccentricityPix+addOnPix),2)/(eccentricityPix+addOnPix-spacingPix)-(eccentricityPix+addOnPix);

                            // assert(outerSpacingPix>=0);

                            flankerRadius=spacingPix/oo[oi].fixedSpacingOverSize/2;
                            if(IsXYInRect(tXY+flankingPixVector*(outerSpacingPix+flankerRadius),oo[oi].stimulusRect)){
                                break;
                            }
                            else{
                                spacingPix=0.9*spacingPix;
                            }
                        }

                        if(i==100){
                            console.log(` ${ff} ERROR: spacingPix ${spacingPix}, outerSpacingPix ${outerSpacingPix} exceeds max ${RectWidth(oo[oi].stimulusRect)-tXY(1)-spacingPix/oo[oi].fixedSpacingOverSize/2} pix.\n`);
                            console.log(`Could not make spacing small enough. Right flanker will be off screen. If possible, try using off-screen fixation.`);
                        }
                            break;
                        case 'none':
                            spacingPix=Math.min(spacingPix,tXY[1]-oo[oi].targetPix/2); // inner flanker on screen
                            outerSpacingPix=Math.pow((eccentricityPix+addOnPix),2)/(eccentricityPix+addOnPix-spacingPix)-(eccentricityPix+addOnPix);
                            outerSpacingPix=Math.min(outerSpacingPix,RectWidth(oo[oi].stimulusRect)-tXY[1]-oo[oi].targetPix/2); // outer flanker on screen
                            break;
                        case 'fixed by font':
                            break;
                    }
                    // assert(outerSpacingPix>=0);
                    spacingPix = eccentricityPix+addOnPix-Math.pow((eccentricityPix+addOnPix),2)/(eccentricityPix+addOnPix+outerSpacingPix);
                    // assert(spacingPix>=0);
                    spacingPix=Math.round(spacingPix);
                    // assert(spacingPix>=0);
                    // fXY(end+1,1:2)=tXY-spacingPix*flankingPixVector;
                    // fXY(end+1,1:2)=tXY+outerSpacingPix*flankingPixVector;
                }


            }

        
            oo[oi].spacingDeg=spacingPix/pixPerDeg;
            if(oo[oi].thresholdParameter == 'spacing'){
                switch(oo[oi].relationOfSpacingToSize){
                    case 'fixed ratio':
                        oo[oi].targetDeg=oo[oi].spacingDeg/oo[oi].fixedSpacingOverSize;
                        break;
                    case 'none':
                        break;
                    case 'fixed by font':
                        break;
                }
                
            
            }
                
            oo[oi].targetPix=oo[oi].targetDeg*pixPerDeg;

            if(oo[oi].targetSizeIsHeight){
                oo[oi].targetPix=Math.min(oo[oi].targetPix,RectHeight(oo[oi].stimulusRect));
                oo[oi].targetPix=Math.min(oo[oi].targetPix,RectWidth(oo[oi].stimulusRect)*oo[oi].targetHeightOverWidth);
            }   
            else{
                oo[oi].targetPix=Math.min(oo[oi].targetPix,RectWidth(oo[oi].stimulusRect));
                oo[oi].targetPix=Math.min(oo[oi].targetPix,RectHeight(oo[oi].stimulusRect)/oo[oi].targetHeightOverWidth);
            }
                
            
            oo[oi].targetDeg=oo[oi].targetPix/pixPerDeg;

            if(oo[oi].printSizeAndSpacing){
                console.log(`${oi}: ${MFileLineNr}: targetPix ${oo[oi].targetPix}, targetDeg ${oo[oi].targetDeg}, spacingPix ${spacingPix}, spacingDeg ${oo[oi].spacingDeg}\n`);
            }

            if(oo[oi].useFixation && (presentation==1 || skipTrial || encourageFixation) && !oo[oi].simulateObserver){
                tryAgain=true;
                while(tryAgain){
                    tryAgain=false;
                    if(oo[oi].useFixation){
                        oo[oi].fix = ComputeFixationStruct(oo,oi);
                        fixationLines = ComputeFixationLines3(oo[oi].fix);
                    }
                    string += 'Now, while fixating the cross, hit SPACE.';
                    Screen('TextSize',window,oo[oi].textSize);
                    Screen('TextFont',window,oo[oi].textFont);
                    // DISPLAY STRING HERE
                    string='';
                    encourageFixation=false;
                    encourageFixationString='';

                    if((shortVersion || !oo[oi].repeatedTargets) && oo[oi].useFixation){
                        if(!isempty(fixationLines)){
                            Screen('DrawLines',window,fixationLines,Math.min(7,3*oo[oi].fix.fixationThicknessPix),white);
                            Screen('DrawLines',window,fixationLines,oo[oi].fix.fixationThicknessPix,black);
                        }
                    }
                    
                    
                // PROGRESS BAR
                if(oo[oi].showProgressBar){
                    // Screen('FillRect',window,[0,220,0],progressBarRect); % green bar
                    // r=progressBarRect;
                    // r(4)=round(r(4)*(1-presentation/length(condList)));
                    // Screen('FillRect',window,[220 220 220],r); % grey background
                }
                   
                DrawCounter(oo);
                // DrawGazeTrackerMarks(oo);
                //'Now, while fixating the cross, hit SPACE.'
                Screen('Flip',window,[],1,oo[0].dontWait); 

                if(oo[oi].useFixation && ~oo[oi].simulateObserver){
                    // SetMouse(screenRect(3),screenRect(4),window);
                    // answer=GetKeypressWithHelp([spaceKeyCode escapeKeyCode graveAccentKeyCode],oo[oi],window,oo[oi].stimulusRect);
                    if(ismember(answer,[escapeChar, graveAccentChar])){
                        [oo,tryAgain]=ProcessEscape(oo);
                        if(tryAgain){
                            continue
                        }
                        else{
                            oo=SortFields(oo);
                        }
                    }

                    // Screen('FillRect',window,white,oo[oi].stimulusRect);
                    // Screen('FillRect',window,white,clearRect);
                    if (!oo[oi].repeatedTargets && oo[oi].useFixation){
                        if(!isempty(fixationLines)){
                            //Black line with white borders.
                            Screen('DrawLines',window,fixationLines,Math.min(7,3*oo[oi].fix.fixationThicknessPix),white);
                            Screen('DrawLines',window,fixationLines,oo[oi].fix.fixationThicknessPix,black);
                        }
                       
                    }
                    DrawCounter(oo);
                    DrawGazeTrackerMarks(oo);
                    Screen('Flip',window,[],1,oo[1].dontWait); // Display just fixation.

                    if(!oo[oi].dontWait){
                        WaitSecs(1);
                    }

                    Screen('FillRect',window,[],oo[oi].stimulusRect); 
                    Screen('FillRect',window,[],clearRect); 

                    if (!oo[oi].repeatedTargets && oo[oi].useFixation){
                        if(!isempty(fixationLines) && oo[oi].fixationOnsetAfterTargetOffsetSecs==0){
                            Screen('DrawLines',window,fixationLines,Math.min(7,3*oo[oi].fix.fixationThicknessPix),white);
                            Screen('DrawLines',window,fixationLines,oo[oi].fix.fixationThicknessPix,black);
                        }
                       
                    }
                }
                else{
                    Screen('FillRect',window);
                }
                
                }

            }

            if(oo[oi].fixationOffsetBeforeTargetOnsetSecs>0){
                Screen('FillRect',oo[0].window,white,oo[oi].stimulusRect);
                DrawGazeTrackerMarks(oo);
                [fixationOffsetVBLSec,fixationOffsetSec]=Screen('Flip',oo[0].window,0,1,oo[0].dontWait);
            }else{
                fixationOffsetVBLSec=[];
                fixationOffsetSec=[];
            }

            switch(oo[oi].task){
                case 'identify':
                    stimulus=shuffle(oo[oi].alphabet);
                    stimulus=shuffle(stimulus); // Make it more random if shuffle isn't utterly random.
                    if(stimulus.length>=3){
                        // If possible, three random letters, independent samples, without replacement.
                        stimulus=stimulus.slice(0,2); // Three random letters, all different.
                    }  
                    else{
                        // Otherwise, three random letters, independent samples, with replacement.
                        b = shuffle(stimulus);
                        c = shuffle(stimulus);
                        stimulus[1]=b[0];
                        stimulus[2]=c[0];
                    }

                    if(isfield(oo[oi],'flankerLetter') && oo[oi].flankerLetter.length==1){
                        stimulus[0]=oo[oi].flankerLetter;
                        stimulus[2]=oo[oi].flankerLetter;
                        while(stimulus[1]==oo[oi].flankerLetter){
                            stimulus[1]=oo[oi].alphabet(randi(oo[oi].alphabet.length));
                        }
                        
                    }

                    if(isFinite(oo[oi].targetFontHeightOverNominal)){
                        if(oo[oi].targetSizeIsHeight){
                            sizePix = Math.round(oo[oi].targetPix/oo[oi].targetFontHeightOverNominal);
                            oo[oi].targetPix=sizePix*oo[oi].targetFontHeightOverNominal;
                        }
                        else{
                            sizePix=Math,round(oo[oi].targetPix/oo[oi].targetFontHeightOverNominal*oo[oi].targetHeightOverWidth);
                            oo[oi].targetPix=sizePix*oo[oi].targetFontHeightOverNominal/oo[oi].targetHeightOverWidth;
                        }
                    
                    }

                    
                    oo[oi].targetDeg=oo[oi].targetPix/pixPerDeg;

                    [letterStruct,alphabetBounds]=CreateLetterTextures(oi,oo[oi],window); 
                    letters=[oo[oi].alphabet, oo[oi].borderLetter];
                
                    if(oo[oi].showAlphabet){
                        // This is for debugging. We also display the alphabet
                        // any time the caps lock key is pressed. That's
                        // standard behavior to allow the observer to
                        // familiarize herself with the alphabet.
                        for (let i = 0; i < letters.length; i++) {
                            r = [0, 0,  RectWidth(letterStruct(i).rect), RectHeight(letterStruct(i).rect)];
                            s = RectWidth(oo[oi].stimulusRect)/(1.5*letters.length)/RectWidth(r);
                            r=Math.round(s*r);
                            r=OffsetRect(r,(0.5+1.5*(i-1))*RectWidth(r),RectHeight(r));
                            Screen('DrawTexture',window,letterStruct(i).texture,[],r);
                            Screen('FrameRect',window,0,r);
                        }
                        DrawCounter(oo);
                        DrawGazeTrackerMarks(oo);

                        Screen('Flip',window,0,0,oo[0].dontWait);

                        GetClicks;
                    }

                        
                    textureIndex=1;
                    spacingPix=Math.floor(spacingPix);
                    if(oo[oi].targetSizeIsHeight){
                        ySpacing=spacingPix;
                        xSpacing=spacingPix/oo[oi].targetHeightOverWidth;
                        yPix=oo[oi].targetPix;
                        xPix=oo[oi].targetPix/oo[oi].targetHeightOverWidth;
                    }
                    else{
                        xPix=oo[oi].targetPix;
                        yPix=oo[oi].targetPix*oo[oi].targetHeightOverWidth;
                        xSpacing=spacingPix;
                        ySpacing=spacingPix*oo[oi].targetHeightOverWidth;
                    }                

                    if(!oo[oi].repeatedTargets){
                        if(isempty(fXY)){
                            console.log(`fXY is empty. o.repeatedTargets==${oo[oi].repeatedTargets}`);
                        }

                        // stimulusXY=[fXY(1,1:2);tXY;fXY(2:end,1:2)];
                    

                        console.log('${oi}: ${oo[oi].flankingDirection}  F T F\n');

                        xyDeg={};
                        ok=[];
                        for (let ii = 0; ii < 3; ii++) {
                            // xyDeg{ii}=XYDegOfXYPix(oo[oi],stimulusXY(ii,:));
                            // Math.log(ii)=Math.log10(norm(xyDeg{ii})+addOnDeg);
                            // ok(ii)=IsXYInRect(stimulusXY(ii,:),oo[oi].stimulusRect);                            
                        }
                        
                        // fprintf('ok %d %d %d\n',ok);
                        // fprintf('x y deg: ');
                        // fprintf('(%.1f %.1f) ',xyDeg{:});
                        // fprintf('\nlog eccentricity+addOnDeg: ');
                        // fprintf('%.2f ',logE);
                        // fprintf('\n');
                        // fprintf('diff log ecc. %.2f %.2f\n',diff(logE));
                        // fprintf('Spacings %.1f %.1f deg\n',norm(xyDeg{1}-xyDeg{2}),norm(xyDeg{2}-xyDeg{3}));
                        if(exist('maxSpacingDeg','var')){
                            console.log(`maxSpacingDeg ${maxSpacingDeg}\n`);
                            // ecc=norm(xyDeg{2});
                            console.log(`log (ecc+maxSpacingDeg+addOnDeg)/(ecc+addOnDeg) ${log10((ecc+maxSpacingDeg+addOnDeg)/(ecc+addOnDeg))} \n`);

                        }
                            
                    
                    if(oo[oi].fourFlankers && oo[oi].thresholdParameter == 'spacing'){
                        newFlankers=shuffle(oo[oi].alphabet(oo[oi].alphabet!=stimulus[1]));
                        stimulus.slice(end+1,end+2)=newFlankers.slice(1,2);
                    }
                    textures = [];
                    dstRects = [];

                    for (let textureIndex = 0; textureIndex < size(stimulusXY,1); textureIndex++) {
                        whichLetter = letters.match(stimulus[textureIndex]); 


                        textures(textureIndex)=letterStruct(whichLetter).texture;

                        r=Math.round(letterStruct(whichLetter).rect);

                        oo[oi].targetHeightOverWidth=RectHeight(r)/RectWidth(r);

                        if(oo[oi].setTargetHeightOverWidth){
                            r=Math.round(ScaleRect(letterStruct(whichLetter).rect,oo[oi].targetHeightOverWidth/oo[oi].setTargetHeightOverWidth,1));
                            oo[oi].targetHeightOverWidth=RectHeight(r)/RectWidth(r);
                        }
                        if(oo[oi].targetSizeIsHeight){
                            heightPix=oo[oi].targetPix;
                        }
                        else{
                            heightPix=oo[oi].targetHeightOverWidth*oo[oi].targetPix;
                        }
                        
                        r=Math.round((heightPix/RectHeight(letterStruct(whichLetter).rect))*letterStruct(whichLetter).rect);

                        // dstRects(1:4,textureIndex)=OffsetRect(r,round(stimulusXY(textureIndex,1)-xPix/2),round(stimulusXY(textureIndex,2)-yPix/2));

                        if(oo[oi].printSizeAndSpacing){
                            console.log(xPix,yPix,RectWidth(r),RectHeight(r),stimulusXY(textureIndex));
                        }
                            
                        
                    }

                    if(oo[oi].thresholdParameter != 'spacing' || (isfield(oo[oi],'practiceCountdown') && oo[oi].practiceCountdown>0)){
                        textures=textures(2);
                        // dstRects=dstRects(1:4,2);
                    }
                        
                    end
                    if(oo[oi].oneFlanker){
                        // textures=textures(1:2);
                        // dstRects=dstRects(1:4,1:2);
                    }

                    }
                    else
                    {
                        xMin=tXY[0]-xSpacing*Math.floor((tXY[0]-oo[oi].stimulusRect[0]-0.5*xPix)/xSpacing);
                        xMax=tXY[0]+xSpacing*Math.floor((oo[oi].stimulusRect[3]-tXY[0]-0.5*xPix)/xSpacing);
                        yMin=tXY[1]-ySpacing*Math.floor((tXY[1]-oo[oi].stimulusRect[1]-0.5*yPix)/ySpacing);
                        yMax=tXY[1]+ySpacing*Math.floor((oo[oi].stimulusRect[3]-tXY[1]-0.5*yPix)/ySpacing);

                    // Enforce the required minimum number of rows.
                    if((yMax-yMin)/ySpacing<minSpacesY){
                        yMin=tXY[1]-ySpacing*minSpacesY/2;
                        yMax=tXY[1]+ySpacing*minSpacesY/2;
                    }
                        

                    crowdingDistanceDeg=0.5*Math.min(xSpacing,ySpacing)/pixPerDeg;

                    eccDeg=crowdingDistanceDeg/0.3-0.15;

                    eccDeg=Math.max(0,eccDeg);

                    xR=Math.max(0,oo[oi].maxFixationErrorXYDeg(1)-eccDeg)*pixPerDeg;
                    yR=Math.max(0,oo[oi].maxFixationErrorXYDeg(2)-eccDeg)*pixPerDeg;

                    xR=xSpacing*Math.round(xR/xSpacing);
                    yR=ySpacing*Math.round(yR/ySpacing);
                    if(isfield(oo[oi],'practiceCountdown') && oo[oi].practiceCountdown>0){
                        xR=xSpacing*Math.min(xR/xSpacing,oo[oi].maxRepetition);
                        yR=ySpacing*Math.min(yR/ySpacing,Math.floor(oo[oi].maxRepetition/4));
                    }   
                    else{
                        if(xR>0){
                            xR=xR+xSpacing;
                        }
                        if(yR>0){
                            yR=yR+ySpacing;
                        }
                    }

                    xR=Math.max(xSpacing*minSpacesX/2,xR); 
                    yR=Math.max(ySpacing*minSpacesY/2,yR); 
                    xR=Math.round(xR); 
                    yR=Math.round(yR);

                    xMin=tXY[0]-Math.min(xR,tXY[0]-xMin);
                    xMax=tXY[0]+Math.min(xR,xMax-tXY[0]);
                    yMin=tXY[1]-Math.min(yR,tXY[1]-yMin);
                    yMax=tXY[1]+Math.min(yR,yMax-tXY[1]);

                    if(isfield(oo[oi],'practiceCountdown') && oo[oi].practiceCountdown>=3){
                        xMin=tXY[0]-min(xR/2,tXY[0]-xMin);
                        xMax=tXY[0]+min(xR/2,xMax-tXY[0]);
                        yMin=tXY[1]-min(yR/2,tXY[1]-yMin);
                        yMax=tXY[1]+min(yR/2,yMax-tXY[1]);
                    }
 

                    n=Math.round((xMax-xMin)/xSpacing);

                    xMax=tXY[0]+xSpacing*n/2;
                    xMin=tXY[0]-xSpacing*n/2;
                    n=Math.round((yMax-yMin)/ySpacing);
                    yMax=tXY[1]+ySpacing*n/2;
                    yMin=tXY[1]-ySpacing*n/2;
                    
                    
                    textures = [];
                    dstRects = [];

                    // n=length(xMin:xSpacing:xMax);

                    textures=zeros(1,n);
                    dstRects=zeros(4,n);

                    }
                    for (let lineIndex = 0; lineIndex < 3; lineIndex++) {
                        whichTarget=lineIndex%2;


                        for(let x = xMin; x < xMax; x+=xSpacing){

                            switch(oo[oi].thresholdParameter){
                                case 'spacing':
                                    whichTarget=(whichTarget+1)%2;
                                    break;
                                case 'size':
                                    var total = 0;
                                    var temp = [xMin, xMax];
                                    for(var i = 0; i < temp.length; i++) {
                                        total += temp[i];
                                    }
                                    var mean = total / temp.length;
                                    whichTarget=x>mean;
                                    break;
                            }
                                
                            if(isfield(oo[oi],'practiceCountdown') && oo[oi].practiceCountdown==0 && xMax>xMin && (any(abs(x-[xMin,xMax])<1e-9) || lineIndex==1)){
                                letter=oo[oi].borderLetter;

                            }
                            else{
                                letter=stimulus(1+whichTarget);
                            }

                            whichLetter=letters.match(letter);

                            textures[textureIndex]=letterStruct[whichLetter].texture;

                            if(oo[oi].showLineOfLetters){
                                console.log(oi,MFileLineNr,textureIndex,x,whichTarget,letter,whichLetter,textures[textureIndex]);
                            }
                                
                            xPos=Math.round(x-xPix/2);
                            
                            r=Math.round(letterStruct[whichLetter].rect);

                            oo[oi].targetHeightOverWidth=RectHeight(r)/RectWidth(r);

                            if(oo[oi].setTargetHeightOverWidth){
                                r=Math.round(ScaleRect(letterStruct[whichLetter].rect,oo[oi].targetHeightOverWidth/oo[oi].setTargetHeightOverWidth,1));
                                oo[oi].targetHeightOverWidth=RectHeight(r)/RectWidth(r);
                                // dstRects(1:4,textureIndex)=OffsetRect(round(r),xPos,0);
                            }
                            else{
                                if(oo[oi].targetSizeIsHeight){
                                    heightPix=oo[oi].targetPix;
                                }
                                else{
                                    heightPix=oo[oi].targetHeightOverWidth*oo[oi].targetPix;
                                }
                            
                            // dstRects(1:4,textureIndex)=OffsetRect(round((heightPix/RectHeight(letterStruct(whichLetter).rect))*letterStruct(whichLetter).rect),xPos,0);
                            }
                                
                            
                            if(oo[oi].showLineOfLetters){
                                r=Screen('Rect',textures[textureIndex]);
                                // Screen('DrawTexture',window,textures[textureIndex],r,dstRects(1:4,textureIndex));
                                // Screen('FrameRect',window,0,dstRects(1:4,textureIndex));                            
                            }
                            textureIndex=textureIndex+1;
                        }  

                        if(oo[oi].showLineOfLetters){
                            DrawCounter(oo);
                            DrawGazeTrackerMarks(oo);
                            Screen('Flip',window,0,0,oo[0].dontWait);
                            GetClicks;
                        }
                            
                        
                        // [lineTexture(lineIndex),lineRect{lineIndex}]=Screen('OpenOffscreenWindow',window,[],[0 0 oo[oi].stimulusRect(3) heightPix],8,0);
                        Screen('FillRect',lineTexture(lineIndex),white);
                        r=Screen('Rect',textures[0]);
                        Screen('DrawTextures',lineTexture(lineIndex),textures,r,dstRects);
                        
                    }

                    textures = [];
                    dstRects = [];

                    for(let y = yMin; y < yMax; y+=ySpacing){
                        if(yMax>yMin && any(abs(y-[yMin,yMax])<1e-9) % ismember(y,[yMin,yMax])){
                            whichMasterLine=1; 
                        }
                        else{
                            whichMasterLine=2+(lineIndex%2); 
                        }
                        textures[lineIndex]=lineTexture[whichMasterLine];
                        // dstRects(1:4,lineIndex)=OffsetRect(lineRect{1},0,round(y-RectHeight(lineRect{1})/2));
                        
                        lineIndex=lineIndex+1;
                    }


                    break;
            }

            Screen('TextFont',window,oo[oi].textFont,0);

            if(oo[oi].showProgressBar){
                Screen('FillRect',window,[0,220,0],progressBarRect);
                r=progressBarRect;
                r[3]=Math.round(r[3]*(1-presentation/condList.length));
                Screen('FillRect',window,[220,220,220],r); 
            }
                
            DrawCounter(oo);
            DrawGazeTrackerMarks(oo);

            if(!oo[oi].dontWait && oo[oi].fixationOffsetBeforeTargetOnsetSecs>0){
                WaitSecs('UntilTime',fixationOffsetSec+ oo[oi].fixationOffsetBeforeTargetOnsetSecs - oo[0].flipIntervalSec/2);
            }
               
                
            if(oo[oi].usePurring){
                Snd('Play',purr);
            }
       
        DrawGazeTrackerMarks(oo);
        [stimulusBeginVBLSec,stimulusBeginSec]=Screen('Flip',window,[],1,oo[0].dontWait);
        stimulusFlipSecs=GetSecs;

        if(exist('lineTexture','var')){
            for (let i = 0; i < lineTexture.length; i++) {
                Screen('Close',lineTexture[i]);
            }

            lineTexture = [];
        }
        if(!ismember(oo[oi].task,['read', 'readAloud', 'partialReport'])){
            targets=stimulus[1];
        }


        if(oo[oi].useFixation){
            if(oo[oi].targetSizeIsHeight){
                heightDeg=oo[oi].targetDeg;
            }
            else{
                heightDeg=oo[oi].targetDeg*oo[oi].targetHeightOverWidth;
            }
            
            oo[oi].oo[oi].fix.targetHeightPix=Math.round(heightDeg*pixPerDeg);
        
            oo[oi].fix=ComputeFixationStruct(oo,oi);
            fixationLines=ComputeFixationLines3(oo[oi].fix);
        }

        if(isfinite(oo[oi].durationSec) && !ismember(oo[oi].task,['read', 'readAloud', 'partialReport'])){
            Screen('FillRect',window,white,oo[oi].stimulusRect); 

            if((!oo[oi].repeatedTargets) && oo[oi].useFixation){
                if(!isempty(fixationLines) && oo[oi].fixationOnsetAfterTargetOffsetSecs==0){
                    Screen('DrawLines',window,fixationLines,Math.min(7,3*oo[oi].fix.fixationThicknessPix),white);
                    Screen('DrawLines',window,fixationLines,oo[oi].fix.fixationThicknessPix,black);
                }
                
            }
               
               

            DrawGazeTrackerMarks(oo);

            if(oo[oi].takeSnapshot){
                TakeSnapshot(oo);

            }
        
            deadSec=GetSecs-stimulusFlipSecs;

            [stimulusEndVBLSec,stimulusEndSec]=Screen('Flip',window,stimulusBeginSec+oo[oi].durationSec-oo[0].flipIntervalSec,1,oo[0].dontWait); 

            oo[oi].actualDurationSec(end+1)=stimulusEndSec-stimulusBeginSec;
            oo[oi].actualDurationVBLSec(end+1)=stimulusEndVBLSec-stimulusBeginVBLSec;
            oo[oi].actualDurationGetSecsSec(end+1)=GetSecs-stimulusFlipSecs;
            Screen('FillRect',window,white,oo[oi].stimulusRect);

            if(!isempty(fixationLines)){
                Screen('DrawLines',window,fixationLines,Math.min(7,3*oo[oi].fix.fixationThicknessPix),white);
                Screen('DrawLines',window,fixationLines,oo[oi].fix.fixationThicknessPix,black);
            }
               
            Screen('TextFont',window,oo[oi].textFont,0);
            Screen('TextSize',window,oo[oi].textSize);

            if(oo[oi].useFixation){
                string += `Look at the cross as you type your response.`;
            }else{
                string += 'Type your response, or ESCAPE to quit. ';
            }

            x=2*oo[0].textSize;
            y=1.5*oo[oi].textSize;
            scalar=1;
            sz=Math.round(scalar*oo[0].textSize);
            scalar=sz/oo[0].textSize;
            Screen('TextSize',window,sz);

            Screen('TextBackgroundColor',window,white); 

            DrawFormattedText(window,double(string),x,y,black,oo[oi].textLineLength/scalar,[],[],1.3);
            string='';
            n=letterStruct.length; 
            w=RectWidth(screenRect)-2*2*oo[oi].textSize; 

            oo[oi].responseTextWidth=Math.round(w/(n+(n-1)/2)); 

            Screen('TextSize',window,oo[oi].responseTextWidth);

         
            r=oo[oi].responseTextWidth/RectWidth(alphabetBounds);
            alphabetBounds=r*alphabetBounds;

           
            r=RectHeight(alphabetBounds)/RectHeight(oo[oi].stimulusRect);
            if(r>0.2){
                alphabetBounds=alphabetBounds*0.2/r;
            }
            alphabetBounds=Math.round(alphabetBounds);
            x=2*oo[oi].textSize;
            if(!exist('counterBounds','var') || isempty(counterBounds)){
                counterBounds=DrawCounter(oo);
            }
            gazeTrackerMarks=DrawGazeTrackerMarks(oo[oi]);
            
            switch(oo[oi].alphabetPlacement){
                case 'bottom':
                    y=oo[oi].stimulusRect(4);
                    y=y-RectHeight(alphabetBounds);
                    switch(oo[oi].counterPlacement){
                        case 'bottomLeft':
                        case 'bottomCenter':
                        case 'bottomRight':
                       
                        y = y - 1.5*RectHeight(counterBounds);
                        break;
                    }
                        
                    switch(oo[oi].instructionPlacement){
                        case 'bottomLeft':
                        
                            y=y-2*oo[oi].textSize;
                            break;
                    }
                        
                    break;
                case 'top':
                    y=oo[oi].stimulusRect[1]+1.1*RectHeight(alphabetBounds);
                    switch(oo[oi].instructionPlacement){
                        case 'topLeft':
                            y=y+2*oo[oi].textSize;
                            break;
                    }
                    break;
                        
                case 'none':
                    y="NaN";
                    break;
            }
                
            if(oo[oi].labelAnswers){
                labelTextSize=oo[oi].textSize;
                Screen('TextSize',window,labelTextSize);
            }

            for (let i = 0; i < oo[oi].alphabet.length; i++) {
                dstRect=OffsetRect(alphabetBounds,x,y);
                for (let j = 0; j < letterStruct.length; j++) {
                    if(oo[oi].alphabet[i]==letterStruct[j].letter){
                        Screen('DrawTexture',window,letterStruct[j].texture,[],dstRect);                    
                    }
                }

                if(oo[oi].labelAnswers){
                    labelRect=OffsetRect(dstRect,RectWidth(dstRect)/2-0.25*labelTextSize,-RectHeight(dstRect)-0.4*labelTextSize);
                    Screen('DrawText',window, double(oo[oi].validResponseLabels[i]),labelRect[1],labelRect[4],black,white,1);
                }

                x=x+1.5*RectWidth(dstRect);
            }

            Screen('TextSize',window,oo[oi].textSize);
            Screen('TextFont',window,oo[oi].textFont,0);
            if(!oo[oi].repeatedTargets && oo[oi].useFixation){
                if(!isempty(fixationLines)){
                    Screen('DrawLines',window,fixationLines,Math.min(7,3*oo[oi].fix.fixationThicknessPix),white);
                    Screen('DrawLines',window,fixationLines,oo[oi].fix.fixationThicknessPix,black);
                }
            }

            DrawCounter(oo); 
            DrawGazeTrackerMarks(oo);
         
            if(!oo[oi].dontWait){
                WaitSecs('UntilTime',stimulusEndSec+oo[oi].fixationOnsetAfterTargetOffsetSecs-oo[0].flipIntervalSec/2);
            }
            Screen('Flip',window,[],1,oo[0].dontWait); 
           
                

        }


        if(oo[oi].task == 'identify'){

            responseString='';
            skipping=false;
            flipSecs=GetSecs;
            trueFalse=['false','true'];

            for (let i = 0; i < targets.length; i++) {
                if(oo[oi].simulateObserver){
                    switch(oo[oi].thresholdParameter){
                        case 'spacing':
                            oo[oi].spacingDeg = spacingPix/pixPerDeg;
                            intensity = Math.log10(oo[oi].spacingDeg);
                        case 'size':
                            oo[oi].targetDeg = oo[oi].targetPix/pixPerDeg;
                            intensity = Math.log10(oo[oi].targetDeg);
                    }

                    if(true){
                        if(!oo[oi].useQuest){
                            console.log('Need o.useQuest=true to simulate observer.');
                        }

                        response = QuestSimulate(oo[oi].q, intensity, oo[oi].simulatedLogThreshold);

                        if(response){
                            answer=targets[i];
                        }else{
                            foils=oo[oi].alphabet;
                            k = !ismember(foils,targets[i]);
                            foils = foils[k];
                            foils = shuffle(foils);
                            answer = foils[0];
                        }
                    }
                    else{
                        if(intensity > oo[oi].simulatedLogThreshold){
                            answer=targets[i];
                            console.log(oi,intensity,Math.pow(10,intensity),oo[oi].spacingDeg,targets);
                        }else{
                            answer=shuffle(oo[oi].alphabet);
                            answer=answer[1];
                            console.log(oi,intensity,Math.pow(10,intensity),oo[oi].spacingDeg,trueFalse[1+streq(answer,targets)],oo[oi].alphabet,answer,targets);
                        
                        }
                        
                    }   
                    secs=GetSecs;
  
                }else{
                    // [answer,secs]=GetKeypressWithHelp( ...
                    //     [spaceKeyCode escapeKeyCode graveAccentKeyCode oo[oi].responseKeyCodes], ...
                    //     oo[oi],window,oo[oi].stimulusRect,letterStruct,responseString);
                    
                    // if oo[oi].isTrackingGaze && exist('socket')
                    //     % EYE TRACKER
                    //     stop_record;
                    // end
                }

                trialData.reactionTimes[i] = secs-flipSecs;

                if(ismember(answer,[escapeChar,graveAccentChar])){
                    [oo,skipTrial]=ProcessEscape(oo);

                    if(oo[1].quitBlock || oo[1].quitExperiment){
                        break;
                    }

                    if(skipTrial){
                        continue;
                    }
                }
                if(answer.toUpperCase() == ' '){
                    responsesNumber = responseString.length;
                    if(GetSecs-stimulusFlipSecs > oo[oi].secsBeforeSkipCausesGuess){
 
                        guesses=0;
                        while(responseString.length < targets.length){
                            reportedTarget = randsample(oo[oi].alphabet,1); 
                            responseString=[responseString,reportedTarget];
                            guesses=guesses+1;
                        }
                        guessCount = guessCount+guesses;
                        oo[oi].guessCount = oo[oi].guessCount+guesses;
                    }else{
                        guesses = 0;
                        presentation = presentation - Math.floor(1-responseString.length/targets.length);
                    }
                        
                    
                    skipping=true;
                    skipCount=skipCount+1;
                    easeRequest=easeRequest+1;
                    console.log(`*** Typed SPACE. Skipping to next trial. Observer gave ${responsesNumber} responses, and we added ${guesses} guesses.\n`);
                    break;
                }

                if(oo[oi].labelAnswers){
                    reportedTarget = oo[oi].alphabet(ismember(oo[oi].validResponseLabels.toUpperCase(),answer.toUpperCase()));
                }else{
                    reportedTarget = oo[oi].alphabet(ismember(oo[oi].alphabet.toUpperCase(),answer.toUpperCase()));
                }
            
                if(ismember(reportedTarget.toUpperCase(),uppertargets.toUpperCase())){
                    if(oo[oi].beepPositiveFeedback){
                        Snd('Play',rightBeep);
                    }                   
                }
                else{
                    if(oo[oi].beepNegativeFeedback){
                        Snd('Play',wrongBeep);
                    }
                }
                    
                responseString=[responseString,reportedTarget];

            }

            DestroyLetterTextures(letterStruct);
            if(!skipping){
                easeRequest=0;
            }

        }

        if(oo[1].quitBlock){
            break;
        }


        // Caculate responseScores.

        responseScores = ismember(responseString,targets);
        
        oo[oi].spacingDeg = spacingPix/pixPerDeg;
        
        trialData.targetDeg = oo[oi].targetDeg;
        trialData.spacingDeg = oo[oi].spacingDeg;
        trialData.targets = targets;
        trialData.targetScores = ismember(targets,responseString);
        trialData.responses = responseString;
        trialData.responseScores = responseScores;

        //  trialData.reactionTimes is computed above.
        if(!isfield(oo[oi],'practiceCountdown') || oo[oi].practiceCountdown==0){
            if(isempty(oo[oi].trialData)){
                oo[oi].trialData = trialData;
            }
            else{
                oo[oi].trialData[end+1] = trialData;
            }
        }

        responseScores.forEach(responseScore => {
            switch(oo[oi].thresholdParameter){
                case 'spacing':
                    intensity = Math.log10(oo[oi].spacingDeg);
                case 'size':
                    intensity = Math.log10(oo[oi].targetDeg);
            }
            
            if(!isfield(oo[oi],'practiceCountdown') || oo[oi].practiceCountdown==0){
                oo[oi].responseCount = oo[oi].responseCount+1;
                oo[oi].q = QuestUpdate(oo[oi].q,intensity,responseScore);
            }
        });

        if(isfield(oo[oi],'practiceCountdown') && oo[oi].practiceCountdown>0 && all(responseScores)){
            oo[oi].practiceCountdown=oo[oi].practiceCountdown-1;

            if(oo[oi].practiceCountdown){
                oo[oi].maxRepetition = 2*oo[oi].maxRepetition;
            }
            else{
                oo[oi].maxRepetition=inf;
            }
        }
       
        
        if(oo[1].quitBlock){
            break;
        }

        if(!all(responseScores) && oo[oi].fixationCheck){
            // % The observer failed to correctly identify an easy foveal
            // % The observer failed to correctly identify an easy foveal
            // % target. Before the next trial, encourage them to always have
            // % their eye on the center of the fixation mark when they hit
            // % the response key, which initiates the next trial.
            // % encourageFixation=true requests showing of a message before
            // % the next trial. We insist that the observer get right several
            // % (o.fixationCheckMakeupPresentations) consecutive trials of
            // % this condition before proceeding with the rest of the
            // % condition list.
            encourageFixation=true;
            encourageFixationString=`Oops. Wrong response. Perhaps you didn''t have your eye on the center of the cross. To finish sooner, please always place your eye at the center of the cross before initiating the next trial. `;
            
            // % Repeat the current condition for several trials.

            for (let i = 0; i < oo[oi].fixationCheckMakeupPresentations; i++) {
                // % Repeat the fixationCheck.

                // condList(presentation+1:end+1)=condList(presentation:end);

                // % Do the same to this list, to keep indexing coherent.

                // ii=sum(condList(1:presentation)==oi);

                // oo[oi].spacingsSequence(ii+1:end+1)=oo[oi].spacingsSequence(ii:end);
                
            }
            

        }  
        else{
            encourageFixation=false;
            encourageFixationString='';
        }

    }

}


function RectHeight(){
return 
}

function RectWidth(){

}

drawText('This is the top',canvas.width/2,20,24,'Pelli');
drawText('This is the bottom',canvas.width/2,canvas.height-20,16,'Pelli');



function drawText(text,centerX,centerY,fontsize,fontface,textAlign,textBaseline){
    ctx.save();
    ctx.font=fontsize+'px '+fontface;
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText(text,centerX,centerY);
    ctx.restore();
}

// Function to shuffle an array
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    while (0 !== currentIndex) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }


function isempty(array){
return array === undefined || array.length == 0;
}

//Repeat a 0-D to 2-D array or matrix MxN times.

function repmat(a,m,n){
    ndim = a.ndim;
    if(ndim == 0){
        origrows = 1;
        origcols = 1;
    }
    else if (ndim == 1){
        origrows = 1;
        origcols = a.shape[0];
    }
    else{
        origrows, origcols = a.shape;
    }
    rows = origrows * m;
    cols = origcols * n;
    c = a.reshape(1, a.size).repeat(m, 0).reshape(rows, origcols).repeat(n, 0);
    return c.reshape(rows, cols);
}


function zip() {
    var args = [].slice.call(arguments);
    var shortest = args.length==0 ? [] : args.reduce(function(a,b){
        return a.length<b.length ? a : b
    });

    return shortest.map(function(_,i){
        return args.map(function(array){return array[i]})
    });
}

function argsort(array) {

    const arrayObject = array.map((value, idx) => { return { value, idx }; });

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

function nonzero(arr){
arr = ( typeof arr != 'undefined' && arr instanceof Array ) ? arr : [arr]

return arr.reduce((ret_arr, number, index) => {
    if (number != 0) ret_arr.push(index)
    return ret_arr
}, [])
}

function interp( value, r1, r2 ) { 
    return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
}

function isinf(arr){
    arr = ( typeof arr != 'undefined' && arr instanceof Array ) ? arr : [arr]

    return arr.reduce((ret_arr, number, index) => {
        if (isFinite(number)){
        ret_arr.push(true)
        }else{
        ret_arr.push(false)
        }
        return ret_arr
    }, []);

}

function getinf(x){
    return nonzero(isinf(x))
}

function DrawCounter(o){

let window,scratchWindow,scratchRect,blockTrial,blockTrials;
let counterBounds,previousMessage,previousWindow;

o=o[0]; 

message='';
if(!isempty(blockTrial)){
    message=`Trial ${blockTrial} of ${blockTrials}. `;

}
if(isfield(o,'block') && isfield(o,'blocksDesired')){
    message=`${message} Block ${o.block} of ${o.blocksDesired}.`;
}

if(isfield(o,'viewingDistanceCm')){
    message=`${message} At ${o.viewingDistanceCm} cm.`;

}

if(isfield(o,'textSize')){
    counterSize = Math.round(0.6*o.textSize);
}
else{
    counterSize=20;
}

oldTextSize = Screen('TextSize',window,counterSize);
oldFont=Screen('TextFont',window,'Verdana');

if(isempty(previousMessage) || !ismember(message,previousMessage) || !ismember(window,previousWindow)){
    if(isempty(scratchWindow) || Screen('WindowKind',scratchWindow)!=-1){
        [scratchWindow,scratchRect]=Screen('OpenOffscreenWindow',window);
        if(Screen('WindowKind',scratchWindow)!=-1){
            error('scratchWindow is invalid');

        }
        
    }
        
    
    Screen('TextSize',scratchWindow,counterSize);
    Screen('TextFont',scratchWindow,Screen('TextFont',window));
    counterBounds=TextBounds2(scratchWindow,message,1);

    if(isfield(o,'screenRect')){
        r=o.screenRect;
    }
    else{
        r=Screen('Rect',window);
    }
    
    if(isfield(o,'stimulusRect') && isfield(o,'alphabetPlacement')){
        switch (o.alphabetPlacement) {
                
            case 'left':
                r(1)=max(r(1),o.stimulusRect(1));
                break;

            case 'right':
                r(3)=min(r(3),o.stimulusRect(3));
                break;

            case 'top':
                r(2)=max(r(2),o.stimulusRect(2));
                break;

            case 'bottom':
                //  r(4)=min(r(4),o.stimulusRect(4));
                break;

            default:
                break;
        }
    }

    r=InsetRect(r,counterSize/4,counterSize/8);
    if(!isfield(o,'counterPlacement')){
        o.counterPlacement='bottomRight';
    }
    
    switch(o.counterPlacement){
        case 'bottomRight':
            counterBounds=AlignRect(counterBounds,r,'right','bottom');
            break;
        case 'bottomLeft':
            counterBounds=AlignRect(counterBounds,r,'left','bottom');
            break;
        case 'bottomCenter':
            counterBounds=AlignRect(counterBounds,r,'center','bottom');
            break;
        default:
            break;

    }
        
    
}
else{
    // Use cached counterBounds.
}

drawText(message,counterBounds[0],counterBounds[1],fontsize,fontface,textAlign,textBaseline,'black');



Screen('TextFont',window,oldFont); 
Screen('TextSize',window,oldTextSize);

bounds=counterBounds;

previousMessage=message;

}

function isfield(x,y){
    if(x.hasOwnProperty(y)){
        return true;
    }
    return false;
}




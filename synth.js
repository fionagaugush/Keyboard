document.addEventListener("DOMContentLoaded", function(event) {

     wave_type= 'sine';
     const audioCtx = new (window.AudioContext || window.webkitAudioContext);

      modulatorFreqValue = 100;
      modulationIndexValue = 100 ;
      modulatorFreqValuefm = 100;


    const mod_slider = document.getElementById("mod");

    mod_slider.addEventListener("input", function() {
        const modValue = this.value;

         modulatorFreqValue = modValue;
    })

        const mod_sliderfm = document.getElementById("modfm");

      mod_sliderfm.addEventListener("input", function() {
            const modValuefm = this.value;

             modulatorFreqValuefm = modValuefm;
        })

    const index_slider = document.getElementById("index");

        index_slider.addEventListener("input", function() {
        const indexValue = this.value;

             modulationIndexValue = indexValue;
        })








     const keyboardFrequencyMap = {
        '90': 261.625565300598634,  //Z - C
        '83': 277.182630976872096, //S - C#
        '88': 293.664767917407560,  //X - D
        '68': 311.126983722080910, //D - D#
        '67': 329.627556912869929,  //C - E
        '86': 349.228231433003884,  //V - F
        '71': 369.994422711634398, //G - F#
        '66': 391.995435981749294,  //B - G
        '72': 415.304697579945138, //H - G#
        '78': 440.000000000000000,  //N - A
        '74': 466.163761518089916, //J - A#
        '77': 493.883301256124111,  //M - B
        '81': 523.251130601197269,  //Q - C
        '50': 554.365261953744192, //2 - C#
        '87': 587.329535834815120,  //W - D
        '51': 622.253967444161821, //3 - D#
        '69': 659.255113825739859,  //E - E
        '82': 698.456462866007768,  //R - F
        '53': 739.988845423268797, //5 - F#
        '84': 783.990871963498588,  //T - G
        '54': 830.609395159890277, //6 - G#
        '89': 880.000000000000000,  //Y - A
        '55': 932.327523036179832, //7 - A#
        '85': 987.766602512248223,  //U - B
    }






      const noteFrequencyMap = {

          '90': 'C',
            '83': 'C#',
            '88':  'D',
            '68': 'D#',
            '67':  'E',
            '86':  'F',
            '71':  'F#',
            '66': 'G',
            '72':  'G#',
            '78':  'A',
            '74': 'A#',
            '77':  'B',
            '81':  'C',
            '50': 'C#',
            '87': 'D',
            '51': 'D#',
            '69': 'E',
            '82':  'F',
            '53': 'F#',
            '84':  'G',
            '54': 'G#',
            '89':  'A',
            '55': 'A#',
            '85': 'B',
            }


    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);
    var message= "Please play a note using your keyboard";
    document.getElementById("number_of_notes").innerHTML = message;


partials_type = 1
synth_type = "AdditiveSynthesis"


var select_wave = document.getElementById('select_wave');

select_wave.addEventListener("change", function() {
                wave_type = select_wave.value;
})


var select_synth = document.getElementById('select_synth');

select_synth.addEventListener("change", function() {
                synth_type = select_synth.value;
})

var select_partials = document.getElementById('select_partials');

select_partials.addEventListener("change", function() {
                partials_type = select_partials.value;
})




    activeOscillators = {};
    activeGain = {}; //store the gain so we can decrease

    const globalGain = audioCtx.createGain(); //this will control the volume of all notes
    globalGain.gain.setValueAtTime((0.8), audioCtx.currentTime);
    globalGain.connect(audioCtx.destination);


    function getRandomColor() {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    function keyDown(event) {
        document.body.style.backgroundColor = getRandomColor();

        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {

           playNote(key);
           document.getElementById("note_played").innerHTML = noteFrequencyMap[key];

        }



    }

    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && activeOscillators[key]) {

            var gainNode = activeGain[key];

            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime+1); //release
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime+1);

           activeOscillators[key].stop(audioCtx.currentTime+1); //really stop it.

           delete activeOscillators[key];
           delete activeGain[key];
           document.getElementById("number_of_notes").innerHTML = "You are playing " + Object.keys(activeGain).length +  " note(s)!";

        }
    }


    function playNote(key) {

                  const osc = audioCtx.createOscillator();
                 osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime)

                 osc.type = wave_type; //choose your favorite waveform

                 var gainNode = audioCtx.createGain();
                 gainNode.connect(globalGain)
                 //all controlled by a gainNode, but connected to global gain.
                 activeOscillators[key] = osc;
                  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                  osc.start();
                 if (synth_type == "AdditiveSynthesis"){
                 add_osc = {}
                  for (i = 0; i<partials_type; i++) {
                      curr_osc = audioCtx.createOscillator();
                      add_osc[i] = curr_osc
                      curr_osc.frequency.setValueAtTime(keyboardFrequencyMap[key]*(2+i), audioCtx.currentTime)
                      curr_osc.type = wave_type
                      curr_osc.connect(gainNode)
                      curr_osc.start()
                 }
                 osc.connect(gainNode)
                 }

                else if (synth_type == "AM"){
                   var modulatorFreq = audioCtx.createOscillator();

                   modulatorFreq.frequency.setValueAtTime( modulatorFreqValue, audioCtx.currentTime)
                   activeOscillators[key] = modulatorFreq;

                    const modulated = audioCtx.createGain();
                    const depth = audioCtx.createGain();
                    depth.gain.value = 0.5
                    modulated.gain.value = 1.0 - depth.gain.value;

                    osc.connect(depth).connect(modulated.gain);

                    modulatorFreq.connect(modulated)

                    modulated.connect(gainNode);

                    modulatorFreq.start();

               }

                 else if (synth_type == "FM"){

                                   var modulatorFreq = audioCtx.createOscillator();

                                   modulationIndex = audioCtx.createGain();

                                   modulationIndex.gain.value = modulationIndexValue;
                                   modulatorFreq.frequency.setValueAtTime( modulatorFreqValuefm, audioCtx.currentTime)

                                   modulatorFreq.connect(modulationIndex);
                                   modulationIndex.connect(osc.frequency)

                                   osc.connect(gainNode);

                                   modulatorFreq.start();


                              }

                 var lfo = audioCtx.createOscillator();
                   lfo.frequency.value = 0.5;
                   lfoGain = audioCtx.createGain();
                   lfoGain.gain.value = 8;
                   lfo.connect(lfoGain).connect(osc.frequency);
                   lfo.start();



                 activeGain[key] = gainNode;

                  number_of_notes = Object.keys(activeGain).length;

         Object.keys(activeGain).forEach(function(key) {
          gainNode.gain.setTargetAtTime((.5/(number_of_notes+3)), audioCtx.currentTime,0.4); //attack (or decay from changing)
          gainNode.gain.setTargetAtTime((.4/(number_of_notes+3)), audioCtx.currentTime,0.3); //decay then sustain

         });


        document.getElementById("number_of_notes").innerHTML = "You are playing " + Object.keys(activeGain).length +  " note(s)!";

      }





      })


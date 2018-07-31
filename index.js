var btnRecord = document.querySelector("#btn-record");
var btnStop = document.querySelector("#btn-stop");
var sliderRate = document.querySelector("#rate");
var sliderDetune = document.querySelector("#detune");
var rateValue = document.querySelector("#rate-value");
var detuneValue = document.querySelector("#detune-value");
var shouldDownload = document.querySelector("#download");


sliderRate.onchange = function() {
    rateValue.innerHTML = sliderRate.value;
};

sliderDetune.onchange = function() {
    detuneValue.innerHTML = sliderDetune.value;
};


var ctx = new AudioContext();
var offline = new OfflineAudioContext(1, 5 * 48000, 48000);
var recorder = new RawMediaRecorder(ctx, { float32: false });
recorder.ondata = data => {
    // Data recorder as AudioBuffer
    console.log("data:", data);
    shiftPitch(shouldDownload.checked
        ? new OfflineAudioContext(data.numberOfChannels, data.length, data.sampleRate)
        : ctx,
        data);
}

btnRecord.onclick = function() {
    btnRecord.style.display = "none";
    btnStop.style.display = "block";
    recorder.start();
}


btnStop.onclick = function() {
    btnStop.style.display = "none";
    btnRecord.style.display = "block";
    recorder.stop();
}

function shiftPitch(audioContext, buffer) {
    var src = audioContext.createBufferSource();
    src.buffer = buffer;
    src.connect(audioContext.destination);

    src.playbackRate.value = +sliderRate.value; // <- changed the pitch without any fancy fucking filters :E
    src.detune.value = +sliderDetune.value;

    audioContext.oncomplete = function (ev) {
        var wav = audioBufferToWav(ev.renderedBuffer);

        var blob = new window.Blob([new DataView(wav)], {
            type: "audio/wav"
        });

        var url = window.URL.createObjectURL(blob);
        var anchor = document.createElement("a");
        document.body.appendChild(anchor);
        anchor.style = "display: none";
        anchor.href = url;
        anchor.download = "rate-" + sliderRate.value + "-detune-" + sliderDetune.value + "-sample.wav";
        anchor.click();
        window.URL.revokeObjectURL(url);
    }

    src.start();
    if (shouldDownload.checked) {
        audioContext.startRendering();
    }
}


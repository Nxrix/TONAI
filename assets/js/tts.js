  //----------------//
 //--Nxrix © 2024--//
//----------------//

const tts = {};
tts.endpoint = "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4";
tts.voices = "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4";
tts.voice = "en-US-AndrewMultilingualNeural";//"fa-IR-FaridNeural";

//--uuid v4 for generating random request id--//
tts.uuidv4 = () => {
  var uuid = ([1e7] + 1e3 + 4e3 + 8e3 + 1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
  return uuid;
}

//--main used message for tts service--//
tts.getWSPre = (date, requestId) => {
  var osPlatform = (typeof window !== "undefined") ? "Browser" : "Node";
  osPlatform += "/" + navigator.platform;
  var osName = navigator.userAgent;
  var osVersion = navigator.appVersion;
  return `Path: speech.config\r\nX-RequestId: ${requestId}\r\nX-Timestamp: ${date}\r\nContent-Type: application/json\r\n\r\n{"context":{"system":{"name":"SpeechSDK","version":"1.26.0","build":"JavaScript","lang":"JavaScript","os":{"platform":"${osPlatform}","name":"${osName}","version":"${osVersion}"}}}}`
}

tts.getWSAudio = (date,requestId) => {
  return `Path: synthesis.context\r\nX-RequestId: ${requestId}\r\nX-Timestamp: ${date}\r\nContent-Type: application/json\r\n\r\n{"synthesis":{"audio":{"metadataOptions":{"sentenceBoundaryEnabled":false,"wordBoundaryEnabled":false},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}`
};

tts.getWSText = (date, requestId, lang, voice, volume, rate, pitch, style, role, msg) => {
  var fmtVolume = volume === 1 ? "+0%" : volume * 100 - 100 + "%";
  var fmtRate = (rate >= 1 ? "+" : "") + (rate * 100 - 100) + "%";
  var fmtPitch = (pitch >= 1 ? "+" : "") + (pitch - 1) + "Hz";
  return `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${date}Z\r\nPath:ssml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='${lang}'><voice name='${voice}'><prosody pitch='${fmtPitch}' rate='${fmtRate}' volume='${fmtVolume}'>${msg}</prosody></voice></speak>`
};

tts.socket = new WebSocket(tts.endpoint);
tts.socket.binaryType = "arraybuffer";

//--keeping socket alive--//
tts.heartbeat = () => {
  if (tts.connected == true) {
    var date = new Date().toISOString();
    var requestId = tts.uuidv4();
    tts.socket.send(tts.getWSPre(date,requestId));
  }
  setTimeout(tts.heartbeat,1000);
}

tts.socket.onopen = function () {
  tts.connected = true;
  tts.heartbeat();
};
tts.socket.onclose = function () {
  tts.connected = false;
  console.log("TTS Socket Closed!");
};

//--tts output--//
tts.data = [];
tts.socket.onmessage = (event) => {
  if ((event.data) instanceof ArrayBuffer) {
    var text = new TextDecoder().decode(event.data.slice(0, 130));
    var reqIdx = text.indexOf(":");
    var uuid = text.slice(reqIdx + 1, reqIdx + 33);
    tts.data.push(event.data.slice(130));
  } else if (event.data.toString().indexOf("Path:turn.end") !== -1) {
    let reqIdx = event.data.toString().indexOf(":");
    let uuid = event.data.slice(reqIdx + 1, reqIdx + 33);
    let blob = new Blob(tts.data, {type: "audio/mpeg"});
    audio = new Audio();
    audio.src = URL.createObjectURL(blob);
    audio.play();
  }
};

//--main tts function--//
tts.speech = (inputText) => {
  if (tts.connected) {
    tts.data = [];
    var date = new Date().toISOString();
    var requestId = tts.uuidv4();
    var lang = tts.voice.slice(0,4);
    var volume = 1;
    var rate = 1;
    var pitch = 0;
    var style = "";
    var role = "";
    //--socket.send(getWSPre(date,requestId));--//
    tts.socket.send(tts.getWSAudio(date,requestId));
    var message = tts.getWSText(date, requestId, lang, tts.voice, volume, rate, pitch, style, role, (inputText||"Error"));
    tts.socket.send(message);
  }
}
const TTSClient = require('itri-tts');

const tts = new TTSClient("account", "password");

var options = {
  TTStext: '您好，我是Bruce',
  TTSSpeaker: 'Bruce',  // Bruce, Theresa, Angela, default = Bruce
  volume: 100,          // 0 ~ 100, default = 100
  speed: 0,             // -10 ~ 10, default = 0
  outType: 'wav',       // wav, flv
  PitchLevel: 0,        // -10 ~ 10, default = 0
  PitchSign: 0,         // 0, 1, 2, default = 0
  PitchScale: 5         // 0 ~ 20, default = 5
}

var data = async function(){
  options.TTStext = "宛儒生日快樂";
  //Create audio file .wav
  await new Promise (function(resolve,reject){
    tts.ConvertAdvancedText(options, function (err, result) {
      if (err) throw err
      if (result.resultString == "success"){
        //Get convert ID
        convertID = parseInt(result.resultConvertID);
        status = "";
        resolve();
      }
    });
  });

  //Waiting itri tts create audio
  while (status != "completed") {
    //Get audio .wav url
    await new Promise (function(resolve,reject){
      tts.GetConvertStatus(convertID, function (err, result) {
        if (err) throw err
        if (result.resultString == "success"){
          url = result.resultUrl;
          status = result.status;
          console.log(url);
          resolve();
        }
      });
    });
  }
}

data();

  //----------------//
 //--Nxrix © 2024--//
//----------------//

const lsys = {};

lsys.prefix = "TONAI";

lsys.save = (i,d) => {
  localStorage.setItem(lsys.prefix+i,d);
}

lsys.load = (i) => {
  return localStorage.getItem(lsys.prefix+i);
}

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: "https://nxrix.github.io/tonai/assets/tonconnect-manifest.json",
    buttonRootId: "ton-connect",
    uiPreferences: {
      theme: "DARK"
    }
});

input.addEventListener("input", function() {
  document.querySelector("footer").style.height = "0";
  document.querySelector("footer").style.height = this.scrollHeight + "px";
});

const main_content = document.querySelector(".main");
const chat_content = document.querySelector(".main .content");
gpt.demoHTML = chat_content.innerHTML;

send.onclick = async () => {
  var str = input.value;
  if (str && str.trim() && menu_active==false && gpt.generating==false) {
    await gpt.generate(str);
    chat_content.innerHTML = gpt.demoHTML;
    for (var i = 0; i < gpt.messages.length; i++) {
      var messageDiv = document.createElement("div");
      messageDiv.classList.add("message");
      if (gpt.messages[i].role == "user") {
        messageDiv.classList.add("right");
      } else {
        messageDiv.classList.add("left");
      }
      var userDiv = document.createElement("div");
      userDiv.classList.add("user");
      userDiv.innerText = gpt.messages[i].role == "user" ? "User" : "Assistant";
      var textDiv = document.createElement("div");
      textDiv.classList.add("text");
      textDiv.innerText = gpt.messages[i].content;
      messageDiv.appendChild(userDiv);
      messageDiv.appendChild(textDiv);
      chat_content.appendChild(messageDiv);
      var btnDiv = document.createElement("button");
      btnDiv.classList.add("audio");
      if (gpt.messages[i].role == "user") {
        btnDiv.classList.add("right");
      } else {
        btnDiv.classList.add("left");
      }
      btnDiv.innerHTML = gpt.messages[i].role == "user" ? "<img src=\"./img/svg/chevron-left.svg\">Play" : "Play<img src=\"./img/svg/chevron-right.svg\">";
      btnDiv.setAttribute("onclick","tts.speech(`"+gpt.messages[i].content+"`)")
      chat_content.appendChild(btnDiv);
    }
    main_content.scrollTop = main_content.scrollHeight;
    input.value = "";
  }
}

var menu_active = false;

settings.onclick = () => {
  menu_active = !menu_active;
  if (menu_active) {
    menu.classList.add("active");
  } else {
    menu.classList.remove("active");
  }
}

window.onload = async () => {
  voices_json = await fetch(tts.voices);
  voices_data = await voices_json.json();
  for (i in voices_data) {
    if (voices_data[i].Locale=="en-US") {
      var opt = document.createElement("option");
      opt.value = voices_data[i].ShortName;
      opt.innerHTML = voices_data[i].ShortName;
      select_voice.appendChild(opt);
    }
    if (voices_data[i].Locale=="ru-RU") {
      var opt = document.createElement("option");
      opt.value = voices_data[i].ShortName;
      opt.innerHTML = voices_data[i].ShortName;
      select_voice.appendChild(opt);
    }
    if (voices_data[i].Locale=="fa-IR") {
      var opt = document.createElement("option");
      opt.value = voices_data[i].ShortName;
      opt.innerHTML = voices_data[i].ShortName;
      select_voice.appendChild(opt);
    }
  }
  select_voice.value = (lsys.load("voice")||"en-US-AndrewMultilingualNeural");
  tts.voice = select_voice.value;
  secret_key.value = (lsys.load("secret_key")||"");
  gpt.secret_key = secret_key.value;
}

select_voice.addEventListener("change",() => {
  tts.voice = select_voice.value;
  lsys.save("voice",tts.voice);
});

secret_key.addEventListener("change",() => {
  gpt.secret_key = secret_key.value;
  lsys.save("secret_key",gpt.secret_key);
});
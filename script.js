
// 1

let chatsContainer = document.querySelector('.chats-container');

let container = document.querySelector('.container');

let promptForm = document.querySelector('.prompt-form');

let promptInput = promptForm.querySelector('.prompt-input');

let fileInput = promptForm.querySelector('#file-input');

let fileUploadWrapper = promptForm.querySelector('.file-upload-wrapper');

//41
let themeToggle = document.querySelector('#theme-toggle-btn');


//API SETUP
//9
let API = "";
let API_KEY = "AIzaSyBBASzK9GWe5ckYUMUe4u4gkohfxPEZ_Io";
//8
let API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

let userMessage = "";
//22
let userData = { message: "", file: {}};

//32
let typingInterval; 
let controller;

// 11
let chatHistory = [];


// 4
// function to create message elements
// let createMsgElement = (content, className) //1st one
let createMsgElement = (content, ...classes) => {     //second one
    let div = document.createElement('div');
    // div.classList.add("message", className);//1st one
    div.classList.add("message", ...classes);
    div.innerHTML = content;

    return div;
}


//scroll to the bottom of the container
// 18

let scrollBottom = () => container.scrollTo({ top: container.scrollHeight, behavior: "smooth"});




//stimulate typing effects for bot responses
//17 

let typingEffect = (text, textElement, botMsgDiv) => {
    textElement.textContent = "";

    let words = text.split("");

    let wordIndex = 0;


    //set an interval to type each word
    let typingInterval = setInterval(() => {
        if(wordIndex < words.length){
             textElement.textContent += (wordIndex === 0 ? "" : "") + words[wordIndex ++];
             //botMsgDiv.classList.remove(".loading"); //first
            
             scrollBottom();
        }else{
            clearInterval(typingInterval);
            //37
             botMsgDiv.classList.remove("loading");
             //36
             document.body.classList.remove("bot-responding");
        }
    }, 40);
}





// 7

let generateResponse = async(botMsgDiv) =>{

    //15
     let textElement = botMsgDiv.querySelector(".message-text");

     //33
     controller = new AbortController();




//25
//add  user message and file data to the chat history

chatHistory.push({
    role: "user",
    parts: [{text: userData.message}, ...(userData.file.data ? [{inline_data: (({ fileName, isImage, ...rest}) =>
         rest)(userData.file)}] : [])]

});












    //12
    //add user message to the chat history
    // chatHistory.push({
    //     role: "user",
    //     parts: [{  text: userMessage  }]
    // });


    try{
        let response = await fetch(API_URL, {
            //10
            
            method: "POST",
            headers: { "Content-Type": "appliaction/json" },
            body: JSON.stringify({  contents: chatHistory  }),

            //34
            signal: controller.signal
        });

        //13
        let data  = await response.json();
        if(!response.ok) throw new Error(data.error.message);

        // console.log(data);

        //14
        // process the response text and display it with typing effect
        let responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
        // textElement.textContent = responseText;

        //16
       typingEffect(responseText, textElement, botMsgDiv);
    //         let index = 0;
    // typingInterval = setInterval(() => {
    //     if (index < text.length) {
    //         textElement.textContent += text.charAt(index);
    //         index++;
    //     } else {
    //         clearInterval(typingInterval); // ✅ stop when done
    //     }
    // }, 2); 
    //     }

        //26

        chatHistory.push({role: "model", parts: [{text: responseText}] });

        // console.log(chatHistory);


    
    }catch(error){
        // console.log(error);
        //40
        textElement.style.color = "#d62939";
        textElement.textContent = error.name === "AbortError" ? "Response generation stopped." : error.message;
        
         botMsgDiv.classList.remove("loading");
             document.body.classList.remove("bot-responding");
   
    }finally{  //28
        userData.file = {};
    }
}

// 2
let handleFormSubmit = (e) => {
    e.preventDefault();
    //24
   // userMessage = promptInput.value.trim(); this one first till 23.
   
   
   let userMessage = promptInput.value.trim();

   //if (!userMessage) return; //first
    if (!userMessage || document.body.classList.contains("bot-responding")) return;
    // console.log("userMessage");

// 6
promptInput.value = "";

//23
    userData.message = userMessage;

//33
// document.body.classList.add("bot-responding"); //first
//44
document.body.classList.add("bot-responding", "chats-active");

    //30

     fileUploadWrapper.classList.add("active", "img-attached", "file-attached");  //hiding the file preview once the message is sent.


    // 3
    // generate user mesaage html and add in the chats container
    // let userMsgHTML =` <p class="message-text"></p> //first

    //28
    let userMsgHTML =` <p class="message-text"></p>
    ${userData.file.data ? (userData.file.isImage ? `<img src ="data:${userData.file.mime_type};base64,${userData.file.data}"
        class="img-attachment" />` : `<p class="file-attachment"><span class="material-symbols-rounded">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1d7efd"><path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/></svg>
        </span>${userData.file.fileName} </p>`)  : ""}`;
    
    
    
        let userMsgDiv = createMsgElement(userMsgHTML, "user-message");
    userMsgDiv.querySelector(".message-text").textContent = userMessage;

    chatsContainer.appendChild(userMsgDiv);

    //19
    scrollBottom();

    // 5
    setTimeout(() =>{
        // generate user mesaage html and add in the chats container after 600s
    let botMsgHTML =` <img src="image/gemini-chatbot-logo.svg" alt="" class="avatar"> <p class="message-text">A second...</p>`;
    let botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
   

    chatsContainer.appendChild(botMsgDiv);

    

    generateResponse(botMsgDiv);



    // 7
    //  generateResponse();
    }, 600);
}
// 1
promptForm.addEventListener("submit", handleFormSubmit);



//Handle file input change (file upload)
//21
//adding the slected file
fileInput.addEventListener("change", () => {
    let file = fileInput.files[0];
    if(!file) return;

    // console.log(file);

    let  isImage = file.type.startsWith("image/")
    let reader = new FileReader();
    reader.readAsDataURL(file);


    reader.onload = (e) =>{
        fileInput.value = "";   //clearing the file input so that users can reselect the same fileif they previously selected and cancelled it.
        
        //26
        let base64String = e.target.result.split(",")[1];
        
        fileUploadWrapper.querySelector(".file-preview").src = e.target.result;
        
        fileUploadWrapper.classList.add("active", isImage ? "img-attached" : "file-attached");


        //25
        //store file data in userData obj
        userData.file = {  fileName: file.name, data: base64String, mime_type: file.type, isImage };
   
    }
});


//21
//cancel button
//cancel file upload
document.querySelector("#cancel-file-btn").addEventListener("click", () => {

//     //27
    userData.file = {};
    fileUploadWrapper.classList.remove("active", "img-attached", "file-attached");

});

//stop ongoing bot response
//31
document.querySelector("#stop-response-btn").addEventListener("click", () => {
    userData.file = {};
   controller?.abort();
   clearInterval(typingInterval);

                //38
                chatsContainer.classList.remove("bot-message", "loading");

            //  chatsContainer.classList.remove(".bot-message.loading").classList.remove("loading");
             document.body.classList.remove("bot-responding");
        
});


//delete all chats
//39

document.querySelector("#delete-chats-btn").addEventListener("click", () => {
  chatHistory.length = 0;
  chatsContainer.innerHTML = "";
// document.body.classList.remove("bot-responding"); //first
document.body.classList.add("bot-responding", "chats-active");
});

///handle suggestions click
//43
document.querySelectorAll(".suggestions-item").forEach(item => {
    item.addEventListener("click", () => {
        promptInput.value = item.querySelector(".text").textContent;
        promptForm.dispatchEvent(new Event("submit"));
    });
});
//toggle light/dark theme
//42
themeToggle.addEventListener("click", () => {
 const isLightTheme =  document.body.classList.toggle("light-theme");
 localStorage.setItem("themeColor", isLightTheme ? "light_mode" : "dark_mode");
 themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";  //updates the theme icon according to the theme
});

//show/hide controls for mobile on prompt input focus
//45
document.addEventListener("click", ({ target }) => {
    const wrapper = document.querySelector(".prompt-wrapper");
    const showHide = target.classList.contains("prompt-input") || (wrapper.classList.contains
        ("hide-controls") && (target.id === "add-file-btn" || target.id === "stop-response-btn"));
    wrapper.classList.toggle("hide-controls", shouldHide);
});



//set initial theme from local storage
themeToggle.addEventListener("click", () => {
 const isLightTheme =  localStorage.getItem("themeColor") === 'light_mode';
document.body.classList.toggle("light_mode", isLightTheme);
 themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";  //updates the theme icon according to the theme
});


//20
promptForm.querySelector("#add-file-btn").addEventListener("click", () => fileInput.click()); //triggers the file input
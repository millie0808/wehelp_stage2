const pathname = window.location.pathname;
const apiURL = '/api'+pathname;
let GLOBAL_currentImgIndex = 0;

const attractionName = document.querySelector(".section__profile-name");
const attractionInfo = document.querySelector(".section__profile-info");
const attractionDescription = document.querySelector(".infos__description");
const attractionAddress = document.querySelector(".infos__address");
const attractionTransport = document.querySelector(".infos__transport");
const attractionImgsContainer = document.querySelector(".section__imgs-container");
const imgRadioInputsContainer = document.querySelector(".img-radio-inputs-container");

function createPageContent(attractionJSON){
    const attractionData = attractionJSON.data;

    attractionName.textContent = attractionData.name;
    if(attractionData.mrt){
        attractionInfo.textContent = attractionData.category+' at '+attractionData.mrt;
    }
    else{
        attractionInfo.textContent = attractionData.category;
    }
    attractionDescription.textContent = attractionData.description;
    attractionAddress.textContent = attractionData.address;
    attractionTransport.textContent = attractionData.transport;
    // img
    for(let i=0;i<attractionData.images.length;i++){
        let attractionImg = document.createElement("img");
        attractionImg.classList.add("section__img");
        attractionImg.src = attractionData.images[i];
        attractionImgsContainer.appendChild(attractionImg);
        // img radio input
        let imgRadioInputContainer = document.createElement("div");
        let imgRadioInput = document.createElement("input");
        imgRadioInputContainer.classList.add("img-radio-input-container");
        imgRadioInput.classList.add("img-radio-input");
        imgRadioInput.type = "radio";
        imgRadioInput.name = "img";
        imgRadioInput.id = i;
        if(i==0){
            imgRadioInput.checked = true;
        }
        else{
            attractionImg.classList.add("hidden");
        }
        imgRadioInputsContainer.appendChild(imgRadioInputContainer);
        imgRadioInputContainer.appendChild(imgRadioInput);
        // img radio input eventlistener
        imgRadioInput.addEventListener("change", () => {
            // 圖片轉換
            const images = document.querySelectorAll('.section__img');
            images[GLOBAL_currentImgIndex].classList.add('hidden');
            GLOBAL_currentImgIndex = Number(imgRadioInput.id);
            images[GLOBAL_currentImgIndex].classList.remove('hidden');
        })
    }
    

}

function handleImgsTrans(direction=none){
    const images = document.querySelectorAll('.section__img');
    images[GLOBAL_currentImgIndex].classList.add('hidden');
    if(direction==='right'){
        GLOBAL_currentImgIndex = (GLOBAL_currentImgIndex + 1) % images.length;
    }
    else{
        GLOBAL_currentImgIndex = (GLOBAL_currentImgIndex - 1 + images.length) % images.length;
    }
    images[GLOBAL_currentImgIndex].classList.remove('hidden');
    // 圖片圓點
    const selectImgRadioInput = document.getElementById(GLOBAL_currentImgIndex);
    if(selectImgRadioInput){
        selectImgRadioInput.checked = true;
    }
}


fetch(apiURL).then(response => {
    return response.json();
}).then(attractionJSON => {
    createPageContent(attractionJSON);
});

// Header title
const headerTitle = document.querySelector(".header__title");
headerTitle.addEventListener("click", () => {
    window.location.href = "/";
})

// imgs scroll 
const imgsLeftButton = document.querySelector(".left-arrow-btn");
const imgsRightButton = document.querySelector(".right-arrow-btn");
imgsLeftButton.addEventListener("click", () => handleImgsTrans(direction='left'));
imgsRightButton.addEventListener("click", () => handleImgsTrans(direction='right'));


// time 
const morningRadio = document.getElementById("morning");
const afternoonRadio = document.getElementById("afternoon");
const priceElem = document.querySelector(".price")
morningRadio.addEventListener("change", () => {
    priceElem.textContent = "新台幣 2000 元";    
})
afternoonRadio.addEventListener("change", () => {
    priceElem.textContent = "新台幣 2500 元";    
})
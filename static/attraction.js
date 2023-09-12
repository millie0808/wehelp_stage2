const pathname = window.location.pathname;
const apiURL = '/api'+pathname;
let GLOBAL_numOfImgs = 0;

const attractionName = document.querySelector(".section__profile-name");
const attractionInfo = document.querySelector(".section__profile-info");
const attractionDescription = document.querySelector(".infos__description");
const attractionAddress = document.querySelector(".infos__address");
const attractionTransport = document.querySelector(".infos__transport");
const attractionImgsContainer = document.querySelector(".section__imgs-container");
const attractionImgs = document.querySelector(".section__imgs");
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
    GLOBAL_numOfImgs = attractionData.images.length;
    // img
    for(let i=0;i<attractionData.images.length;i++){
        let attractionImg = document.createElement("img");
        attractionImg.src = attractionData.images[i];
        attractionImgs.appendChild(attractionImg);
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
        imgRadioInputsContainer.appendChild(imgRadioInputContainer);
        imgRadioInputContainer.appendChild(imgRadioInput);
        // img radio input eventlistener
        imgRadioInput.addEventListener("change", () => {
            let windowWidth = window.innerWidth;
            const imgsContainerCurrentLocation = attractionImgsContainer.scrollLeft;
            let currentImgId = 0;
            let scrollWidth = 0;
            if(windowWidth > 1200){
                currentImgId = imgsContainerCurrentLocation/540;
                scrollWidth = (imgRadioInput.id - currentImgId)*540;
            }
            else{
                currentImgId = imgsContainerCurrentLocation/windowWidth;
                scrollWidth = (imgRadioInput.id - currentImgId)*windowWidth;
            }
            let imgsContainerTargetLocation = imgsContainerCurrentLocation+scrollWidth;
            attractionImgsContainer.scrollTo({
                left: imgsContainerTargetLocation,
                behavior: 'smooth'
            });
        })
    }
    

}

function calcScrollWidth(){
    let windowWidth = window.innerWidth;
    if(windowWidth > 1200){
        return 540;
    }
    else{
        return windowWidth;
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
imgsLeftButton.addEventListener("click", () => {
    let windowWidth = window.innerWidth;
    let scrollWidth = calcScrollWidth();
    const imgsContainerCurrentLocation = attractionImgsContainer.scrollLeft;
    let targetImgId = 0;
    if(windowWidth > 1200){
        targetImgId = (imgsContainerCurrentLocation - scrollWidth)/540;
    }
    else{
        targetImgId = (imgsContainerCurrentLocation - scrollWidth)/windowWidth;
    }
    if(Number.isInteger(targetImgId) && targetImgId>-1){
        let targetScrollLeft = 0;
        if(windowWidth > 1200){
            targetScrollLeft = targetImgId * 540;
        }
        else{
            targetScrollLeft = targetImgId * windowWidth;
        }
        attractionImgsContainer.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
        });
        const selectImgRadioInput = document.getElementById(targetImgId);
        if(selectImgRadioInput){
            selectImgRadioInput.checked = true;
        }
    }
});
imgsRightButton.addEventListener("click", () => {
    let windowWidth = window.innerWidth;
    let scrollWidth = calcScrollWidth();
    const imgsContainerCurrentLocation = attractionImgsContainer.scrollLeft;
    let targetImgId = 0;
    if(windowWidth > 1200){
        targetImgId = (imgsContainerCurrentLocation + scrollWidth)/540;
    }
    else{
        targetImgId = (imgsContainerCurrentLocation + scrollWidth)/windowWidth;
    }
    // 檢查目標圖片id是否為整數以及目標圖片是否超出總圖片数量
    if (Number.isInteger(targetImgId) && targetImgId < GLOBAL_numOfImgs) {
        // 計算目標滾動距離
        let targetScrollLeft = 0;
        if(windowWidth > 1200){
            targetScrollLeft = targetImgId * 540;
        }
        else{
            targetScrollLeft = targetImgId * windowWidth;
        }
        // 執行平滑滾動
        attractionImgsContainer.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
        });
        // 圖片圓點
        const selectImgRadioInput = document.getElementById(targetImgId);
        if(selectImgRadioInput){
            selectImgRadioInput.checked = true;
        }
    }
});


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
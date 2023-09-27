const pathname = window.location.pathname;
const attractionIdApiURL = '/api'+pathname;
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


fetch(attractionIdApiURL).then(response => {
    return response.json();
}).then(attractionJSON => {
    if(attractionJSON.data){
        createPageContent(attractionJSON);
    }
    if(attractionJSON.error){
        window.location.href = '/';
    }
});

// imgs scroll 
const imgsLeftButton = document.querySelector(".left-arrow-btn");
const imgsRightButton = document.querySelector(".right-arrow-btn");
imgsLeftButton.addEventListener("click", () => handleImgsTrans(direction='left'));
imgsRightButton.addEventListener("click", () => handleImgsTrans(direction='right'));

function handle_date_format(date){
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// date min (today)
const dateInput = document.querySelector("#date");
const now = new Date();
const hour = now.getHours();
if(hour < 9){
    dateInput.min = handle_date_format(now);
}
else if(hour < 13){
    dateInput.min = handle_date_format(now);
    if(dateInput.value === handle_date_format(now)){
        morningRadio.disabled = true;
    }
}
else{
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1)
    dateInput.min = handle_date_format(tomorrow);
}


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

// start booking Button
const startBookingForm = document.querySelector("#start_booking");
startBookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const selectedTimeRadio = document.querySelector('input[type="radio"][name="time"]:checked');
    fetch('/api/booking', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "attractionID": Number(pathname.slice(12)),
            "date": dateInput.value,
            "time": selectedTimeRadio.value
        })
    }).then(response => {
        if(response.status === 403){
            popSignInUp();
        }
        return response.json();
    }).then(result => {
        if(result.ok){
            window.location.href = '/booking';
        }
    })
})
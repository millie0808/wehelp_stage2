fetch('/api/booking', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
    }
}).then(response => {
    return response.json();
}).then(booking_data => {
    if(booking_data.error){
        window.location.href = '/';
    }
    if(booking_data.data){
        fillDataIn(booking_data.data);
    }
    else{
        createEmptyBookingPage();
    }
})

const username = document.querySelector("#headline-username");
async function showUsername(){
    await checkAuthorization();
    username.textContent = GLOBAL_username;
}
showUsername();

const attractionName = document.querySelector("#order-attraction-name");
const attractionImg = document.querySelector(".order__img");
const bookingDate = document.querySelector("#order-booking-date");
const bookingTime = document.querySelector("#order-booking-time");
const bookingPrice = document.querySelector("#order-booking-price");
const attractionAddress = document.querySelector("#order-attraction-address");
const bookingTotalPrice = document.querySelector("#confirm-total-price");
function fillDataIn(data){
    attractionImg.src = data.attraction.image;
    attractionName.textContent = data.attraction.name;
    bookingDate.textContent = data.date;
    if(data.time === "morning"){
        bookingTime.textContent = "早上 9 點到中午 12 點";
    }
    if(data.time === "afternoon"){
        bookingTime.textContent = "下午 1 點到下午 4 點";
    }
    bookingPrice.textContent = "新台幣 " + data.price + " 元";
    const address = data.attraction.address.slice(0, 3)+" "+data.attraction.address.slice(3);
    attractionAddress.textContent = address;
    bookingTotalPrice.textContent = "新台幣 " + data.price + " 元";
}

const body = document.body;
const previewDiv = document.querySelector(".preview");
const orderDiv = document.querySelector(".order");
const mainSeparators = document.querySelectorAll(".separator_main");
const contactDiv = document.querySelector(".contact");
const paymentDiv = document.querySelector(".payment");
const confirmDiv = document.querySelector(".confirm");
function createEmptyBookingPage(){
    previewDiv.removeChild(orderDiv);
    mainSeparators.forEach(mainSeparator => {
        body.removeChild(mainSeparator);
    })
    body.removeChild(contactDiv);
    body.removeChild(paymentDiv);
    body.removeChild(confirmDiv);
    
    const noBookingSpan = document.createElement("span");
    noBookingSpan.classList.add("no-booking");
    noBookingSpan.classList.add("body_med");
    noBookingSpan.textContent = "目前沒有任何待預定的行程";
    previewDiv.appendChild(noBookingSpan);
}

const deleteBookingButton = document.querySelector(".order__info_delete");
deleteBookingButton.addEventListener("click", () => {
    fetch('/api/booking', {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`, 
        }
    }).then(response => {
        return response.json();
    }).then(result => {
        if(result.ok){
            window.location.reload();
        }
    })
})

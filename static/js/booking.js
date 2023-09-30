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
    username.textContent = GLOBAL_userdata.name;
}
showUsername();

const bookingExisted = document.querySelector(".booking-existed");
const attractionName = document.querySelector("#order-attraction-name");
const attractionImg = document.querySelector(".order__img");
const bookingDate = document.querySelector("#order-booking-date");
const bookingTime = document.querySelector("#order-booking-time");
const bookingPrice = document.querySelector("#order-booking-price");
const attractionAddress = document.querySelector("#order-attraction-address");
const bookingTotalPrice = document.querySelector("#confirm-total-price");
const contactNameInput = document.querySelector("#contact-name");
const contactEmailInput = document.querySelector("#contact-email");
function fillDataIn(data){
    bookingExisted.classList.remove("none");
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
    contactNameInput.value = GLOBAL_userdata.name;
    contactEmailInput.value = GLOBAL_userdata.email;
}

const body = document.body;
const footer = document.querySelector(".footer");
function createEmptyBookingPage(){    
    const noBookingSpan = document.createElement("span");
    noBookingSpan.classList.add("no-booking");
    noBookingSpan.classList.add("body_med");
    noBookingSpan.textContent = "目前沒有任何待預定的行程";
    body.insertBefore(noBookingSpan, footer);
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

let GLOBAL_bookingAttraction = null;
TPDirect.setupSDK(137046, 'app_vuPXg0uXGub1h401mLezFgLwvAfQ8IIpXAK4k6okD2K2NpF19NvjyTqmZrrl', 'sandbox')
TPFields = {
    number: {
        element: '#card-number',
        placeholder: '**** **** **** ****'
    },
    expirationDate: {
        element: '#card-expiration-date',
        placeholder: 'MM / YY'
    },
    ccv: {
        element: '#card-ccv',
        placeholder: 'CCV'
    }
}
TPStyles = {
    // Style all elements
    'input': {
        'color': 'gray'
    },
    // style valid state
    '.valid': {
        'color': 'green'
    },
    // style invalid state
    '.invalid': {
        'color': 'red'
    },
    // Media queries
    // Note that these apply to the iframe, not the root window.
    '@media screen and (max-width: 400px)': {
        'input': {
            'color': 'orange'
        }
    }
}
TPDirect.card.setup({
    // Display ccv field
    fields: TPFields,
    styles: TPStyles,
    // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
        beginIndex: 6,
        endIndex: 11
    }
})
TPDirect.card.onUpdate(function (update) {
    if (update.canGetPrime) {
        // Enable submit Button to get prime.
        $('button[type="submit"]').removeAttr('disabled')
        $('button[type="submit"]').addClass('confirm__btn-ready')
    } else {
        // Disable submit Button to get prime.
        $('button[type="submit"]').attr('disabled', true)
        $('button[type="submit"]').removeClass('confirm__btn-ready')
    }
    // number 欄位是錯誤的
    if (update.status.number === 2) {
        setNumberFormGroupToError('#card-number')
    } else if (update.status.number === 0) {
        setNumberFormGroupToSuccess('#card-number')
    } else {
        setNumberFormGroupToNormal('#card-number')
    }

    if (update.status.expiry === 2) {
        setNumberFormGroupToError('#card-expiration-date')
    } else if (update.status.expiry === 0) {
        setNumberFormGroupToSuccess('#card-expiration-date')
    } else {
        setNumberFormGroupToNormal('#card-expiration-date')
    }

    if (update.status.ccv === 2) {
        setNumberFormGroupToError('#card-ccv')
    } else if (update.status.ccv === 0) {
        setNumberFormGroupToSuccess('#card-ccv')
    } else {
        setNumberFormGroupToNormal('#card-ccv')
    }
})
// if($('button[type="submit"]').hasClass("confirm__btn-ready")){
//     $('button[type="submit"]').removeAttr('disabled')
// }
$('#booking-form').on('submit', event => {
    event.preventDefault()
    TPDirect.card.getPrime((result) => {
        if (result.status == 0) {
            // loading 動畫
            const confirmLoadingDiv = document.querySelector(".confirm-loading");
            confirmLoadingDiv.classList.remove("none");
            fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'prime': result.card.prime,
                    'order': {
                        'price': GLOBAL_bookingAttraction.price,
                        'trip': {
                            'attraction': GLOBAL_bookingAttraction.attraction,
                            'date': GLOBAL_bookingAttraction.date,
                            'time': GLOBAL_bookingAttraction.time
                        },
                        'contact': {
                            'name': $('#contact-name').val(),
                            'email': $('#contact-email').val(),
                            'phone': $('#contact-phone').val()
                        }
                    }
                })
            }).then(response => {
                return response.json()
            }).then(result => {
                if(result.data){
                    window.location.href = '/thankyou?number='+result.data.number;
                }
            })
        }
    })
})

function setNumberFormGroupToError(selector) {
    $(selector).addClass('has-error')
    $(selector).removeClass('has-success')
}
function setNumberFormGroupToSuccess(selector) {
    $(selector).removeClass('has-error')
    $(selector).addClass('has-success')
}
function setNumberFormGroupToNormal(selector) {
    $(selector).removeClass('has-error')
    $(selector).removeClass('has-success')
}

const phoneInput = document.getElementById("contact-phone");
phoneInput.addEventListener("input", function validatePhoneInput() {
    const phoneValue = phoneInput.value;
    const phonePattern = /^[0-9]*$/;
    if (!phonePattern.test(phoneValue)) {
        // 如果輸入不是數字，則清除非數字字符
        phoneInput.value = phoneValue.replace(/[^0-9]/g, '');
      }
    // 如果輸入不是以"09"開頭，移除前面的字符
    if (!phoneValue.startsWith("0")) {
        phoneInput.value = "";
    }
    if (phoneValue.startsWith("0")) {
        if (!phoneValue.startsWith("09")) {
            phoneInput.value = "0";
        }
    }
    // 如果長度超過10位，截斷成前10位
    if (phoneValue.length > 10) {
        phoneInput.value = phoneValue.substring(0, 10);
    }
})

window.addEventListener("load", () => {
    const orderImg = document.querySelector(".order__img");
    const orderImgLoading = document.querySelector(".order-img-loading");
    orderImgLoading.classList.add("none");
    orderImg.classList.remove("none");
})

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
        booking_data.data = convertDateFormat(booking_data.data);
        GLOBAL_bookingAttraction = booking_data.data;
        fillDataIn(booking_data.data);
    }
    else{
        createEmptyBookingPage();
    }
})

function convertDateFormat(booking_data){
    const dateStr = booking_data.date;
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    booking_data.date = year + '-' + month + '-' + day;
    return booking_data
}

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

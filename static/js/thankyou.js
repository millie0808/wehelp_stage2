const thankyouURL = window.location.search;
const thankyouUrlParams = new URLSearchParams(thankyouURL);
const GLOBAL_orderNumber = thankyouUrlParams.get('number');

fetch('/api/order/'+GLOBAL_orderNumber, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
    }
})
.then(response => {
    return response.json();
}).then(data => {
    if(data.data){
        fillInOrderNumber(data.data.number);
    }
    else{
        window.location.href = '/';
    }
})

window.addEventListener("DOMContentLoaded", () => {
    fetchThankyouData();
})

function fetchThankyouData(){
    
}

function fillInOrderNumber(orderNumber){
    const orderNumberSpan = document.querySelector("#order-number");
    orderNumberSpan.textContent = orderNumber;
}

const memberBtn = document.querySelector(".member-link");
memberBtn.addEventListener("click", () => {
    window.location.href = '/member';
})

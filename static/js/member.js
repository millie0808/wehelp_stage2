
fetch('/api/orders', {
    method: 'GET',
    headers:{
        'Authorization': `Bearer ${token}`
    }
}).then(response => {
    return response.json()
}).then(data => {
    if(data.error){
        window.location.href = '/';
    }
    if(data.data.length === 0){
        createEmptyOrderPage();
    }
    else{
        fillOrderIn(data.data);
    }
})

const orders = document.querySelector(".orders");
function fillOrderIn(data){
    for(i=0;i<data.length;i++){
        const orderOrder = document.createElement("div");
        orderOrder.classList.add("order-order", "header1");
        orderOrder.textContent = i+1;

        const orderContainer = document.createElement("div");
        orderContainer.classList.add("order__container", "button_reg");

        const orderImgContainer = document.createElement("div");
        orderImgContainer.classList.add("order__img-container");
        const orderImgLoading = document.createElement("div");
        orderImgLoading.classList.add("order-img-loading");
        const orderImg = document.createElement("div");
        orderImg.classList.add("order__img", "none");
        orderImgContainer.appendChild(orderImgLoading);
        orderImgContainer.appendChild(orderImg);

        const orderInfoContainer = document.createElement("div");
        orderInfoContainer.classList.add("order__info-container", "body_bold");
        const orderInfoSN = document.createElement("span");
        orderInfoSN.classList.add("body_bold");
        orderInfoSN.textContent = '訂單編號：' + data[i].SN;
        const orderInfoStatus = document.createElement("span");
        orderInfoStatus.classList.add("body_bold");
        const statusText = data[i].status ? "已繳費" : "未繳費";
        orderInfoStatus.textContent = '狀態：' + statusText;
        const orderInfoAttn = document.createElement("span");
        orderInfoAttn.classList.add("body_bold");
        orderInfoAttn.textContent = '景點：';
        const orderInfoDate = document.createElement("span");
        orderInfoDate.classList.add("body_bold");
        orderInfoDate.textContent = '日期：';
        const orderInfoTime = document.createElement("span");
        orderInfoTime.classList.add("body_bold");
        orderInfoTime.textContent = '時間：';
        const orderInfoPrice = document.createElement("span");
        orderInfoPrice.classList.add("body_bold");
        orderInfoPrice.textContent = '費用：' + data[i].amount;
        const orderInfoAddress = document.createElement("span");
        orderInfoAddress.classList.add("body_bold");
        orderInfoAddress.textContent = '地點：';
        orderInfoContainer.appendChild(orderInfoSN);
        orderInfoContainer.appendChild(orderInfoStatus);
        orderInfoContainer.appendChild(orderInfoAttn);
        orderInfoContainer.appendChild(orderInfoDate);
        orderInfoContainer.appendChild(orderInfoTime);
        orderInfoContainer.appendChild(orderInfoPrice);
        orderInfoContainer.appendChild(orderInfoAddress);

        const orderBtnContainer = document.createElement("div");
        orderBtnContainer.classList.add("order__btn-container");
        const orderBtn = document.createElement("button");
        orderBtn.classList.add("button_reg");
        if(data[i].status){
            orderBtn.classList.add("refund-btn");
            orderBtn.textContent = '退費';
        }
        else{
            orderBtn.classList.add("pay-btn");
            orderBtn.textContent = '繳費';
        }
        orderBtnContainer.appendChild(orderBtn);

        orderContainer.appendChild(orderImgContainer);
        orderContainer.appendChild(orderInfoContainer);
        orderContainer.appendChild(orderBtnContainer);

        orders.appendChild(orderOrder);
        orders.appendChild(orderContainer);
        if(i != data.length-1){
            const orderSeparator = document.createElement("div");
            orderSeparator.classList.add("separator_order");
            orders.appendChild(orderSeparator);
        }
    }
}

function createEmptyOrderPage(){
    const noOrder = document.createElement("div");
    noOrder.textContent = '目前沒有任何訂單';
    orders.appendChild(noOrder);
}

const username = document.querySelector("#headline-username");
async function showUsername(){
    await checkAuthorization();
    username.textContent = GLOBAL_userdata.name;
}
showUsername();
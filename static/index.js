const attractionsGroup = document.querySelector(".main__attractions-group");
const footer = document.querySelector(".footer");
let isSearching = false;
let GLOBAL_nextPage = null;
let GLOBAL_keyword = '';

// check Authorization
let apiURL = '/api/user/auth';
const token = localStorage.getItem('token');
fetch(apiURL, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
}).then((response) => {
    return response.json();
}).then((authorizationResult) => {
    if(authorizationResult){
        signInUpButton.classList.add("none");
        const signOutButton = document.querySelector(".header__btn-logout");
        signOutButton.classList.remove("none");
        signOutButton.addEventListener("click", () => {
            localStorage.removeItem('token');
            window.location.href = '/';
        })
    }
})

function createAttractionElement(attractionsJSON){
    const attractionsList = attractionsJSON.data;
    for(let i=0;i<attractionsList.length;i++){
        let attractionContainer = document.createElement("div");
        let attractionImg = document.createElement("img");
        let attractionNameContainer = document.createElement("div");
        let attractionInfoContainer = document.createElement("div");
        let attractionName = document.createElement("div");
        let attractionNameText = document.createElement("span");
        let attractionInfo = document.createElement("div");
        let attractionInfoMrt = document.createElement("span");
        let attractionInfoCategory = document.createElement("span");

        attractionContainer.classList.add("main__attraction-container");
        attractionImg.classList.add("main__attraction-img");
        attractionNameContainer.classList.add("main__attraction-name-container");
        attractionInfoContainer.classList.add("main__attraction-info-container");
        attractionName.classList.add("main__attraction-name");
        attractionNameText.classList.add("main__attraction-name-text");
        attractionNameText.classList.add("body_bold");
        attractionInfo.classList.add("main__attraction-info");
        attractionInfoMrt.classList.add("main__attraction-info-mrt");
        attractionInfoMrt.classList.add("body_med");
        attractionInfoCategory.classList.add("main__attraction-info-category");
        attractionInfoCategory.classList.add("body_med");

        attractionImg.src = attractionsList[i].images[0];
        attractionNameText.textContent = attractionsList[i].name;
        attractionInfoMrt.textContent = attractionsList[i].mrt;
        attractionInfoCategory.textContent = attractionsList[i].category;

        attractionsGroup.appendChild(attractionContainer);
        attractionContainer.appendChild(attractionImg);
        attractionContainer.appendChild(attractionNameContainer);
        attractionContainer.appendChild(attractionInfoContainer);
        attractionNameContainer.appendChild(attractionName);
        attractionName.appendChild(attractionNameText);
        attractionInfoContainer.appendChild(attractionInfo);
        attractionInfo.appendChild(attractionInfoMrt);
        attractionInfo.appendChild(attractionInfoCategory);
        // click to attraction page
        attractionContainer.addEventListener("click", () => {
            let url = "/attraction/"+attractionsList[i].id;
            window.location.href = url;
        });
    }
    // 下一頁資訊
    GLOBAL_nextPage = attractionsJSON.nextPage;
}

function createNoResultElem(){
    let attractionContainer = document.createElement("div");
    let noReultText = document.createElement("span");
    noReultText.textContent = "搜尋無結果";

    attractionContainer.classList.add("main__attraction-container");
    attractionContainer.classList.add("no_result");
    noReultText.classList.add("body_bold");

    attractionsGroup.appendChild(attractionContainer);
    attractionContainer.appendChild(noReultText);
}

function deleteALLAttractionElement(){
    const attractionContainers = attractionsGroup.querySelectorAll(".main__attraction-container");
    const attractionContainersArray = Array.from(attractionContainers);
    attractionContainersArray.forEach(function(attractionContainer){
        attractionsGroup.removeChild(attractionContainer);
    });
}

function searchForKeyword(page, keyword){
    isSearching = true;
    GLOBAL_keyword = keyword;
    let url = '/api/attractions?page='+page+'&keyword='+keyword;
    fetch(url).then(function(response){
        return response.json()
    }).then(function(attractionsJSON){
        deleteALLAttractionElement();
        if(attractionsJSON.data){
            createAttractionElement(attractionsJSON);
        }
        else{
            createNoResultElem();
        }
    });
}

function fetchAttractions(url){
    fetch(url).then(function(response){
        return response.json()
    }).then(function(attractionsJSON){
        createAttractionElement(attractionsJSON);
    });
}

function calcScrollWidth(){
    let windowWidth = window.innerWidth;
    if(windowWidth > 1200){
        return 1200 - 47*3;
    }
    else{
        return windowWidth - 47*3;
    }
}

function createSignUpResult(result){
    const existedResultSpan = document.querySelector("#sign-up-result");
    if(existedResultSpan){
        signUpContainer.removeChild(existedResultSpan);
    }
    let resultSpan = document.createElement("span");
    resultSpan.id = "sign-up-result";
    resultSpan.classList.add("sign-result");
    resultSpan.classList.add("body_med");
    if(result.ok){
        resultSpan.classList.add("success");
        resultSpan.textContent = "註冊成功，請登入系統";
    }
    if(result.error){
        resultSpan.classList.add("error");
        if(result.message === "註冊失敗，email已存在"){
            resultSpan.textContent = "Email已經註冊帳戶";
        }
        else if(result.message === "註冊失敗，email格式錯誤"){
            resultSpan.textContent = "Email格式錯誤";
        }
        else{
            resultSpan.textContent = "伺服器內部錯誤";
        }
    }
    signUpContainer.insertBefore(resultSpan, signUpJumpDiv);
}

function createSignInErrorResult(result){
    const existedResultSpan = document.querySelector("#sign-in-result");
    if(existedResultSpan){
        signInContainer.removeChild(existedResultSpan);
    }
    let resultSpan = document.createElement("span");
    resultSpan.id = "sign-in-result";
    resultSpan.classList.add("sign-result");
    resultSpan.classList.add("body_med");
    resultSpan.classList.add("error");
    if(result.message === "登入失敗，帳號密碼錯誤"){
        resultSpan.textContent = "電子郵件或密碼錯誤";
    }
    else if(result.message === "登入失敗，email格式錯誤"){
        resultSpan.textContent = "Email格式錯誤";
    }
    else{
        resultSpan.textContent = "伺服器內部錯誤";
    }
    signInContainer.insertBefore(resultSpan, signInJumpDiv);
}

// List bar
fetch('/api/mrts').then(function(response){
    return response.json()
}).then(function(mrts){
    mrtsList = mrts.data;
    const listBarItemContainer = document.querySelector(".main__list-item-container");
    for(i=0;i<mrtsList.length;i++){
        let listBarItemButton = document.createElement("button");
        let listBarItemName = document.createElement("span");
        
        listBarItemButton.classList.add("main__list-item");
        listBarItemName.classList.add("main__list-item-text");
        listBarItemName.classList.add("body_med");

        listBarItemName.textContent = mrtsList[i];

        listBarItemContainer.appendChild(listBarItemButton);
        listBarItemButton.appendChild(listBarItemName);   
    }
    // List bar Search
    const listItems = document.querySelectorAll(".main__list-item");
    listItems.forEach(function(listItem){
        listItem.addEventListener("click", () => {
            const listItemText = listItem.querySelector("span");
            const mrtNameForSearch = listItemText.textContent;
            searchInput.value = mrtNameForSearch;
            searchForKeyword(0, mrtNameForSearch);
        });
    });
});
// Attractions
fetchAttractions('/api/attractions?page=0');

// Load more
const loadMoreObserver = new IntersectionObserver(entries => {    
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // 如果加載指示符進入視口，執行加載下一頁的邏輯
            if(GLOBAL_nextPage){
                let url = '';
                if(isSearching){
                    url = '/api/attractions?page='+GLOBAL_nextPage+'&keyword='+GLOBAL_keyword;
                }
                else{
                    url = '/api/attractions?page='+GLOBAL_nextPage;
                }
                fetchAttractions(url);
            }
            else{
                isSearching = false;
            }
        }
    });
});
loadMoreObserver.observe(footer);


// List Bar Scroll
const listBarContainer = document.querySelector(".main__list-bar-container");
const listBarLeftButton = document.querySelector(".left-arrow-btn");
const listBarRightButton = document.querySelector(".right-arrow-btn");
// 左滾動按鈕事件
listBarLeftButton.addEventListener("click", () => {
    let scrollWidth = calcScrollWidth();
    const listBarCurrentLocation = listBarContainer.scrollLeft;
    let listBarTargetLocation = listBarCurrentLocation - scrollWidth;
    listBarContainer.scrollTo({
        left: listBarTargetLocation,
        behavior: 'smooth'
    });
});
// 右滾動按鈕事件
listBarRightButton.addEventListener("click", () => {
    let scrollWidth = calcScrollWidth();
    const listBarCurrentLocation = listBarContainer.scrollLeft;
    let listBarTargetLocation = listBarCurrentLocation + scrollWidth;
    listBarContainer.scrollTo({
        left: listBarTargetLocation,
        behavior: 'smooth'
    });
});

// Input : Focus placeholder color
const allInput = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
allInput.forEach(function(input){
    input.addEventListener("focus", () => {
        input.style.setProperty("--placeholder-color", "var(--secondary-color-gray-20)");
    })
    input.addEventListener("blur", () => {
        input.style.setProperty("--placeholder-color", "var(--secondary-color-gray-50)");
    })
});

// Search input : Keyup enter   !!!!!!
// const searchInput = document.querySelector(".guide__search-input");
// searchInput.addEventListener("keyup", (event) => {
//     if(event.key === "Enter" || event.keyCode === 13){
//         searchForKeyword();
//     }
// });

// Search button
const searchButton = document.querySelector(".guide__search-btn");
searchButton.addEventListener("click", () => {
    const inputValue = searchInput.value;
    searchForKeyword(0, inputValue);
});

// Header title
const headerTitle = document.querySelector(".header__title");
headerTitle.addEventListener("click", () => {
    window.location.href = "/";
})

// 登入/註冊 Button
const signInUpButton = document.querySelector(".header__btn-login");
const signIn = document.querySelector(".signin");
const signUp = document.querySelector(".signup");
signInUpButton.addEventListener("click", () => {
    signIn.classList.remove("none");
})

// 登入區塊
    // close
const signInClosButton = document.querySelector("#sign-in-close");
signInClosButton.addEventListener("click", () => {
    signIn.classList.add("none");
})
    // jump
const signInJumpButton = document.querySelector("#sign-in-jump");
signInJumpButton.addEventListener("click", () => {
    signIn.classList.add("none");
    signUp.classList.remove("none");
})

// 註冊區塊
    // close
const signUpClosButton = document.querySelector("#sign-up-close");
signUpClosButton.addEventListener("click", () => {
    signUp.classList.add("none");
})
    // jump
const signUpJumpButton = document.querySelector("#sign-up-jump");
signUpJumpButton.addEventListener("click", () => {
    signUp.classList.add("none");
    signIn.classList.remove("none");
})

// 註冊功能
const signUpForm = document.querySelector("#signupForm");
const signUpContainer = document.querySelector(".signup__container");
const signUpJumpDiv = document.querySelector("#sign-up-jump-div");
const signUpNameInput = document.getElementsByName("sign-up-name")[0];
const signUpEmailInput = document.getElementsByName("sign-up-email")[0];
const signUpPasswordInput = document.getElementsByName("sign-up-password")[0];

signUpForm.addEventListener("submit", (event) => {
    event.preventDefault(); //防止form submit跳轉行為
    const userData = {
        'name': signUpNameInput.value,
        'email': signUpEmailInput.value,
        'password': signUpPasswordInput.value
    };
    let apiURL = '/api/user';
    fetch(apiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    }).then((response) => {
        return response.json();
    }).then((result) => {
        createSignUpResult(result);
    })
})

// 登入功能
const signInForm = document.querySelector("#signinForm");
const signInContainer = document.querySelector(".signin__container");
const signInJumpDiv = document.querySelector("#sign-in-jump-div");
const signInEmailInput = document.getElementsByName("sign-in-email")[0];
const signInPasswordInput = document.getElementsByName("sign-in-password")[0];

signInForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const userData = {
        'email': signInEmailInput.value,
        'password': signInPasswordInput.value
    }
    let apiURL = '/api/user/auth';
    fetch(apiURL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    }).then((response) => {
        return response.json();
    }).then((result) => {
        if(result.error){
            createSignInErrorResult(result);
        }
        if(result.token){
            localStorage.setItem('token', result.token);
            window.location.href = '/';
        }
    })
})
// check Authorization
const token = localStorage.getItem('token');
let GLOBAL_username = null;
async function checkAuthorization(){
    await fetch('/api/user/auth', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        return response.json();
    }).then((authorizationResult) => {
        if(authorizationResult){
            signOutButton.classList.remove("none");
            GLOBAL_username = authorizationResult.data.name;
            bookingButton.addEventListener("click", () => {
                window.location.href = '/booking';
            })
        }
        else{
            signInUpButton.classList.remove("none");
            bookingButton.addEventListener("click", () => {
                popSignInUp();
            })
        }
    })
}
checkAuthorization();

// Header title
const headerTitle = document.querySelector(".header__title");
headerTitle.addEventListener("click", () => {
    window.location.href = "/";
})

// Input : Focus placeholder color
const allInput = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
allInput.forEach(function(input){
    input.addEventListener("focus", () => {
        input.style.setProperty("--placeholder-color", "#cccccc");
    })
    input.addEventListener("blur", () => {
        input.style.setProperty("--placeholder-color", "var(--secondary-color-gray-50)");
    })
});

// 登入/註冊 Button
const signInUpButton = document.querySelector(".header__btn-login");
const signIn = document.querySelector(".signin");
const signUp = document.querySelector(".signup");
function popSignInUp(){
    signIn.showModal();
}
signInUpButton.addEventListener("click", popSignInUp);
// 登出 Button
const signOutButton = document.querySelector(".header__btn-logout");
signOutButton.addEventListener("click", () => {
    localStorage.removeItem('token');
    window.location.reload();
})
// 預定行程 Button
const bookingButton = document.querySelector(".header__btn-booking");

// 登入區塊
    // close
const signInClosButton = document.querySelector("#sign-in-close");
signInClosButton.addEventListener("click", () => {
    signIn.close();
    const existedResultSpan = document.querySelector("#sign-in-result");
    if(existedResultSpan){
        signInContainer.removeChild(existedResultSpan);
    }
})
    // jump
const signInJumpButton = document.querySelector("#sign-in-jump");
signInJumpButton.addEventListener("click", () => {
    signIn.close();
    signUp.showModal();
})

// 註冊區塊
    // close
const signUpClosButton = document.querySelector("#sign-up-close");
signUpClosButton.addEventListener("click", () => {
    signUp.close();
    const existedResultSpan = document.querySelector("#sign-up-result");
    if(existedResultSpan){
        signUpContainer.removeChild(existedResultSpan);
    }
})
    // jump
const signUpJumpButton = document.querySelector("#sign-up-jump");
signUpJumpButton.addEventListener("click", () => {
    signUp.close();
    signIn.showModal();
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
            window.location.reload();
        }
    })
})

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
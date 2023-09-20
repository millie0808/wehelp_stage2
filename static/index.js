const attractionsGroup = document.querySelector(".main__attractions-group");
const footer = document.querySelector(".footer");
let isSearching = false;
let GLOBAL_nextPage = null;
let GLOBAL_keyword = '';

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

// Search input : Keyup enter   !!!!!!
// searchInput.addEventListener("keyup", (event) => {
//     if(event.key === "Enter" || event.keyCode === 13){
//         searchForKeyword();
//     }
// });

// Search button
const searchButton = document.querySelector(".guide__search-btn");
const searchInput = document.querySelector(".guide__search-input");
searchButton.addEventListener("click", () => {
    const inputValue = searchInput.value;
    searchForKeyword(0, inputValue);
});
const BASE_URL = "https://user-list.alphacamp.io"
const INDEX_URL = `${BASE_URL}/api/v1/users`
const userList = []
let filteredList = []
let followingList = []

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
let rawHTML = ""
const USERS_PER_PAGE = 12
const paginator = document.querySelector('#paginator')

//把API回傳資料push進陣列，再以renderUserList將API回傳資料寫成html形式
axios
    .get(INDEX_URL)
    .then((response) => {
        userList.push(...response.data.results);
        renderPaginator(userList.length);
        renderUserList(getUsersByPage(1));
    })
    .catch((err) => console.log(err));

//將資料寫成html形式
function renderUserList(data) {
    let rawHTML = "";
    data.forEach((user) => {
        rawHTML += `
        <div class="card m-2" style="width: 12rem;">
            <img src="${user.avatar}" class="card-img-top" alt="user-name" data-id="${user.id}">
                <div class="card-body">
                    <h5 class="card-title">${user.name}</h5>
                    <a href="#" class="btn btn-primary btn-add-following" data-id="${user.id}">Follow</a>
                    <a href="#" class="btn btn-primary btn-more-info" data-id="${user.id}" data-bs-toggle="modal" data-bs-target="#user-modal">More</a>
                </div>
        </div>
        `;
    });

    dataPanel.innerHTML = rawHTML;
}

function renderPaginator(amount) {
    const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
    let rawHTML = ''

    for (page = 1; page <= numberOfPages; page++) {
        rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    }

    paginator.innerHTML = rawHTML
}

function getUsersByPage(page) {
    //若 filteredList 長度不為0，回傳 filteredList；若 filteredList 長度為0，回傳 userList
    const data = filteredList.length ? filteredList : userList
    const startIndex = (page - 1) * USERS_PER_PAGE
    return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

//將Following資料寫成html形式
function addToFollowing(id) {
    let followingList = JSON.parse(localStorage.getItem('following')) || []
    let followingUser = userList.find((followingUser) => followingUser.id === id)
    if (followingList.some((followingUser) => followingUser.id === id)) {
        return alert('You are following this user!')
    }
    followingList.push(followingUser)
    localStorage.setItem('following', JSON.stringify(followingList))
}

// More 資訊彈窗
function showUserModal(id) {
    const modalTitle = document.querySelector("#user-modal-title")
    const modalImage = document.querySelector("#user-modal-image")
    const modalEmail = document.querySelector("#user-modal-email")
    const modalGender = document.querySelector("#user-modal-gender")
    const modalAge = document.querySelector("#user-modal-age")
    const modalRegion = document.querySelector("#user-modal-region")
    const modalBirthday = document.querySelector("#user-modal-birthday")

    let SHOW_URL = INDEX_URL + "/" + id

    axios.get(SHOW_URL).then((response) => {
        const data = response.data
        modalTitle.innerText = data.name
        modalEmail.innerText = "email: " + data.email
        modalGender.innerText = "gender: " + data.gender
        modalAge.innerText = "age: " + data.age
        modalRegion.innerText = "region: " + data.region
        modalBirthday.innerText = "birthday: " + data.birthday
        modalImage.innerHTML = `<img src="${data.avatar}" alt="" id="user-modal-image">`
    });
}

// 搜尋事件監聽器
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
    event.preventDefault()
    const keyword = searchInput.value.trim().toLowerCase()

    filteredList = userList.filter((user) =>
        user.name.toLowerCase().includes(keyword)
    )

    if (filteredList.length === 0) {
        return alert('Cannot find users with keyword:' + keyword)
    }

    renderPaginator(filteredList.length);
    renderUserList(getUsersByPage(1))
})

// 追蹤 & More 事件監聽器
dataPanel.addEventListener('click', function onPanelClicked(event) {
    if (event.target.matches('.btn-add-following')) {
        addToFollowing(Number(event.target.dataset.id))
    }
    if (event.target.matches('.btn-more-info')) {
        showUserModal(Number(event.target.dataset.id));
    }
})

// 分頁事件監聽器
paginator.addEventListener('click', function onPaginatorClicked(event) {
    if (event.target.tagName !== 'A') return

    const page = Number(event.target.dataset.page)
    renderUserList(getUsersByPage(page))
})
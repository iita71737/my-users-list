const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const users = []
const USERS_PER_PAGE = 12
let filterUsers = []
let nowpage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const searchMsg = document.querySelector('#search-message')
const usersModal = document.querySelector('#users-modal')
const msgBlock = document.querySelector('#msg-block')
msgBlock.style.display = "none";

function renderUsersList (data) {
  let rawHTML = ''
  data.forEach( (item) => {
    rawHTML += `
    <div class="col-xl-2 user-card">
        <div class="mb-2">
          <div class="card show-user-modal" data-id="${item.id}" >
                <img src=${item.avatar} class="card-img-top" alt="vatar" data-toggle="modal" data-target="#users-modal" >
                <div class="card-footer">
                 <button class="fas fa-heart btn btn-info btn-add-favorite m-md-2" id="addfavoritebtn" data-id="${item.id}" ></button>
                <button class="btn btn-secondary fas fa-times m-md-2 btn-del-favorite"  id="deletebtn" data-id="${item.id}"></button>
              </div>
            </div>
            
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

function showUsersModal (id) {
  const modalimg = document.querySelector('#users-modal-image')
  const modalDescription = document.querySelector('#users-modal-description')
  const modalFooter = document.querySelector('#users-modal-footer')
  
  axios.get(INDEX_URL + id)
  .then( (response) => {
    const data = response.data
    console.log(data)
    modalimg.innerHTML = `<div>
    <img src=${data.avatar} alt="movie-poster" class="img-fluid mb-3">
    </div>
    `
    modalDescription.innerHTML = `
    <div class="row">
    <ul class="list-group">
        <li class="list-group-item">Name: ${data.name + data.surname}</li>
          <li class="list-group-item">Gender: ${data.gender}</li>
          <li class="list-group-item">Birthday:${data.birthday}</li>
          <li class="list-group-item">Email: ${data.email}</li>   
          <li class="list-group-item">Age: ${data.age}</li>
    </ul>
    </div>
    `
    modalFooter.innerHTML = `
      <button class="fas fa-heart btn btn-info btn-add-favorite" id="addfavoritebtn" data-id="${data.id}" ></button>
     <button type="button" class="btn btn-secondary " data-dismiss="modal">Close</button>
    `
  })
}

function addToFavorite (id) {
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const user = users.find( (user) => user.id === id )
  if ( list.some( (user) => user.id === id) ) {
    return alert('此對象已經在收藏名單中!')
  }
  list.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
}

function getUsersByPage (page) {
  const data = filterUsers.length ? filterUsers : users
  const startIndex = (page - 1) * USERS_PER_PAGE
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

function renderPaginator ( amount ) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = `<li class="page-item">
        <a class="page-link" href="#" aria-label="Previous" data-page="pre">
          <span aria-hidden="true">&laquo;</span>
          <span class="sr-only">Previous</span>
        </a>
      </li>`
  for ( let page =1 ; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
      `
  }
  rawHTML += `<li class="page-item">
        <a class="page-link" href="#" aria-label="Next" data-page="next">
          <span aria-hidden="true">&raquo;</span>
          <span class="sr-only">Next</span>
        </a>
      </li>`
      paginator.innerHTML = rawHTML
}

function fadeIn() {
      msgBlock.classList.add('fadeInOut')
}

function fadeOut() {
      msgBlock.classList.remove('fadeInOut')
}

function removeFromFavorite (id) {
  if (!users) return
  const userIndex = users.findIndex( (user) => user.id === id )
  if (userIndex === -1) return
  users.splice(userIndex,1)
  renderPaginator(users.length)
  renderUsersList(getUsersByPage(1)) 
  //console.log(id)
}


searchForm.addEventListener('input', function onsearchFormSubmitted (e) {
    e.preventDefault()
    msgBlock.style.display = "block";
    msgBlock.style.opacity = 1
    const keyword = searchInput.value.trim().toLowerCase()

    filterUsers = users.filter( (user) => 
      user.name.toLowerCase().includes(keyword)
    )

    if (filterUsers.length === 0) {
      let msgHTML = `您輸入的姓名：${keyword} 沒有符合的對象`
      searchMsg.innerHTML = msgHTML
      renderUsersList(filterUsers)
    } else {
      searchMsg.innerHTML = `已比對到${filterUsers.length}筆資料`
      renderPaginator(filterUsers.length)
      renderUsersList(getUsersByPage(1)) 
    }
    setTimeout(
      function(){
        msgBlock.style.transition = "opacity " + 3 + "s"
        msgBlock.style.opacity = 0
        msgBlock.addEventListener("transitionend", function() {
          //console.log("transition has ended, set display: none;");
          msgBlock.style.display = "none";
        });
      }, 1000)
 //修改這裡
    
})


dataPanel.addEventListener('click', function onPanelClicked (e) {
   if ( e.target.matches('.card-img-top') )  {
     showUsersModal(Number(e.target.parentElement.dataset.id))
   } 
   else if ( e.target.matches('#addfavoritebtn')) {
    e.target.classList.remove('fa-heart')
    e.target.classList.add('fa-heart-broken')
    addToFavorite(Number(e.target.dataset.id))
  }
  else if (e.target.matches('.btn-del-favorite')) {
     removeFromFavorite(Number(e.target.dataset.id))
   }
  
})

usersModal.addEventListener('click', function onModalClicked (e) {
  if ( e.target.matches('#addfavoritebtn')) {
    addToFavorite(Number(e.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(e) {
  const finalPage = Math.ceil(users.length / USERS_PER_PAGE)

  if (e.target.tagName !== 'A') return
  
  let page = Number(e.target.dataset.page)
  
  if ( e.target.dataset.page === 'pre' && nowpage > 0) {
    page = nowpage - 1
    if ( page  === 0)  {
      return
    }
    renderUsersList(getUsersByPage(page))
  }

  if ( e.target.dataset.page === 'next' && nowpage < finalPage + 1 ) {
    page = nowpage + 1
    if ( page > finalPage ){
      return
    }
    renderUsersList(getUsersByPage(page))
  }

  renderUsersList(getUsersByPage(page))
  nowpage = page
  console.log(nowpage)
})

axios.get(INDEX_URL)
.then( (response) => {
  const data = response.data.results
  users.push(...data)
  renderPaginator(users.length)
  renderUsersList(getUsersByPage (1))
})
.catch((err) => console.log(err))

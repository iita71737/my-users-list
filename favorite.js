const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const users = JSON.parse(localStorage.getItem('favoriteUsers'))
let filterUsers = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const searchMsg = document.querySelector('#search-message')
const usersModal = document.querySelector('#users-modal')

function renderUsersList (data) {
  let rawHTML = ''
  data.forEach( (item) => {
    rawHTML += `
    <div class="col-xl-2 user-card">
        <div class="mb-2">
          <div class="card show-user-modal" data-id="${item.id}" data-toggle="modal" data-target="#users-modal">
                <img src=${item.avatar} class="card-img-top" alt="vatar">
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
      <button class="fas fa-trash btn btn-info btn-del-favorite" id="deletebtn" data-id="${data.id}" ></button>
      <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
    `
  })
}

function removeFromFavorite (id) {
  if (!users) return
  const userIndex = users.findIndex( (user) => user.id === id )
  if (userIndex === -1) return
  users.splice(userIndex,1)
  localStorage.setItem('favoriteUsers', JSON.stringify(users))
  renderUsersList(users)
}

dataPanel.addEventListener('click', function onPanelClicked (e) {
   if ( e.target.parentElement.matches('.show-user-modal') )  {
     showUsersModal(Number(e.target.parentElement.dataset.id))
   }
})

usersModal.addEventListener('click', function onModalClicked (e) {
  if (e.target.matches('.btn-del-favorite')) {
     removeFromFavorite(Number(e.target.dataset.id))
   }
})


renderUsersList (users)
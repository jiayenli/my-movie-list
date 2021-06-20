const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const MOVIES_PER_PAGE = 12
const paginator = document.querySelector('#paginator')
const icon = document.querySelector('.icon') //本次新增
let presentPage = 1//本次新增，把頁數抽取成可以共用的變數


axios.get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  }).catch((err) => console.log(err))


//監聽more點擊事件
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})


//監聽搜尋欄提交事件
let filteredMovies = []
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  if (!keyword.length) {
    return alert('請輸入有效字串！')
  }
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  renderPaginator(filteredMovies.length)
  //頁面改為第一頁
  presentPage = 1
  //判斷目前清單形式，決定搜尋結果形式
  PresentListMode(presentPage)
})

//監聽分頁切換
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  presentPage = page
  //本次新增：判斷頁面目前的版面，決定分頁要呼叫哪個版面的函式
  PresentListMode(presentPage)
})

//本次新增：監聽切換列表顯示模式
icon.addEventListener('click', function iconClicked(event) {
  if (event.target.matches('.PictureList')) {
    renderMovieList(getMoviesByPage(presentPage))
  } else if (event.target.matches('.nopictureList')) {
    renderNoPictureList(getMoviesByPage(presentPage))
  }
})

/////////////////函式區//////////////////////


//設定分頁
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

//計算分頁數
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

//顯示電影清單(圖片版本)

function renderMovieList(data) {
  let rawHTML = ""
  data.forEach((item) => {
    // title, image
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}

//電影詳情彈出視窗
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

//添加到收藏清單
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//新增:列表模式
function renderNoPictureList(data) {
  let rawHTML = `
    <table class="table">
      <tbody>`
  data.forEach((item) => {
    // title, image
    rawHTML += `
         <tr>
           <th scope="row">
             <td class="card-title">${item.title}</td>
             <td> <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
             <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
             </td>
            </th>
          </tr> `
  })
  rawHTML += `</tbody>
      </table >
  `
  dataPanel.innerHTML = rawHTML
}

//判斷要呈現哪個模式的頁面

function PresentListMode(presentPage){
  if (dataPanel.firstElementChild.tagName === "DIV") {
    renderMovieList(getMoviesByPage(presentPage))
  } else if (dataPanel.firstElementChild.tagName === "TABLE") {
    renderNoPictureList(getMoviesByPage(presentPage))
  }
}
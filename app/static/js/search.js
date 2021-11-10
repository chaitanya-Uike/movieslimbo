const searchBar = document.getElementById("search-bar")
const searchForm = document.getElementById("search-form")
const resultContainer = document.getElementById("result-container")
const userResultContainer = document.getElementById("user-result-container")
const searchButton = document.getElementById("search-button")
const resultDisplayContainer = document.querySelector(".result-display-container")
const closeSearchContainer = document.getElementById("close-search-container")


async function searchMovies(csrftoken, keyword) {
    const response = await fetch('/searchMovies/', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({
            "keyword": keyword,
        })
    })

    if (response.ok) {
        const data = await response.json()
        const results = data.results

        if (results.length > 0)
            resultContainer.style.display = "block"
        else
            resultContainer.style.display = "none"

        resultContainer.innerHTML = ''

        //show only the first five results
        results.slice(0, 5).forEach(result => {
            if (result.poster_path == null) {
                resultContainer.innerHTML += `
                <a href="/info/${result.id}" class="result-card text-decoration-none">
                    <div class="img"><i class="material-icons">blur_on</i></div>
                    <h5>${result.title}</h5>
                    <p>${result.release_date}</p>
                </a>
                `
            }
            else {
                resultContainer.innerHTML += `
            <a href="/info/${result.id}" class="result-card">
                <img class="img" src="https://image.tmdb.org/t/p/w92/${result.poster_path}" alt="">
                <h5>${result.title}</h5>
                <p>${result.release_date}</p>
            </a>
            `}
        })
    }
    else {
        console.log("some error occured!")
    }
}

async function searchUsers(csrftoken, keyword) {
    const response = await fetch('/searchUsers/', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({
            "keyword": keyword,
        })
    })

    if (response.ok) {
        const data = await response.json()
        const results = data.results

        console.log(results)

        if (results.length > 0)
            userResultContainer.style.display = "block"
        else
            userResultContainer.style.display = "none"

        userResultContainer.innerHTML = ''

        //show only the first five results
        results.slice(0, 5).forEach(result => {
            userResultContainer.innerHTML += `
            <a href="/profile/${result.username}" class="user-result-card text-decoration-none">
                <div class="user-profile"></div>
                <h5>${result.username}</h5>
            </a>
                `
        })
    }
    else {
        console.log("some error occured!")
    }
}


async function search(csrftoken, keyword) {
    const response = await Promise.all([
        searchMovies(csrftoken, keyword),
        searchUsers(csrftoken, keyword)
    ])
}

//set the timeout so that we dont make reqest on each key press
let searchTimeout
searchBar.addEventListener("keyup", event => {
    let csrftoken = searchForm['csrfmiddlewaretoken'].value
    let keyword = event.target.value

    if (searchTimeout != undefined)
        clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        search(csrftoken, keyword)
    }, 250);

})

let searchBarActive = false

//to close the result container and clear searchbar 
closeSearchContainer.addEventListener("click", event => {
    searchBar.style.display = "none"
    resultContainer.style.display = "none"
    userResultContainer.style.display = "none"
    event.target.style.display = "none"
    searchBar.value = ""
    searchBarActive = false
    searchButton.classList.remove("active")
})

resultDisplayContainer.addEventListener("click", event => {
    if (event.target != this) {
        searchBar.style.display = "none"
        resultContainer.style.display = "none"
        userResultContainer.style.display = "none"
        closeSearchContainer.style.display = "none"
        searchBar.value = ""
        searchBarActive = false
        searchButton.classList.remove("active")
    }

})

searchBar.addEventListener("focus", event => {
    document.getElementById("close-search-container").style.display = "inline-block"
})

searchButton.addEventListener("click", event => {
    if (!searchBarActive) {
        searchBar.style.display = "block"
        searchBar.focus()
        searchBarActive = true
        searchButton.classList.add("active")
    }
    else {
        searchBar.style.display = "none"
        closeSearchContainer.style.display = "none"
        resultContainer.style.display = "none"
        userResultContainer.style.display = "none"
        searchBar.value = ""
        searchBarActive = false
        searchButton.classList.remove("active")
    }

})

searchForm.addEventListener("submit", event => {
    event.preventDefault()
})
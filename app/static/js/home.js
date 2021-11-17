const apiKey = '09dbf57fe94efeab48abeb2a2e2d1ca5'

const carouselContainer = document.querySelector(".carousel-inner")

async function fetchPopularMovies() {
    const response = await fetch(`
    https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`)

    return data = await response.json()
}

window.onload = () => {
    fetchPopularMovies()
        .then(data => {
            data.results.slice(0, 5).forEach(element => {
                carouselContainer.innerHTML +=
                    ` 
                    <div class="carousel-item" data-bs-interval="5000">
                        <a href="/info/movie/${element.id}" class="carousel-img">
                            <img src="https://image.tmdb.org/t/p/original/${element.backdrop_path}" class="d-block w-100" alt="poster">
                            <div class="carousel-caption d-none d-md-block">
                                <h5>${element.title}</h5>
                            </div>
                        </a>
                    </div>`
            })

            carouselContainer.children[0].classList.add("active")
        })


}
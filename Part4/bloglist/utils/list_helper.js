const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const likes = blogs.map(blog => blog.likes)
    return likes.reduce((ant, sig) => ant + sig, 0)
}

const favoriteBlog = (blogs) => {
    
    const maxLikesBlog = blogs.map(blog => blog.likes)
    const maxLikes = Math.max(...maxLikesBlog)
    console.log(maxLikes)
    const mostLiked = blogs.find(blog => blog.likes === maxLikes)
    return mostLiked
    
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}


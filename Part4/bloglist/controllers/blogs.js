const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {

    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)

})

blogsRouter.get('/:id', async (request, response) => {

    const blog = await Blog.findById(request.params.id)
    response.json(blog)

})


blogsRouter.post('/', middleware.tokenExtractor, middleware.userExtractor, async (request, response) => {

    const user = request.user

    const blog = new Blog({
        title: request.body.title,
        author: request.body.author,
        url: request.body.url,
        likes: request.body.likes,
        user: user._id
    })

    const saveBlog = await blog.save()
    user.blogs = user.blogs.concat(saveBlog._id)
    await user.save()
    response.status(201).json(saveBlog)

})

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true, runValidators: true, context: 'query' })
    response.status(200).json(updatedBlog)

})

blogsRouter.delete('/:id', middleware.tokenExtractor, middleware.userExtractor, async (request, response) => {

    const user = request.user
    
    const blog = await Blog.findById(request.params.id)

    if (blog.user.toString() === user._id.toString()) {
        const deletedBlog = await Blog.findByIdAndRemove(request.params.id)
        response.status(204).end()
    } else {
        return response.status(401).json({ error: 'Cant delete other people posts' })
    }

    
})


module.exports = blogsRouter
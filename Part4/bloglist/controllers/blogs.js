const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {

    const blogs = await Blog.find({})
    response.json(blogs)

})

blogsRouter.get('/:id', async (request, response) => {

    const blog = await Blog.findById(request.params.id)
    response.json(blog)

})

blogsRouter.post('/', async (request, response) => {

    const user = await User.findById(request.body.userId)

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

blogsRouter.delete('/:id', async (request, response) => {

    console.log(request.params.id)

    const deletedBlog = await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()

})


module.exports = blogsRouter
import express from 'express'
import Story from '../interfaces/story'

// Render a page while providing session variables, and resetting the temporary output and success variables
var renderPage = function (req: express.Request, res: express.Response, route: string, title: string, story?: Story | null, ...stories: Story[][]) {
    res.render(route,{
        title: title,
        username: req.session.username,
        output: req.session.output,
        success: req.session.success,
        story: story,
        stories: stories[0]
    })

    // Delete these two session variables to avoid repeating the same user-feedback message if the user refreshes the page
    delete req.session.output
    delete req.session.success
}

export default renderPage
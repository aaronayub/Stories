// Interface for one user-written story, including both metadata and the content itself.

interface Story {
    id: number,
    title: string,
    brief?: string,
    content?: string,
    username: string,
    rating: number,
    created: string,
    cover?: boolean,
    yourRating?: number
}

export default Story
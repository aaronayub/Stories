// Interface for a comment left by a user.

interface Comment {
    comment: string,
    created: string,
    username: string,
    cid: number,
    id: number,
    rating?: number,
    delete?: boolean
}

export default Comment
// Interface for a comment left by a user.

interface Comment {
    comment: string,
    created: string,
    username: string,
    rating?: number
}

export default Comment
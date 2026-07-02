import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: String,
        default: () =>
            new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            })
    }
});

export default mongoose.model("Post", postSchema);
import type { NextApiRequest, NextApiResponse } from "next";
import { getConnection } from "typeorm";
import statusCodes from "../../../../utils/status_codes";
import { connectDB } from "../../../../utils/db_connect";
import { Questions } from "../../../../entities/question_bank/question";
import { Comment } from "../../../../entities/question_bank/comment";
import { getUserID } from "../../../../utils";

async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
    try {
        let {question_id, body}  = req.body;
        let user_id = await getUserID(req);
        if(! user_id){
            throw new Error('User not found.');
        }
        let question = await getConnection().manager.findOne("Questions", {id: question_id}) as Questions;
        if(!question) {
            throw new Error('Question not found.');
        }
        let comment = new Comment();
        comment.question = question;
        comment.createdAt = new Date();
        comment.userId = user_id;
        comment.body = body;
        await getConnection().manager.save("Comment", comment);
        res.status(statusCodes.CREATED).json({
            success: true
        });
    } catch (err) {
        res.status(statusCodes.BAD_REQUEST).json({
            success: false,
            message: `${err}`
        });
    }
}

async function handleDeleteRequest(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectDB();
        let {comment_id}  = req.query;
        if(!comment_id || Array.isArray(comment_id)) {
            throw new Error('Question not found.');
        }
        let result = await getConnection().manager.delete("Comment", {id: comment_id});
        res.status(statusCodes.OK).json({
            success: true,
            deleted: result?.affected || 0
        });
    } catch (err) {
        res.status(statusCodes.BAD_REQUEST).json({
            success: false,
            message: `${err}`
        });
    }
}


async function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectDB();
        let {question_id}  = req.query;
        if(!question_id || Array.isArray(question_id)) {
            throw new Error('Question not found.');
        }
        let question = await getConnection().manager.findOne("Questions", {id: question_id}) as Questions;
        let comments = question.comments;
        comments.sort((b,a)=>a.upvotes.length-b.upvotes.length);
        res.status(statusCodes.OK).json({
            success: true,
            comments
        });
    } catch (err) {
        res.status(statusCodes.BAD_REQUEST).json({
            success: false,
            message: `${err}`
        });
    }
}

async function handlePatchRequest(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectDB();
        let {comment_id}  = req.query;
        if(!comment_id || Array.isArray(comment_id)) {
            throw new Error('Question not found.');
        }
        let comment = await getConnection().manager.findOne("Comment", {id: comment_id}) as Comment;
        comment.body = req.body.body;
        await getConnection().manager.save("Comment", comment);
        res.status(statusCodes.OK).json({
            success: true,
            comment
        });
    } catch (err) {
        res.status(statusCodes.BAD_REQUEST).json({
            success: false,
            message: `${err}`
        });
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        handlePostRequest(req, res);
    }
    else if (req.method === 'GET') {
        handleGetRequest(req, res);
    }
    else if(req.method === 'DELETE') {
        handleDeleteRequest(req, res);
    }
    else if (req.method ==='PATCH') {
        handlePatchRequest(req, res);
    }
    else {
        res.status(statusCodes.BAD_REQUEST).json({
            success: false, message: `Method ${req.method} is not supported at this endpoint.`
        });
    }
}


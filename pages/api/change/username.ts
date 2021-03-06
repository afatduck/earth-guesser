import { NextApiRequest, NextApiResponse } from "next";
import { validateUsernameError } from "../../../utils/validate";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";

import prisma from "../../../utils/prisma";
import client from "../../../utils/redis/client";
import updateUpdatedAt from "../../../utils/redis/updated-at";

export default async function changeUsername(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    if (method !== 'POST') {
        return res.status(405).json({
            status: 405,
            message: 'Method not allowed'
        });
    }
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({
            status: 400,
            message: 'Username is required'
        });
    }
    const error = validateUsernameError(username);
    if (error) {
        return res.status(400).json({
            status: 400,
            message: error
        });
    }
    const session = await getSession({ req });
    if (!session || !session.user) {
        return res.status(401).json({
            status: 401,
            message: 'Unauthorized'
        });
    }
    if (await client.SISMEMBER('TAKEN_USERNAMES', username)) {
        return res.status(400).json({
            status: 400,
            message: 'Username is already taken'
        });
    }
    const prevUsername = (await prisma.user.findFirst({
        where: {
            id: session.user.id
        },
        select: {
            username: true
        }
    }))?.username;
    await prisma.user.update({
        where: { id: (session as Session).user.id },
        data: { username }
    }).then(() => {
        res.status(200).json({
            status: 200,
            message: 'Success'
        });
        client.SADD('TAKEN_USERNAMES', username);
        if (prevUsername) return client.SREM('TAKEN_USERNAMES', prevUsername);
        updateUpdatedAt(session.user.id);
    }).catch(() => {
        res.status(500).json({
            status: 500,
            message: 'Internal server error'
        });
    });
}
import client from "./client";
import prisma from "../prisma";

const users = prisma.user.findMany({
    select: {
        username: true,
        email: true,
    }
}).then(users => {
    if (!users) return;
    const usernames = users.map(user => user.username).filter(username => username) as string[];
    const emails = users.map(user => user.email).filter(email => email) as string[];
    client.sAdd("TAKEN_USERNAMES", usernames);
    client.sAdd("TAKEN_EMAILS", emails);
})

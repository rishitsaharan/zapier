import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from "@repo/db/client"
export default async function handler(req : NextApiRequest, res: NextApiResponse){
    // const { userid = '', zapId = '' } = req.query as { userid: string; zapId: string };
    const { userid, zapId } = req.query || {};
    if(Array.isArray(zapId) || typeof zapId !== 'string' || Array.isArray(userid) || typeof userid !== 'string'){
        return res?.status(400).json({ error: 'Invalid userid or zapId' });
    }
    const body = req.body;
    // const prisma = new PrismaClient();
    if(req.method === 'POST'){
        await prisma.$transaction(async tx => {
            const run = await tx.zapRun.create({
                data: {
                    zapId: zapId,
                    metadata: body
                }
            });

            await tx.zapRunOutBox.create({
                data: {
                    zapRunId: run.id
                }
            })
        })
        res.json({
            message: "Webhook received"
        })
    }
    else{
        res?.status(404).json({
            message:`Please hit a valid endpoint`
        });
    }
}
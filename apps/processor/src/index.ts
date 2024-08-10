import prisma from "@repo/db/client";
import { Kafka } from "kafkajs";
// import { configDotenv } from "dotenv";
// configDotenv();

const kafka = new Kafka({
    clientId : "outbox-processor",
    brokers : ["localhost:9092"]
})
const producer = kafka.producer();
// const prisma = new PrismaClient();
async function main(){
    await producer.connect();
    while(1){
        const pendingRows = await prisma.zapRunOutBox.findMany({
            where : {},
            take : 10
        });

        await producer.send({
            topic: "zap-events",
            messages : pendingRows.map(x => ({
                value: x.zapRunId
            }))
        });

        await prisma.zapRunOutBox.deleteMany({
            where:{
                id : {
                    in : pendingRows.map(x => x.id)
                }
            }
        })
    }
}
main();
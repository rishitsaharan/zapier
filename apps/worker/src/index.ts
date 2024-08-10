import prisma from "@repo/db/client";
import { Kafka } from "kafkajs";
// import { configDotenv } from "dotenv";
// configDotenv();

const kafka = new Kafka({
    clientId : "outbox-processor",
    brokers : ["localhost:9092"]
})
const consumer = kafka.consumer({ groupId : "main-worker"});

async function main() {
    await consumer.connect();
    await consumer.subscribe({ topics : ["zap-events"], fromBeginning: true});
    await consumer.run({
        autoCommit : false,
        eachMessage : async ({ topic, partition, message }) => {
            console.log({
                topic: topic,
                partition: partition,
                offset : message.offset,
                value: message.value?.toString()
            })
            await new Promise(r => setTimeout(r, 5000));
            console.log("processing done");

            await consumer.commitOffsets([{
                topic : "zap-events",
                partition : partition,
                offset : (parseInt(message.offset) + 1).toString()
            }])
        },

    })
}
main();
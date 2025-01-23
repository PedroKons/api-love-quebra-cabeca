import {fastify} from "fastify";
import { connectDB } from "./database.js";
import fastifyCors from "@fastify/cors";
import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import FastifyMultipart from "@fastify/multipart";
import { Readable } from "stream";

const server = fastify();

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY_CLOUDINARY, 
    api_secret: process.env.API_SECRET_CLOUDINARY 
});

server.register(FastifyMultipart);
server.register(fastifyCors, {
    origin: "*", 
    methods: ["POST"], 
  });

(async () => {
    const db = await connectDB();

    //Rota para armazenar os dados
    server.post("/submit", async (request, reply) => {
        const {email, couple_name, message, photo_url} = request.body;

        if(!email || !couple_name || !message || !photo_url) {
            return reply.status(400).send({error: "Todos os campos são obrigatórios"});
        }

        try {
            await db.run(
                "INSERT INTO form_data (email, couple_name, message, photo_url) VALUES (?, ?, ?, ?)",
                [email, couple_name, message, photo_url]
            );
            return reply.status(201).send({message: "Dados salvos com sucesso!"});
        } catch (err) {
            console.error(err);
            return reply.status(500).send({err: "Erro interno no servidor"});
        }
    });

    // Rota para upload de imagem
    server.post("/upload", async (request, reply) => {
        try {
        // Obter o arquivo enviado
        const data = await request.file();
        const fileBuffer = await data.toBuffer(); // Conteúdo do arquivo
    
        // Enviar a imagem para o Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "uploads" }, // Pasta no Cloudinary
            (error, result) => {
                if (error) {
                reject(error);
                } else {
                resolve(result);
                }
            }
            );
    
            // Converter o Buffer em um stream legível para o upload
            const readableStream = new Readable();
            readableStream.push(fileBuffer);
            readableStream.push(null);
            readableStream.pipe(uploadStream);
        });
    
        console.log(uploadResult); // Exibir o resultado do upload no console
    
        // Retornar a URL da imagem enviada
        return reply.send({
            message: "Imagem recebida com sucesso!",
            imageUrl: uploadResult.secure_url, // URL otimizada e acessível publicamente
        });
        } catch (err) {
        console.error(err);
        return reply.status(500).send({ error: "Erro ao fazer o upload" });
        }
    });
  // Iniciar o servidor
  try {
    await server.listen({ port: 1212 });
    console.log("Servidor rodando em http://localhost:1212");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
    
})();







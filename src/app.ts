import express, { type Request, type Response } from "express";
import "dotenv";
import { configDotenv } from "dotenv";
import { createYoga } from "graphql-yoga";
import { ruruHTML } from "ruru/server";
import { schema } from "./graphql/index.js";
configDotenv();
const app = express();

const PORT = process.env.PORT || 8000;

const yoga = createYoga({
    schema
})

app.all("/graphql", yoga);
app.get("/", (req: Request, res: Response) => {
    res.type("HTML");
    res.end(ruruHTML({ endpoint: "/graphql" }));
})

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`)
});
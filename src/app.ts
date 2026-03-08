import express, { type Request, type Response } from "express";
import "dotenv";
import { configDotenv } from "dotenv";
import { createYoga } from "graphql-yoga";
import { ruruHTML } from "ruru/server";
import { schema } from "./graphql/index.js";
import { verifyToken, type GraphQLContext } from "./graphql/context.js";
import { User } from "./models/User.js";
import { connectDB } from "./utils/connectDB.js";
configDotenv();

const app = express();

const PORT = process.env.PORT || 8000;

const yoga = createYoga<GraphQLContext>({
    schema,

    context: async ({ request }): Promise<GraphQLContext> => {
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            return {
                currentUser: null
            }
        }
        const token = authHeader.split(" ")[1] as string;
        try {
            const payload = verifyToken(token);
            const user = await User.findById(payload.userId);
            return {
                currentUser: user
            }
        } catch {
            return {
                currentUser: null
            }
        }
    }
})

app.all("/graphql", (req: Request, res: Response) => yoga(req, res));
app.get("/", (req: Request, res: Response) => {
    res.type("HTML");
    res.end(ruruHTML({ endpoint: "/graphql" }));
})

async function main() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port http://localhost:${PORT}`)
    });
}
main();
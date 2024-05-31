import express, { Request, Response } from "express";
import * as customerController from "./controllers/customerController";
import { dbConnect } from "./services/database.service";
import { customerRouter } from "./routes/customerRoutes";
import { postBodyValidate, reqBodyValidate, updateBodyValidate } from "./validations/requestBodyValidations";
import { redisClient, redisConnect } from "./services/cache.service";

const app = express();
app.use(express.json());
app.set("port", process.env.PORT ?? 3000);

app.get("/", ((req: Request, res: Response) => res.send("REST API successfully running")));

//API specific endpoints
// app.use("/customers", customerRouter);
app.post("/customers", reqBodyValidate, postBodyValidate, customerController.addCustomerController);
app.patch("/customers/:id", reqBodyValidate, updateBodyValidate, customerController.updateCustomerController);
app.get("/customers/:id", customerController.getCustomerController);
app.get("/customers", customerController.getAllCustomerController);
app.post("/customers/import/:file", customerController.importCustomerFileController);
app.delete("/customers/:id", customerController.deleteCustomerController);

//Start the server
app.listen(app.get("port"), () => {
    console.log("API is running on http:localhost:%d", app.get("port"));
});

//Connect to database
dbConnect().then(() => {
    console.log("Database connection successful");
    redisConnect().then(() => {
        console.log("Redis client connection successful");
        redisClient.set('connection', `success : ${Date.now()}`);

    }).catch((err: Error) => {
        console.error("Redis client connection failed");
        console.log(err);
    })
}).catch((err: Error) => {
    console.error("Database connection failed");
    console.error(err.message);
    process.exit();
});
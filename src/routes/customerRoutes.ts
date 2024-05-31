import express from "express"
import * as customerController from "./../controllers/customerController";

export const customerRouter = express.Router();

customerRouter.use(express.json);

customerRouter.post("/", customerController.addCustomerController);
customerRouter.put("/customer/:id", customerController.updateCustomerController);
customerRouter.get("/customer/:id", customerController.getCustomerController);
customerRouter.get("/customers", customerController.getAllCustomerController);
customerRouter.post("/customers/:file", customerController.importCustomerFileController);
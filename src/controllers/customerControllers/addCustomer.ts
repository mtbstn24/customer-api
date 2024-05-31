import { Request, Response } from "express";
import Customer, { CustomerInterface } from "../../models/customer";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import { filterResponse } from "../customerController";
import { setCache } from "../../cacheFunctions/cache";

export const addCustomer = async (req: Request, res: Response): Promise<void> => {
    console.log('\nPost request made to \\customers');
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        console.log('Encountered request body validation errors');
        console.error(validationErrors.array());
        res.status(400).json({
            success: false,
            error: 'Invalid request body',
            msg: validationErrors
        });
    }
    else {
        console.log('No request body validation errors');
        try {
            console.log(req.body);
            const customer: mongoose.HydratedDocument<CustomerInterface> = new Customer(req.body);
            const result = await customer.save();
            if (result) {
                console.log("Customer detail created successfully");
                setCache(customer.customerID, result);
                res.status(201).json(filterResponse(result));
            } else {
                res.status(500).send("Customer creation failed");
            }
        } catch (err) {
            console.error(err);
            let error: Error = <Error>err;
            let response = {
                "message": error.message
            }
            res.status(500).send(response);
        }
    }
}
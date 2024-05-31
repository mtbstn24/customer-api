import { Request, Response } from "express";
import Customer, { CustomerInterface } from "../../models/customer";
import { filterResponse } from "../customerController";
import { isCustomerIDValid, isExist } from "../../validations/requestBodyValidations";
import { validationResult } from "express-validator";
import { setCache } from "../../cacheFunctions/cache";

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
    console.log('\nPatch request made to \\customers');

    const customerId: string = req.params.id;
    console.log(`Customer id to be updated: ${customerId}`);
    console.log(`Customer details to be updated: `);
    console.log(req.body);
    const validationErrors = validationResult(req);

    if (!isCustomerIDValid(customerId)) {
        console.log('Invalid customerID passed');
        res.status(400).json({
            success: false,
            error: 'Invalid customerID passed'
        });
    }
    else if (!validationErrors.isEmpty()) {
        console.log('Encountered request body validation errors');
        let e: Object = validationErrors.array();
        console.error(e);
        res.status(400).json({
            success: false,
            error: e
        });
    }
    else {
        try {
            const existingDetails: CustomerInterface | null = await Customer.findOne({ customerID: customerId });
            console.log(existingDetails?._id);
            const result: CustomerInterface | null = await Customer.findByIdAndUpdate(
                existingDetails?._id, req.body, { returnDocument: 'after' }
            );
            console.log(result);

            if (result) {
                setCache(result.customerID, result);
                let resCustomers: Object = filterResponse(result);
                let response = {
                    success: true,
                    data: resCustomers
                }
                console.log("Customer detail updated successfully");
                res.status(200).send(response);
            } else {
                res.status(500).json({
                    success: false,
                    msg: "Customer detail unable to update."
                });
            }

        } catch (err) {
            console.error(err);
            let error: Error = <Error>err;
            let response = {
                "success": false,
                "msg": error.message
            }
            res.status(500).send(response);
        }
    }
}

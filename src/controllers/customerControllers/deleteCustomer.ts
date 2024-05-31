import { Request, Response } from "express";
import Customer from "../../models/customer";
import { filterResponse } from "../customerController";
import { isCustomerIDValid } from "../../validations/requestBodyValidations";
import { delCache } from "../../cacheFunctions/cache";

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
    console.log('\nDelete request with path param made to \\customers');

    const customerId: string = req.params.id;
    console.log(`Requested customer id: ${customerId}`);

    if (!isCustomerIDValid(customerId)) {
        console.log('Invalid customerID passed');
        res.status(400).json({
            success: false,
            error: 'Invalid customerID passed'
        });
    }
    else {
        console.log("Trying to delete from database...");
        try {
            const resultBefore = await Customer.findOne({ customerID: customerId });
            const result = await Customer.deleteOne({ customerID: customerId });
            console.log(resultBefore);
            console.log(result);

            if (result.deletedCount != 0 && resultBefore) {
                let delCustomer: Object = filterResponse(resultBefore);
                delCache(customerId);
                let response = {
                    success: true,
                    data: delCustomer
                }
                console.log("Customer records deleted successfully");
                res.status(200).send(response);
            } else {
                res.status(404).send(`Customer record for id ${customerId} not found.`);
            }

        } catch (err) {
            console.error(err);
            let error: Error = <Error>err;
            let response = {
                success: false,
                message: error.message
            }
            res.status(500).send(response);
        }
    }
}

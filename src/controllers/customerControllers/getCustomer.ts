import { Request, Response } from "express";
import Customer, { CustomerInterface } from "../../models/customer";
import { filterResponse } from "../customerController";
import { isCustomerIDValid } from "../../validations/requestBodyValidations";
import { getCache, setCache } from "../../cacheFunctions/cache";

export const getCustomer = async (req: Request, res: Response): Promise<void> => {
    console.log('\nGet request with path param made to \\customers');

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
        try {
            const cacheResult = await getCache(customerId);
            console.log(cacheResult);

            if (!cacheResult) {
                console.log("Trying to retrieve from database...");
                try {
                    const result: CustomerInterface | null = await Customer.findOne({ customerID: customerId });
                    console.log(result);

                    if (result) {
                        let resCustomers: Object = filterResponse(result);
                        let response = {
                            success: true,
                            data: resCustomers
                        }
                        console.log("Customer records retrieved successfully");
                        setCache(customerId, result);
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

            } else {
                let resCustomers: Object = filterResponse(cacheResult);
                let response = {
                    success: true,
                    data: resCustomers
                }
                res.status(200).send(response);
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

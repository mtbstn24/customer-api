import { Request, Response } from "express";
import Customer, { CustomerInterface } from "../../models/customer";
import mongoose from "mongoose";
import { filterResponse } from "../customerController";
import { getAllCache, setCache } from "../../cacheFunctions/cache";

export const getAllCustomer = async (req: Request, res: Response): Promise<void> => {
    console.log('\nGet request made to \\customers');

    try {
        let cacheData = await getAllCache();
        console.log(cacheData);

        if (!cacheData || cacheData.length == 0) {
            console.log("Cache retrieval failed");
            console.log("Trying to retrieve from database...");

            try {
                let customers: CustomerInterface[] = await Customer.find();

                if (customers) {
                    let resCustomers: any[] = [];
                    customers.forEach(customer => {
                        setCache(customer.customerID, customer);
                        let data: Object = filterResponse(customer);
                        resCustomers.push(data);
                    });
                    let response: Object = {
                        success: true,
                        data: resCustomers
                    }
                    res.status(200).send(response);
                } else {
                    console.log("Database retieval failed");
                    res.status(500).json({
                        success: false,
                        message: "Customer details retrieval failed"
                    });
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
            let resCustomers: any[] = [];
            cacheData.forEach(customer => {
                let data: Object = filterResponse(customer);
                resCustomers.push(data);
            });
            let response: Object = {
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

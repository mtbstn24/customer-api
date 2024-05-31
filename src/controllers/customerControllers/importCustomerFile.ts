import { Request, Response } from "express";
import Customer, { CustomerInterface } from "../../models/customer";
import mongoose from "mongoose";
import * as fs from "fs";
import path from 'path';
import csv from 'csv-parser';
import { filterResponse } from "../customerController";
import { setCache } from "../../cacheFunctions/cache";
import { importFileRowValidate, isExist } from "../../validations/requestBodyValidations";

let hasValidationErrors: boolean = false;
let validationErrors: any[] = [];
let duplicationErrors: any[] = [];

const validateFields = (fileContent: CustomerInterface[]) => {
    hasValidationErrors = false;
    validationErrors = [];

    fileContent.forEach(element => {
        let validationResponse = importFileRowValidate(element);
        let errors = validationResponse.errors;
        if (!validationResponse.passed) {
            console.log('Invalid customer details');
            hasValidationErrors = true;
        }
        validationErrors.push({
            "customerID": element.customerID,
            "field-errors": errors.errors
        });
    });
}

const validateDuplications = async (fileContent: CustomerInterface[]): Promise<any[]> => {
    duplicationErrors = [];
    const validationPromises = fileContent.map(async (record) => {
        let duplicateCustomerID = await isExist('customerID', record.customerID);
        let duplicateEmail = await isExist('email', record.email);
        let hasduplicate: boolean;
        let errors: any[] = [];
        if ((duplicateCustomerID && Object.keys(duplicateCustomerID).length > 0)) {
            errors.push("Already existing customerID");
            if ((duplicateEmail && Object.keys(duplicateEmail).length > 0)) {
                errors.push("Already existing email");
                hasduplicate = true;
            }
            hasduplicate = true;
            duplicationErrors.push({
                "customerID": record.customerID,
                "errors": errors
            });
            return true;
        } else if ((duplicateEmail && Object.keys(duplicateEmail).length > 0)) {
            errors.push("Already existing email");
            hasduplicate = true;
            duplicationErrors.push({
                "customerID": record.customerID,
                "errors": errors
            });
            return true;
        } else {
            errors.push("");
        }
        duplicationErrors.push({
            "customerID": record.customerID,
            "errors": errors
        });
        return false;

    });

    try {
        const duplicateResult = await Promise.all(validationPromises);
        return duplicateResult;
    } catch (error: any) {
        console.log("validation errror....", error.message);
        throw new Error("Cannot perform validation");
    }
}

export const importCustomerFile = async (req: Request, res: Response): Promise<void> => {
    console.log('\nPost request made to \\customers\\import passing file name');

    const fileContent: any[] = [];
    const publicFolder: string = "public";
    const filePath: string = req.params.file;
    console.log(`Passed file name : ${filePath}`);

    const csvFilePath: string = path.resolve(publicFolder, filePath);
    console.log(csvFilePath);
    let filerows: number = 0;

    try {
        let fileStream = fs.createReadStream(csvFilePath);

        fileStream.on('error', (err) => {
            console.log(`inside err reject : ${err}`);
            console.log("error from readStream");
            console.error(err);
            let response: Object = [{
                success: false,
                message: "Customers file cannot be read"
            }]
            res.status(400).send(response);
        });

        fileStream.pipe(csv())
            .on('data', (data) => {
                fileContent.push(data);
                filerows++;
            });

        fileStream.on('end', async () => {
            console.log(`inside the fs function \n:`);
            console.log(fileContent);
            console.log(filerows);

            validateFields(fileContent);
            console.log(validationErrors);

            try {
                const duplicateResult = await validateDuplications(fileContent);
                console.log('Duplicated result : ', duplicateResult);

                let rowCount = 0;
                validationErrors.forEach(element => {
                    duplicationErrors.forEach(e => {
                        console.log(e.customerID);
                        if (e.customerID == element.customerID) {
                            element['duplication-errors'] = e.errors;
                        }
                    });
                    console.log(element);
                    rowCount++;
                });

                console.log(validationErrors);

                if (hasValidationErrors || duplicateResult.includes(true)) {
                    console.log('Encountered validation errors');
                    console.error('Invalid customer details provided');
                    let response: Object = [{
                        "success": false,
                        "message": validationErrors
                    }]
                    res.status(400).send(response);

                } else {
                    try {
                        const savePromises = fileContent.map(async (record) => {
                            const newCustomer: mongoose.HydratedDocument<CustomerInterface> = new Customer(record);
                            let singleResult = await newCustomer.save();
                            setCache(singleResult.customerID, singleResult);
                            return singleResult;
                        });

                        let result: CustomerInterface[] = await Promise.all(savePromises);

                        let resCustomers: any[] = [];
                        result.forEach(r => {
                            let data: Object = filterResponse(r);
                            resCustomers.push(data);
                        });
                        console.log('Customer details stored successfully');
                        let response: Object = {
                            success: true,
                            data: resCustomers
                        }

                        res.status(201).send(response);

                    } catch (error) {
                        console.log("error from db");
                        console.error(error);
                        let e: Error = <Error>error;
                        let response = {
                            success: false,
                            message: e.message
                        };
                        res.status(500).send(response);
                    }
                }
            } catch (error) {
                console.log(error);
                let response: Object = [{
                    success: false,
                    message: "Database cannot be connected"
                }]
                res.status(500).send(response);
            }
        });

    } catch (error) {
        console.log("error from readStream");
        console.error(error);
        let response: Object = [{
            success: false,
            message: "Customers file cannot be read"
        }]
        res.status(500).send(response);
    }
}
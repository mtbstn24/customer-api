import { ValidationChain, body, oneOf } from "express-validator";
import Customer, { CustomerInterface } from "../models/customer";
import Validator from 'validatorjs';
import { NextFunction, Request, Response } from "express";

export const reqBodyValidate = (req: Request, res: Response, next: NextFunction) => {
    const allowedFields = ['customerID', 'name', 'email', 'tel', 'address', 'country', 'verifiedStatus'];

    const invalidFieldNames = Object.keys(req.body).filter(f => !allowedFields.includes(f));

    if (invalidFieldNames.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Invalid field names exist in the request body',
            msg: {
                'invalid': invalidFieldNames
            }
        });
    }

    if (Object.keys(req.body).length == 0) {
        return res.status(400).json({
            'success': false,
            'error': 'Empty request body received'
        });
    }

    next();
}

export const postBodyValidate: ValidationChain[] = [
    body('customerID', 'customerID does not exist')
        .exists().matches(/[A-Z]\d{4}$/).withMessage('Invalid customerID')
        .custom(async value => {
            let result = await Customer.findOne({
                customerID: value
            })
            if (result) {
                throw new Error('customerID already in use')
            }
        }),
    body('name', 'name does not exist')
        .exists().isString().withMessage('Invalid value for name'),
    body('email', 'email does not exist')
        .exists().isEmail().withMessage('Invalid email address')
        .custom(async value => {
            let result = await Customer.findOne({
                email: value
            })
            if (result) {
                throw new Error('email already in use')
            }
        }),
    body('tel', 'tel does not exist')
        .exists().matches(/\d{10}$/).withMessage('Invalid value for tel'),
    body('address', 'address does not exist')
        .exists().isString().withMessage('Invalid address value'),
    body('country', 'country does not exist')
        .exists().isString().withMessage('Invalid country value'),
    body('verifiedStatus', 'verifiedStatus does not exist')
        .exists().isBoolean().withMessage('Invalid verified status value'),
];

export const updateBodyValidate: ValidationChain[] = [
    body('customerID', 'customerID does not exist')
        .optional().matches(/[A-Z]\d{4}$/).withMessage('Invalid customerID')
        .custom(async value => {
            let result = await Customer.findOne({
                customerID: value
            })
            if (result) {
                throw new Error('customerID already in use')
            }
        }),
    body('email').optional().isEmail().withMessage('Invalid email address')
        .custom(async value => {
            let result = await Customer.findOne({
                email: value
            })
            if (result) {
                throw new Error('email already in use')
            }
        }),
    body('name').optional().isString().withMessage('Invalid value for name'),
    body('tel').optional().matches(/\d{10}$/).withMessage('Invalid value for tel'),
    body('address').optional().isString().withMessage('Invalid address value'),
    body('country').optional().isString().withMessage('Invalid country value'),
    body('verifiedStatus').optional().isBoolean().withMessage('Invalid verified status value'),
];

export const isCustomerIDValid = (customerId: string): boolean => {
    if (customerId.length == 0) {
        console.log('Encountered request body validation errors');
        console.error('error : Empty customerID');
        return false;
    } else if (!RegExp(/[A-Z]\d{4}$/).exec(customerId)) {
        console.log('Encountered request body validation errors');
        console.error('Invalid customerID');
        return false;
    } else {
        return true
    }
}

export const isExist = async (attribute: string, value: string | number | boolean): Promise<CustomerInterface | null> => {
    let query = {};
    if (/customerID/.exec(attribute)) {
        query = { customerID: value };
    } else if (/email/.exec(attribute)) {
        query = { email: value };
    }
    try {
        let result = await Customer.findOne(query);
        if (result) {
            return result;
        } else {
            return null;
        }
    } catch (error) {
        throw new Error('Cannot connect to database for validation');
    }
}

export const importFileRowValidate = (row: CustomerInterface) => {
    let rules = {
        customerID: 'required|regex:/^[A-Z]{1}\\d{4}$/',
        name: 'required',
        email: 'required|email',
        tel: ['required', 'regex:/\\d{10}$/'],
        address: 'required|string',
        country: 'required|string',
        verifiedStatus: 'required|boolean',
    }

    let validation = new Validator(row, rules);

    let validationResponse = {
        "passed": validation.passes(),
        "errorsCount": validation.errorCount,
        "errors": validation.errors
    }

    return validationResponse;
}
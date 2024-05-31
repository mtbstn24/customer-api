import { CustomerInterface } from "../models/customer";
import { addCustomer } from "./customerControllers/addCustomer";
import { updateCustomer } from "./customerControllers/updateCustomer";
import { getCustomer } from "./customerControllers/getCustomer";
import { getAllCustomer } from "./customerControllers/getAllCustomer";
import { importCustomerFile } from "./customerControllers/importCustomerFile";
import { deleteCustomer } from "./customerControllers/deleteCustomer";

export function filterResponse(dbResult: CustomerInterface): Object {
    let response: Object = {
        "customerID": dbResult.customerID,
        "name": dbResult.name,
        "email": dbResult.email,
        "tel": dbResult.tel,
        "address": dbResult.address,
        "country": dbResult.country,
        "verifiedStatus": dbResult.verifiedStatus
    }
    return response;
}

export const addCustomerController = addCustomer;

export const updateCustomerController = updateCustomer;

export const getCustomerController = getCustomer;

export const getAllCustomerController = getAllCustomer;

export const importCustomerFileController = importCustomerFile;

export const deleteCustomerController = deleteCustomer;
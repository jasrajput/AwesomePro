import React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class API {
    static baseUrl = "https://thecitycabs.live/api/";
    auth_token = "";


    static put(url, headers, body, resolve, reject) {
        fetch(`${this.baseUrl}${url}`, {
            headers: headers,
            method: "PUT",
            body: JSON.stringify(body)
        })
            .then(resp => {
                resolve(resp.json())
            })
            .catch(err => reject(err));
    }

    static post(url, headers, body, resolve, reject) {
        fetch(`${this.baseUrl}${url}`, {
            headers: headers,
            method: "POST",
            body: JSON.stringify(body)
        })
            .then(resp => {
                resolve(resp.json())
            })
            .catch(err => {
                console.log(err);
                reject(err)
            });
    }

    static get(url, headers, resolve, reject) {
        fetch(`${this.baseUrl}${url}`, {
            headers: headers
        })
            .then(resp => {
                resolve(resp.json());
            })
            .catch(err => reject(err));
    }

    static getToken() {
        return AsyncStorage.getItem("token");
    }

    static requestToBackend(endpoint, data, resolve, reject, token, method, requiresToken = true) {
        const headers = {
            "Content-Type": "application/json",
            'Accept': 'application/json',
        };


        if (requiresToken && token) {
            headers['Authorization'] = `Bearer ${token}`;
        }


        if (method === 'POST') {
            this.post(endpoint, headers, data, resolve, reject);
        } else if (method === 'PUT') {
            this.put(endpoint, headers, data, resolve, reject);
        } else {
            this.get(endpoint, headers, resolve, reject);
        }
    }

    static makeAPICall(endpoint, data, method, requiresToken = true) {
        return new Promise((resolve, reject) => {
            if (requiresToken) {
                this.getToken().then(token => {
                    if (token) {
                        this.requestToBackend(endpoint, data, resolve, reject, token, method, requiresToken);
                    } else {
                        console.error("No token");
                        reject("No token");
                    }
                }).catch(error => {
                    console.error("Error getting token:", error);
                    reject("Error getting token");
                });
            } else {
                this.requestToBackend(endpoint, data, resolve, reject, null, method, requiresToken);
            }
        });
    }


    // static image_upload(data) {
    //     return new Promise((resolve, reject) => {
    //         AsyncStorage.getItem("token").then(token => {
    //             if (token) {
    //                 console.log(token)
    //                 auth_token = token;
    //                 this.post(
    //                     "auth/driver-upload",
    //                     {
    //                         "Content-Type": "multipart/form-data",
    //                         "Accept": "application/json",
    //                         'Authorization': `Bearer ${auth_token}`,
    //                     },
    //                     data,
    //                     resolve,
    //                     reject
    //                 );
    //             } else {
    //                 console.log("No token");
    //             }
    //         });
    //     }patiala
    // }

    static getCategories() {
        return this.makeAPICall(`categories`, null, 'GET', false);
    }

    static getCarByCategory(id) {
        return this.makeAPICall(`cars/${id}`, null, 'GET', false);
    }

    static userLogout() {
        return this.makeAPICall("auth/logout", null, 'POST', false);
    }

    static userLogin(data) {
        return this.makeAPICall("auth/login", data, 'POST', false);
    }

    static sendOtp(data) {
        return this.makeAPICall("auth/sendOtp", data, 'POST', false);
    }

    static verifyOTP(data) {
        return this.makeAPICall("auth/verifyOtp", data, 'POST', false);
    }

    static userRegister(data) {
        return this.makeAPICall("auth/register", data, 'POST', false);
    }

    // static getUserDetails() {
    //     return this.makeAPICall("user", null, 'GET');
    // }

    static getUserDetails() {
        return new Promise((resolve, reject) => {
            AsyncStorage.getItem("token").then(token => {
                if (token) {
                    auth_token = token;
                    this.get(
                        "user",
                        {
                            "Content-Type": "application/json",
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${auth_token}`,
                        },
                        resolve,
                        reject
                    );
                } else {
                    console.log("No token");
                }
            });
        });
    }

    static getDriverDetails() {
        return this.makeAPICall("auth/driver-info", null, 'GET');
    }

    static getPassengerDetails(data) {
        return this.makeAPICall("auth/passenger-info", data, 'POST');
    }

    static searchDrivers(data) {
        return this.makeAPICall("auth/searchDrivers", data, "POST");
    }

    static sendDriverLocationToBackend(data) {
        return this.makeAPICall("auth/sendDriverLocation", data, 'PUT');
    }

    static setDriverAvailability(data) {
        return this.makeAPICall("auth/update-driver-mode", data, 'PUT');
    }

    static acceptRideRequest(data) {
        return this.makeAPICall("auth/acceptRide", data, 'POST');
    }

    static makePaymentRequest(data) {
        return this.makeAPICall("auth/make-payment", data, 'POST');
    }

    static updateBankDetails(data) {
        return this.makeAPICall("auth/update-bank-details", data, 'PUT');
    }

    static updatePersonalDetails(data) {
        return this.makeAPICall("auth/update-profile", data, 'POST');
    }

    static sendRideStatusUpdateToBackend(data) {
        return this.makeAPICall("auth/update-ride-status", data, 'PUT');
    }

    static makeRating(data) {
        return this.makeAPICall("auth/make-rating", data, 'POST');
    }

    static cancelRide(data) {
        return this.makeAPICall("auth/cancel-ride", data, 'PUT');
    }

    static updateFCMToken(data) {
        return this.makeAPICall("auth/update-fcm-token", data, 'PUT');
    }

    static getHmacData(data) {
        return this.makeAPICall("auth/hmac", data, 'GET');
    }

    static getTravelHistoryDriver() {
        return this.makeAPICall("auth/driver-travel-history", null, 'GET');
    }

    static getTravelHistoryPassenger() {
        return this.makeAPICall("auth/passenger-travel-history", null, 'GET');
    }

    static getTripHistoryPassenger(id) {
        return this.makeAPICall(`auth/passenger-trip-history/${id}`, null, 'GET');
    }

    static editDetails(data) {
        return this.makeAPICall("auth/update", data, 'PUT');
    }
}
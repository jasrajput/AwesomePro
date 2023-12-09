import React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class API {
    static baseUrl = "https://thecitycabs.live/api/";
    // static baseUrl = "https://gscoin.//api/";
    auth_token = "";

    //Form url-encoded
    // static image_upload(data) {
    //     return new Promise((resolve, reject) => {
    //         let formBody = [];
    //         for (let property in data) {
    //             let encodedKey = encodeURIComponent(property);
    //             let encodedValue = encodeURIComponent(data[property]);
    //             formBody.push(encodedKey + "=" + encodedValue);
    //         }
    //         formBody = formBody.join("&");
    //         fetch(`${this.baseUrl}/auth/driver-upload`, {
    //             headers: {
    //                 "Content-Type": "application/x-www-form-urlencoded"
    //             },
    //             method: "POST",
    //             body: formBody
    //         })
    //             .then(resp => {
    //                 resolve(resp.json());
    //             })
    //             .catch(err => reject(err));
    //     });
    // }




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
            // .then(res => res.text()) // convert to plain text
            // .then(text => console.log(text))
            .catch(err => reject(err));
    }

    static get(url, headers, resolve, reject) {
        fetch(`${this.baseUrl}${url}`, {
            headers: headers
        })
            .then(resp => {
                resolve(resp.json());
            })
            // .then(res => res.text()) // convert to plain text
            // .then(text => console.log(text))
            .catch(err => reject(err));
    }


    static getCategories() {
        return new Promise((resolve, reject) => {
            this.get(
                "categories",
                {
                    "Content-Type": "application/json"
                },
                resolve,
                reject
            );
        });
    }


    static getCarByCategory(id) {
        return new Promise((resolve, reject) => {
            this.get(
                `cars/${id}`,
                {
                    "Content-Type": "application/json"
                },
                resolve,
                reject
            );
        });
    }

    static getToken() {
        return AsyncStorage.getItem("token");
    }

    static postToBackend(endpoint, data, resolve, reject, token) {
        this.post(
            endpoint,
            {
                "Content-Type": "application/json",
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            data,
            resolve,
            reject
        );
    }

    static makeAPICall(endpoint, data) {
        return new Promise((resolve, reject) => {
            this.getToken().then(token => {
                if (token) {
                    this.postToBackend(endpoint, data, resolve, reject, token);
                } else {
                    console.error("No token");
                    reject("No token");
                }
            });
        });
    }

    static image_upload(data) {
        return new Promise((resolve, reject) => {
            AsyncStorage.getItem("token").then(token => {
                if (token) {
                    console.log(token)
                    auth_token = token;
                    this.post(
                        "auth/driver-upload",
                        {
                            "Content-Type": "multipart/form-data",
                            "Accept": "application/json",
                            'Authorization': `Bearer ${auth_token}`,
                        },
                        data,
                        resolve,
                        reject
                    );
                } else {
                    console.log("No token");
                }
            });
        });
    }

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
        return new Promise((resolve, reject) => {
            AsyncStorage.getItem("token").then(token => {
                if (token) {
                    auth_token = token;
                    this.get(
                        "auth/driver-info",
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



    static userLogout() {
        return new Promise((resolve, reject) => {
            AsyncStorage.getItem("token").then(token => {
                if (token) {
                    auth_token = token;
                    this.post(
                        "auth/logout",
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

    static userLogin(data) {
        return new Promise((resolve, reject) => {
            this.post(
                "auth/login",
                {
                    "Content-Type": "application/json"
                },
                data,
                resolve,
                reject
            );
        });
    }


    static sendOtp(data) {
        return new Promise((resolve, reject) => {
            this.post(
                "auth/sendOtp",
                {
                    "Content-Type": "application/json"
                },
                data,
                resolve,
                reject
            );
        });
    }

    static verifyOTP(data) {
        return new Promise((resolve, reject) => {
            this.post(
                "auth/verifyOtp",
                {
                    "Content-Type": "application/json"
                },
                data,
                resolve,
                reject
            );
        });
    }

    static userRegister(data) {
        return new Promise((resolve, reject) => {
            this.post(
                "auth/register",
                {
                    "Content-Type": "application/json"
                },
                data,
                resolve,
                reject
            );
        });
    }


    static searchDrivers(data) {
        return this.makeAPICall("auth/searchDrivers", data);
    }

    static sendDriverLocationToBackend(data) {
        return this.makeAPICall("auth/sendDriverLocation", data);
    }

    static setDriverAvailability(data) {
        return this.makeAPICall("auth/update-driver-mode", data);
    }



    static acceptRideRequest(data) {
        return this.makeAPICall("auth/acceptRide", data);
    }

    static updateBankDetails(data) {
        return new Promise((resolve, reject) => {
            AsyncStorage.getItem("token").then(token => {
                if (token) {
                    auth_token = token;
                    this.put(
                        "auth/update-bank-details",
                        {
                            "Content-Type": "application/json",
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${auth_token}`,
                        },
                        data,
                        resolve,
                        reject
                    );
                } else {
                    console.log("No token");
                }
            });
        });
    }

    static getHmacData(data) {
        return new Promise((resolve, reject) => {
            AsyncStorage.getItem("token").then(token => {
                if (token) {
                    auth_token = token;
                    this.post(
                        "auth/hmac",
                        {
                            "Content-Type": "application/json",
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${auth_token}`,
                        },
                        data,
                        resolve,
                        reject
                    );
                } else {
                    console.log("No token");
                }
            });
        });
    }


    static editDetails(data) {
        return new Promise((resolve, reject) => {
            AsyncStorage.getItem("token").then(token => {
                if (token) {
                    auth_token = token;
                    this.put(
                        "auth/update",
                        {
                            "Content-Type": "application/json",
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${auth_token}`,
                        },
                        data,
                        resolve,
                        reject
                    );
                } else {
                    console.log("No token");
                }
            });
        });
    }
}
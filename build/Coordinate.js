"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Coordinate {
    constructor(latitude, longitude) {
        if (Math.abs(latitude) > 90) {
            throw new Error('Latitude must be < 90 and > -90');
        }
        if (Math.abs(longitude) > 180) {
            throw new Error('Longitude must be < 180 and > -180');
        }
        this.latitude = latitude;
        this.longitude = longitude;
    }
    getLatitude() {
        return this.latitude;
    }
    getLongitude() {
        return this.longitude;
    }
}
exports.Coordinate = Coordinate;

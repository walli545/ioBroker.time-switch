"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Coordinate {
    constructor(latitude, longitude) {
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

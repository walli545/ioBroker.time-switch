export class Coordinate {
	private readonly latitude: number;
	private readonly longitude: number;

	constructor(latitude: number, longitude: number) {
		if (Math.abs(latitude) > 90) {
			throw new Error('Latitude must be < 90 and > -90');
		}
		if (Math.abs(longitude) > 180) {
			throw new Error('Longitude must be < 180 and > -180');
		}
		this.latitude = latitude;
		this.longitude = longitude;
	}

	public getLatitude(): number {
		return this.latitude;
	}

	public getLongitude(): number {
		return this.longitude;
	}
}

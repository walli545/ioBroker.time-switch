import { Coordinate } from '../../src/Coordinate';
import { expect } from 'chai';

describe('Coordinate', () => {
	it('throws when lat=91', () => {
		expect(() => new Coordinate(91, 0)).to.throw();
	});

	it('throws when lat=-91', () => {
		expect(() => new Coordinate(-91, 0)).to.throw();
	});

	it('throws when long=181', () => {
		expect(() => new Coordinate(0, 181)).to.throw();
	});

	it('throws when long=-181', () => {
		expect(() => new Coordinate(0, -181)).to.throw();
	});

	it('throws when lat=91 and long=181', () => {
		expect(() => new Coordinate(91, 181)).to.throw();
	});

	it('throws when lat=-91 and long=-181', () => {
		expect(() => new Coordinate(-91, -181)).to.throw();
	});

	it('should create with lat=0 and long=0', () => {
		const sut = new Coordinate(0, 0);
		expect(sut.getLatitude()).to.equal(0);
		expect(sut.getLongitude()).to.equal(0);
	});

	it('should create with lat=90 and long=180', () => {
		const sut = new Coordinate(90, 180);
		expect(sut.getLatitude()).to.equal(90);
		expect(sut.getLongitude()).to.equal(180);
	});

	it('should create with lat=-90 and long=-180', () => {
		const sut = new Coordinate(-90, -180);
		expect(sut.getLatitude()).to.equal(-90);
		expect(sut.getLongitude()).to.equal(-180);
	});

	it('should create with lat=5.234 and long=-87.4', () => {
		const sut = new Coordinate(5.234, -87.4);
		expect(sut.getLatitude()).to.equal(5.234);
		expect(sut.getLongitude()).to.equal(-87.4);
	});
});

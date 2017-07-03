const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const knexConstructor = require('knex');

const knexConfig = require('../knexfile.js')['test'];
const knex = knexConstructor(knexConfig);
const server = require('../lib/server');
const routes = require('../lib/routes');

const testPort = 3000;
const baseUrl = `http://localhost:${testPort}`;
const tokenParameter = '?apikey=00000000-0000-0000-0000-000000000000';

chai.use(chaiHttp);

server.start(testPort, routes);

const existingSensor = 'sensor-1';
const testSensor = 'apiTestSensor';
const newValue = parseInt(Math.random() * 10); // Not sure if good idea
const newSensorStart = new Date().toISOString();

const existingSensorStart = '2016-10-10T12:00:00.000Z'; // from seed
const existingSensorEnd = '2016-10-10T13:00:00.000Z'; // from seed

const testRoutes = {
    GET: {
        sensors: '/api/v1/sensors',
        latestMeasurementExisting: `/api/v1/sensor/${existingSensor}/latest`,
        measurementSeriesExisting: `/api/v1/sensor/${existingSensor}/series`,
        latestMeasurementNew: `/api/v1/sensor/${testSensor}/latest`,
        measurementSeriesNew: `/api/v1/sensor/${testSensor}/series`,
    },
    POST: {
        newMeasurementNew: `/api/v1/sensor/${testSensor}/measurement`,
        newMeasurementExisting: `/api/v1/sensor/${existingSensor}/measurement`,
    }
}

describe('HTTP', () => {
    before(function(done) {
        knex.migrate.rollback(knexConfig)
            .then(() => {
                return knex.migrate.latest(knexConfig);
            })
            .then(() => {
                return knex.seed.run(knexConfig);
            })
            .then(() => {
                done();
            });
    });
/*
    describe('Running the server for tests', () => {
        it('should serve frontpage', (done) => {
            chai.request(baseUrl)
                .get('/')
                .end((err, res) => {
                    console.log(res);
                    res.should.have.status(200);
                    done();
                });
        });
    });

    describe('User management', () => {
        it('should not return use information without a session', (done) => {
            chai.request(baseUrl)
                .get('/api/v1/userDetails')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.deep.equal({});
                    done();
                });
        });
        it.skip('should return session cookie with login', (done) => {
            chai.request(baseUrl)
                .post('/api/v1/login')
                .send({'username': 'testUser', 'password': 'password'})
                .end((err, res) => {
                    res.should.have.status(200);

                    console.log(res.headers['set-cookie']);
                    res.should.redirectTo(`${baseUrl}/`);
                    res.should.have.cookie('ranchsid');
                    done();
                });
        });
    });
*/
    describe('Machine api', () => {
        it('should return unauthorized when called without api token', (done) => {
            chai.request(baseUrl)
                .post(`${testRoutes.POST.newMeasurementExisting}`)
                .send({'sensor': existingSensor, 'value': newValue})
                .end(function(err, res) {
                    expect(res).to.have.status(401);
                    done();
                });
        });

        it('should add new measurement for existing sensor', (done) => {
            chai.request(baseUrl)
                .post(`${testRoutes.POST.newMeasurementExisting}${tokenParameter}`)
                .send({'value': newValue})
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('number');
                    done();
                });
        });

        it('should get latest measurement for existing sensor', (done) => {
            chai.request(baseUrl)
                .get(`${testRoutes.GET.latestMeasurementExisting}${tokenParameter}`)
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.have.property('value', newValue);
                    done();
                });
        });

        it('should get a series of measurements for existing sensor', (done) => {
            chai.request(baseUrl)
                .get(`${testRoutes.GET.measurementSeriesExisting}${tokenParameter}&start=${existingSensorStart}&end=${existingSensorEnd}`)
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.lengthOf(60);
                    done();
                });
        });

        it('should add new measurement for new sensor', (done) => {
            chai.request(baseUrl)
                .post(`${testRoutes.POST.newMeasurementNew}${tokenParameter}`)
                .send({'value': newValue})
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('number');
                    done();
                });
        });

        it('should get latest measurement for new sensor', (done) => {
            chai.request(baseUrl)
                .get(`${testRoutes.GET.latestMeasurementNew}${tokenParameter}`)
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.have.property('value', newValue);
                    done();
                });
        });

        it('should get a series of measurements for new sensor', (done) => {
            const newSensorEnd = new Date().toISOString();
            chai.request(baseUrl)
                .get(`${testRoutes.GET.measurementSeriesNew}${tokenParameter}&start=${newSensorStart}&end=${newSensorEnd}`)
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.lengthOf(1);
                    expect(res.body).to.have.deep.property('[0].value', newValue);
                    done();
                });
        });

        it('should get a list of sensors', (done) => {
            chai.request(baseUrl)
                .get(`${testRoutes.GET.sensors}${tokenParameter}`)
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.lengthOf(3); // 2 from seed data + 1 test sensor
                    done();
                });
        });
    });
});

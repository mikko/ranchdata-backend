const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

const server = require('../lib/server');
const routes = require('../lib/routes');

const testPort = 3000;
const baseUrl = `http://localhost:${testPort}`;
const tokenParameter = '?token=00000000-0000-0000-0000-000000000000';

chai.use(chaiHttp);

server.start(testPort, routes);

describe('HTTP', () => {
    before(function(done) {
        knex.migrate.rollback(config)
            .then(() => {
                return knex.migrate.latest(config);
            })
            .then(() => {
                return knex.seed.run(config);
            })
            .then(() => {
                done();
            });
    });

    describe('Running the server for tests', () => {
        it('should server frontpage', (done) => {
            chai.request(baseUrl)
                .get('/')
                .end((err, res) => {
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

    describe('Machine api', () => {
        it('should return unauthorized when called without api token', (done) => {
           chai.request(baseUrl)
               .post('/api/v1/measurement')
               .send({'sensor': 'sensor-1', 'value': 0})
               .end((err, res) => {
                   res.should.have.status(401);
                   done();
               });
        });
        it('should add new measurement for existing sensor', (done) => {
            chai.request(baseUrl)
                .post(`/api/v1/measurement${tokenParameter}`)
                .send({'sensor': 'sensor-1', 'value': 0})
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });

        it('should add new measurement for new sensor', (done) => {
            chai.request(baseUrl)
                .post(`/api/v1/measurement${tokenParameter}`)
                .send({'sensor': 'newsensor', 'value': 0})
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });

        it('should add new sensor for user', (done) => {
            throw "Not implemented";
        });
        it('should get sensor details', (done) => {
            throw "Not implemented";
        });
        it('should get latest measurement for sensor', (done) => {
            throw "Not implemented";
        });
        it('should get measurements for time range', (done) => {
            throw "Not implemented";
        });
    });
});
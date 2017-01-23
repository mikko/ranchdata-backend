const chai = require('chai');
const chaiHttp = require('chai-http');
const knexConstructor = require('knex');

const knexConfig = require('../knexfile.js')['test'];
const knex = knexConstructor(knexConfig);
const server = require('../lib/server');
const routes = require('../lib/routes');

const testPort = 3000;
const baseUrl = `http://localhost:${testPort}`;
const tokenParameter = '?token=00000000-0000-0000-0000-000000000000';

chai.use(chaiHttp);

server.start(testPort, routes);

describe.skip('HTTP', () => {
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

        it('should add new sensor for user', () => {
            throw 'Not implemented';
        });
        it('should get sensor details', () => {
            throw 'Not implemented';
        });
        it('should get latest measurement for sensor', () => {
            throw 'Not implemented';
        });
        it('should get measurements for time range', () => {
            throw 'Not implemented';
        });
    });
});

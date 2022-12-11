process.env.NODE_ENV = 'test'

let database = require('mongoose')

database.connect(process.env.DB_CONNECTOR, () => { console.log('Connecton to DB succesful!') })

database.connection.once('open', () => console.log('Connected!')).on('error', (error) => { console.warn('Error : ', error) })

let PostRoute = require('../src/routes/posts')
let Post = require('../src/controllers/posts')

const Users = require('../src/models/Users')

const UserRoute = require('../src/routes/users')

const mainApp = require('../main')

const tokenVerification = require('../src/verifyToken')


const TEST_USER_1 = {
    email_address: "olga.user@email.com",
    password: "1234567",
    user_name: "olgaTheWarrior",
    full_name: "Olga Polo",
    date_of_birth: "1990-11-11"
}

const TEST_USER_2 =
{
    email_address: "nick.user@email.com",
    password: "abcdefghi",
    user_name: "nick4President",
    full_name: "Nick Brick",
    date_of_birth: "1996-11-11"
}


const TEST_USER_3 =
{
    email_address: "mary.larry@email.com",
    password: "ilovelondon",
    user_name: "princessMary",
    full_name: "Mary Larry",
    date_of_birth: "1984-01-30"
}


//Require the dev-dependencies
let chai = require('chai')
let expect = chai.expect
const request = require('supertest')
const auth = require('../src/verifyToken')

var authToken = []


/* Test the /POST route
*/
describe("POST Register Users", () => {
    it("should register new user with valid credentials", (done) => {
        tempUser.forEach(tempUser =>
            request(mainApp)
                .post("/api/users/registerUser")
                .send(tempUser)
                .expect(201)
                .then((res) => {
                    expect(res.body.data.user_name).to.be.eql(tempUser.user_name)
                    expect(res.body.data.full_name).to.be.eql(tempUser.full_name)
                    done();
                })
                .catch((err) => done(err))
        )
    })
})

describe("TEST_USERS_SUCCESSFUL_LOGIN", () => {
    it("TEST_USER_1", (done) => {
        request(mainApp)
            .post("/api/users/login")
            .send({ user_name: TEST_USER_1.user_name, password: TEST_USER_1.password })
            .expect(200)
            .then((res) => {
                expect(res.body.message).to.be.eql("You are now succesfully logged in.")
                authToken.push[{ user_name: TEST_USER_1.user_name }, { "authToken": res.body['authToken'] }]
                done();
            })
            .catch((err) => done(err))
    })
    it("TEST_USER_2", (done) => {
        request(mainApp)
            .post("/api/users/login")
            .send({ user_name: TEST_USER_2.user_name, password: TEST_USER_2.password })
            .expect(200)
            .then((res) => {
                expect(res.body.message).to.be.eql("You are now succesfully logged in.")
                authToken.push[{ user_name: TEST_USER_2.user_name }, { "authToken": res.body['authToken'] }]
                done();
            })
            .catch((err) => done(err))
    })
    it("TEST_USER_3", (done) => {
        request(mainApp)
            .post("/api/users/login")
            .send({ user_name: TEST_USER_3.user_name, password: TEST_USER_3.password })
            .expect(200)
            .then((res) => {
                expect(res.body.message).to.be.eql("You are now succesfully logged in.")
                authToken.push[{ user_name: TEST_USER_3.user_name }, { "authToken": res.body['authToken'] }]
                done();
            })
            .catch((err) => done(err))
    })
    it("TC3", (done) => {
        console.log(authToken)
        request(mainApp)
            .post("/api/users/deleteUser")
            .send(tempUser)
            .expect(201)
            .then((res) => {
                expect(res.body.data.user_name).to.be.eql(tempUser.user_name)
                expect(res.body.data.full_name).to.be.eql(tempUser.full_name)
                done();
            })
            .catch((err) => done(err))
    })
})

describe("TEST_USER_UNAUTHORIZED", () => {
    var token = null

    // before(function (done) {
    //     request(mainApp)
    //         .post('/api/users/login')
    //         .send({ user_name: TEST_USER_1.user_name, password: TEST_USER_1.password })
    //         .end(function (err, res) {
    //             token = res.body.token; // Or something
    //             done();
    //         });
    // });


    it("TEST_USER_1_WITHOUT_TOKEN", (done) => {
        console.log(TEST_USER_1.user_name)
        request(mainApp)
            .get("/api/posts/viewPosts")
            .send({ user_name: "secondUser" })
            .set('Authorization', 'Bearer ' + null)
            .then((res) => {
                expect(401)
                expect(res.body.message).to.be.eql("Access Denied.")
                done();
            })
            .catch((err) => done(err))
    })
})

describe.only("TEST_USER_AUTHORIZED", () => {
    var token = null
    // database.connect(process.env.DB_CONNECTOR, () => { console.log('Connecton to DB succesful!') })

    before(function (done) {
        request(mainApp)
            .post('/api/users/login')
            .send({ user_name: TEST_USER_1.user_name, password: TEST_USER_1.password })
            .end(function (err, res) {
                token = res.body['authToken']; // Or something
                done()
            });
    });

    it("TEST_USER_1_WITH_TOKEN", (done) => {
        request(mainApp)
            .get("/api/posts/viewPosts")
            .set('authToken', token)
            .send({ user_name: TEST_USER_1.user_name })
            .then((res) => {
                console.log(res)
                expect(401)
                expect('Content-Type', /json/)
                console.log(res.body)
                done();
            })
            .catch((err) => done(err))
    }).timeout(250000)

    it.only("TEST_USER_2_POST", (done) => {
        request(mainApp)
            .get("/api/posts/createPost")
            .set(authToken, token)
            .send({ user_name: TEST_USER_1.user_name },
                { title: "I dont know man" },
                { description: "I have finally completed my assignment. Anyone wants to go for a celebration?" })
            .then((res) => {
                console.log(res)
                expect(200)
                expect('Content-Type', /json/)
                console.log(res.body)
                done();
            }).catch((err) => done(err))
    }).timeout(250000)
})






// ********************** Initialize server **********************************

const server = require('../index.js');

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});


// ********************************************************************************



describe("Testing Add User API", () => {

  // Successful user registration:
  // API: /register
  // Input: {username: "john doe", password: "123", email: "john@gmail.com"}
  // Expect: res.status == 200
  // Result: This test case should pass and return a status 200
  // Explanation: The testcase will call the /register API with the following input
  // and expects the API to return a status of 200

  it("positive : /register", done => {
    chai
      .request(server)
      .post('/register')
      .send({ username: "john doe", password: "123", email: 'john@gmail.com' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });


  // Unsuccessful user registration :
  // API: /register
  // Input: {username: "", password: "", email: ""}
  // Expect: res.status == 400
  // Result: This test case should pass and return a status 400.
  // Explanation: The testcase will call the /register API with the following invalid inputs
  // and expects the API to return a status of 400
  it('Negative : /register. Checking invalid input', done => {
    chai
      .request(server)
      .post('/register')
      .send({ username: "", password: "huh", email: 'not an email' })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });

  
});




// ********************************************************************************



describe("Testing login API", () => {

  // Successful login :
  // API: /login
  // Input: {username: 'john doe', password: '123'}
  // Expect: res.status == 200
  // Result: This test case should pass
  // Explanation: The testcase will call the /login API with the following input
  // and expects the API to return a status of 200 
  it("positive : /login", done => {
    chai
      .request(server)
      .post('/login')
      .send({ username: "john doe", password: "123"})
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  // Unsuccessful login:
  // API: /add_user
  // Input: {username: 'john doe', password: 'u'}
  // Expect: res.status == 400 and res.body.message == 'Incorrect username or password'
  // Result: This test case should pass and return a status 400 along with a "Incorrect username or password" message.
  // Explanation: The testcase will call the /add_user API with the following invalid password
  // and expects the API to return a status of 400 along with the "Incorrect username or password" message.
  it('Negative : /login. Checking invalid password', done => {
    chai
      .request(server)
      .post('/login')
      .send({username: 'john doe', password: 'u'})
      .end((err, res) => {
        expect(res).to.have.status(400);
        assert.strictEqual(res.body.message, 'Incorrect username or password');
        done();
      });
  });


});

require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns artworks', async() => {

      const expectation = [
        {
          id: 1,  
          title: "Self-Portrait in a Velvet Dress",
          artist: "Frida Kahlo",
          img: 'http://www.kahlo.org/Self-Portrait%20in%20a%20Velvet%20Dress%20Frida%20Kahlo.jpg',
          century: '20th',
          category: 'painting',
          owner_id: 1  
        },
        {
          id: 2, 
          title: "Woman Bathing",
          artist: "Mary Cassatt",
          img: 'https://s3.amazonaws.com/assets.saam.media/files/styles/x_large/s3/files/images/1969/SAAM-1969.65.26A_1-000001.jpg',
          century: '19th',
          category: 'painting',
          owner_id: 1  
        },
        {
          id: 3, 
          title: "Two Women",
          artist: "Lois Mailou Jones",
          img: 'https://uploads8.wikiart.org/00327/images/lois-mailou-jones/1-1.jpg!Large.jpg',
          century: '20th',
          category: 'painting',
          owner_id: 1  
        },
        {
          id: 4, 
          title: "Portrait of a Girl",
          artist: "Guan Zilan",
          img: 'https://uploads3.wikiart.org/00116/images/guan-zilan/58831cb5edc2c97a049b0e65.jpg!Large.jpg',
          century: '20th',
          category: 'painting',
          owner_id: 1  
        },
        {
          id: 5, 
          title: "Thinking About Future",
          artist: "Nina Tokhtaman Valetova",
          img: 'https://uploads8.wikiart.org/00316/images/nina-tokhtaman-valetova/thinking-about-future-pencil-drawing-202-17-x-14-n-2.JPG!Large.JPG',
          century: '21st',
          category: 'drawing',
          owner_id: 1  
        }
      ];

      const data = await fakeRequest(app)
        .get('/artworks')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });


  test('returns artwork based on id', async() => {

    const expectation = 
      {
        id: 1,  
        title: "Self-Portrait in a Velvet Dress",
        artist: "Frida Kahlo",
        img: 'http://www.kahlo.org/Self-Portrait%20in%20a%20Velvet%20Dress%20Frida%20Kahlo.jpg',
        century: '20th',
        category: 'painting',
        owner_id: 1  
      }
    ;
  
    const data = await fakeRequest(app)
      .get('/artworks/1')
      .expect('Content-Type', /json/);
      // .expect(200);
  
    expect(data.body).toEqual(expectation);
  });

});
});


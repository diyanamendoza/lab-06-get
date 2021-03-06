const client = require('../lib/client');
// import our seed data:
const categories = require('./categories.js');
const artworks = require('./artworks.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      categories.map(category => {
        return client.query(`
                    INSERT INTO categories (category)
                    VALUES ($1);
                `,
        [category.category]);
      })
    );

    await Promise.all(
      artworks.map(piece => {
        return client.query(`
                    INSERT INTO artworks (title, artist, img, century, category_id, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
        [piece.title, piece.artist, piece.img, piece.century, piece.category_id, user.id]);
      })
    );

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}

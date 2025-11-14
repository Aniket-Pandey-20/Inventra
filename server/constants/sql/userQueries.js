export const userQueries = {
  findUserByUsername: `
    SELECT id, username, password
    FROM users 
    WHERE username = $1
  `,

  insertUser: `
    INSERT INTO users (username, password,email)
    VALUES ($1, $2, $3)
    RETURNING id, username
  `
};

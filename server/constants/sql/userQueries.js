export const findUserByUsername = `
  SELECT id, username, password
  FROM users 
  WHERE username = $1
`

export const createUser = `
  INSERT INTO users (username, password, email)
  VALUES ($1, $2, $3)
  RETURNING id, username
`
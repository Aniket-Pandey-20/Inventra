import express from 'express';
import { createUser } from '../controllers/userController.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router.post('/addUser', createUser); 

export default router;
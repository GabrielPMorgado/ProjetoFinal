import express from 'express';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const host = '0.0.0.0';
const porta = 3000;
const app = express();



app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});
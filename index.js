import express from 'express';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const host = '0.0.0.0';
const porta = 3000;
const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'minhaChave123', 
    resave: true,
    saveUninitialized: true,
    cookie: { 
        maxAge: 1000 * 60 * 15 
    }
}));

app.use(cookieParser());

function usuarioEstaAutenticado(requisicao, resposta, next) {
    if (requisicao.session.usuarioAutenticado) {
        next(); 
    } else {
        resposta.redirect('/index.html');
    }
}
























function autenticarUsuario(requisicao, resposta) {
    const usuario = requisicao.body.usuario;
    const senha = requisicao.body.senha;
    if (usuario === 'admin' && senha === '123') {
        requisicao.session.usuarioAutenticado = true;
        resposta.cookie('dataUltimoAcesso', new Date().toLocaleString(), {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 30
        });
        resposta.redirect('/');
    } else {
        resposta.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Falha ao realizar login</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    padding: 20px;
                }
                .container {
                    max-width: 400px;
                    margin: 0 auto;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .error-message {
                    color: #dc3545;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .link {
                    color: #007bff;
                    text-decoration: underline;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Falha ao realizar login</h1>
                <p class="error-message">Usuário ou senha inválidos!</p>
                <a href="/login.html" class="link">Voltar</a>
                <div id="lastAccess"></div>
            </div>
            <script>
                document.addEventListener('DOMContentLoaded', () => {
                    const lastAccess = document.getElementById('lastAccess');
                    const lastAccessTime = '${requisicao.cookies.dataUltimoAcesso || ''}';
                    if (lastAccessTime) {
                        lastAccess.innerHTML = '<p>Seu último acesso foi em ' + lastAccessTime + '</p>';
                    }
                });
            </script>
        </body>
        </html>
        `);
        resposta.end();
    }
}


app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const host = '0.0.0.0';
const port = process.env.PORT || 3000;
const app = express();

let listaUsuarios = [];
let listaPets = [];

// __dirname replacement in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'minhaChave123',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 15 } // 15 minutes
}));

// Middleware to serve static files
const staticPath = path.join(__dirname, 'pagina');
app.use(express.static(staticPath));

function usuarioEstaAutenticado(req, res, next) {
    if (req.session.usuarioAutenticado) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

function cadastrarUsuario(req, res) {
    const { nome, email, telefone } = req.body;

    if (nome && email && telefone) {
        listaUsuarios.push({ nome, email, telefone });
        res.redirect('/listarUsuarios');
    } else {
        res.send(`
            <!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cadastro de Usuário</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <h1>Cadastro de Usuário</h1>
                <form method="POST" action='/cadastrarUsuario'>
                    <label for="nome">Nome:</label>
                    <input type="text" id="nome" name="nome" value="${nome || ''}" required>
                    ${!nome ? '<div class="alert alert-danger">Por favor, digite o nome.</div>' : ''}
                    
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" value="${email || ''}" required>
                    ${!email ? '<div class="alert alert-danger">Por favor, informe o email.</div>' : ''}
                    
                    <label for="telefone">Telefone:</label>
                    <input type="tel" id="telefone" name="telefone" value="${telefone || ''}" required>
                    ${!telefone ? '<div class="alert alert-danger">Por favor, informe o telefone.</div>' : ''}
                    
                    <button type="submit" class="btn btn-primary">Cadastrar</button>
                </form>
            </body>
            </html>
        `);
    }
}

function autenticarUsuario(req, res) {
    const { usuario, senha } = req.body;

    if (usuario === 'admin' && senha === '123') {
        req.session.usuarioAutenticado = true;
        res.cookie('dataUltimoAcesso', new Date().toLocaleString(), {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
        });
        res.redirect('/');
    } else {
        res.send(`
            <!DOCTYPE html>
            <html lang="pt-br">
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
                        const lastAccessTime = '${req.cookies.dataUltimoAcesso || ''}';
                        if (lastAccessTime) {
                            lastAccess.innerHTML = '<p>Seu último acesso foi em ' + lastAccessTime + '</p>';
                        }
                    });
                </script>
            </body>
            </html>
        `);
    }
}

app.post('/login', autenticarUsuario);

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(staticPath, 'login.html'));
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

app.get('/', usuarioEstaAutenticado, (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

app.post('/formulario', usuarioEstaAutenticado, cadastrarUsuario);
app.post('/cadastrarUsuario', usuarioEstaAutenticado, cadastrarUsuario);

app.get('/listarUsuarios', usuarioEstaAutenticado, (req, res) => {
    let conteudoResposta = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lista de Interessados</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f8f9fa;
                margin: 0;
                padding: 20px;
                color: #333;
            }
            h1 {
                text-align: center;
                color: #333;
                margin-bottom: 30px;
            }
            table {
                width: 80%;
                margin: 0 auto;
                border-collapse: collapse;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                background-color: #fff;
            }
            th, td {
                padding: 12px 15px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            th {
                background-color: #333;
                color: white;
                font-weight: bold;
            }
            tr:nth-child(even) {
                background-color: #f2f2f2;
            }
            tr:hover {
                background-color: #e9e9e9;
            }
            .button-container {
                text-align: center;
                margin-top: 20px;
            }
            a.button {
                display: inline-block;
                margin: 10px;
                padding: 10px 20px;
                text-align: center;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                transition: background-color 0.3s;
            }
            a.button.voltar {
                background-color: #007bff;
            }
            a.button.voltar:hover {
                background-color: #0056b3;
            }
            a.button.cadastrar {
                background-color: #28a745;
            }
            a.button.cadastrar:hover {
                background-color: #218838;
            }
            p {
                text-align: center;
                color: #666;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <h1>Lista de Interessados</h1>
        <table>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                </tr>
            </thead>
            <tbody>`;

    listaUsuarios.forEach(usuario => {
        conteudoResposta += `
            <tr>
                <td>${usuario.nome}</td>
                <td>${usuario.email}</td>
                <td>${usuario.telefone}</td>
            </tr>`;
    });

    conteudoResposta += `
            </tbody>
        </table>
        <div class="button-container">
            <a href="/" class="button voltar">Voltar</a>
            <a href="./formulario.html" class="button cadastrar">Continuar Cadastrando</a>
        </div>`;

    if (req.cookies.dataUltimoAcesso) {
        conteudoResposta += `
            <p>Seu último acesso foi em ${req.cookies.dataUltimoAcesso}</p>`;
    }

    conteudoResposta += `
    </body>
    </html>`;

    res.send(conteudoResposta);
});

app.listen(port, host, () => {
    console.log(`Servidor rodando em http://${host}:${port}`);
});

/* IMPORTA O PACOTE EXPRESS PARA A APLICAÇÃO. */
const express = require('express');

/* IMPORTA O MÉTODO DE INICIALIZAÇÃO DO APLICATIVO FIREBASE NO PROJETO NODEJS. */
const {initializeApp}  = require('firebase/app');

/* 
FUNÇÕES INTERNAS DO  FIREBASE REFETENTES AS SEGUINTES AÇÕES E FUNCIONALIDADES:

getStorage - Recuepra um storage válido do Google Firebase
ref - Cria uma referencia de acesso ao 
uploadBytes - Método que realiza o upload das imagens.
getDownloadURL - Método que recupera o url completo de uma imagem.
deleteObject - Método que exclui uma imagem.
listAll - Método que recupera o nome de todas as imagens do bucket.
*/
const { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } = require('firebase/storage');

/* IMPORTA O PACOTE MULTER QUE PERMITE A MANIPULAÇÃO DOS ARQUIVOS ENVIADOS PARA UPLOAD. */
const multer = require('multer');

/* #### EXPRESS #### */
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

/* #### JSON CONTENDO OS DADOS DE CONEXÃO COM O APP DO FIREBASE #### */
const firebaseConfig = {
    apiKey: "AIzaSyDzIHrcMMl59Mxd7XPNxPMNPsyuhBbGxMQ",
    authDomain: "api-upload-nodejs.firebaseapp.com",
    projectId: "api-upload-nodejs",
    storageBucket: "api-upload-nodejs.appspot.com",
    messagingSenderId: "314905272078",
    appId: "1:314905272078:web:3e8d2572222a36417bc15f",
    measurementId: "G-RXEWH1ZGX3"
};

/* INICIALIZA O APP FIREBASE NA APLICAÇÃO NODEJS */
const firebaseApp = initializeApp(firebaseConfig);
// console.log(firebaseApp);

/* CONFIGURA O STORAGE PARA ARMAZENAMENTO DAS IMAGENS */
const storage = getStorage(firebaseApp);
// console.log(storage);

/* 
CONFIGURA O MULTER PARA A MANIPULAÇÃO DAS IMAGENS QUE SOFRERÃO O PROCESSO DE UPLOAD
NESSE CASO LIMITA APENAS O TAMANHO, MAS PODERIAM SER DETERMINADAS OUTRAS REGRAS DE VALIDAÇÃO
COMO TIPOS DE ARQUIVOS VÁLIDOS, POR EXEMPLO.
 */
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

/* #### ROTA DE UPLOAD DE IMAGENS ####*/
app.post('/upload', upload.single('file'), (req, res)=>{

    /* RECUPERA O ARQUIVO ENVIADO */
    const file = req.file;
    console.log(req);
    
    /* 
    CRIA UM NOME ÚNICO DE ARQUIVO COM BASE NOS DADDOS DE  DIA/MÊS/ANO/HORA/MINUTO/SEGUNDO MAIS O NOME
    ORIGINAL DO ARQUIVO. 
    */
    const fileName = Date.now().toString() + "_" + file.originalname;
    // res.status(200).send({"MSG": "OK!"});
    /* CONFIGURA UMA REFERÊNCIA PARA UM STORAGE DE ARMAZENAMENTO DE IMAGENS */
    const fileRef = ref(storage, fileName);

    /* O MÉTODO uploadBytes REALIZA O UPLOAD DO ARQUIVO PARA O NOSSO STORAGE NO GOOGLE FIREBASE */
    uploadBytes(fileRef, file.buffer)
    .then((snapshot) => {
        console.log('UPLOAD REDALIZADO COM SUCESSO!');
        console.log(snapshot);
        res.status(200).send({"MSG": "OK!"});
    })
    .catch((error)=>{
        res.status(500).send({"MSG": error});
    });

});

/* #### ROTA DE DOWNLOAD DE IMAGENS (URL) ####*/
app.get('/downloadURL/:file', (req, res)=>{

    const file = req.params
    const pathReference = ref(storage, file.file);

    /* O MÉTODO getDownloadURL RECUPERA A URL COMPLETA DO ARQUIVO DO NOSSO STORAGE NO GOOGLE FIREBASE */
    getDownloadURL(pathReference)
    .then(
        (url)=>{
            console.log(url);
            res.send(`<img src=${url} />`);
        }
    ).catch((error) => {
        console.log(error);
    });

});

/* #### ROTA DE EXCLUSÃO DE IMAGENS ####*/
app.delete('/excluir/:file', (req, res)=>{

    const file = req.params;
    const pathReference = ref(storage, file.file);

    /* O MÉTODO deleteObject EXLCUI O ARQUIVO INFORMADO DO NOSSO STORAGE NO GOOGLE FIREBASE */
    deleteObject(pathReference)
    .then(
        ()=>{
            res.status(200).send({"MSG": "OK!"});
        }
    ).catch((error) => {
        console.log(error);
    });

});

/* #### ROTA DE LISTAGEM DE IMAGENS ####*/
app.get('/listar', (req, res)=>{

    /* 
    CRIA UMA REFERENCIA  PARA A RAIZ DO STORAGE PARA REALIZAR LISTAEM DOS NOMES DO ARQUIVOS
    SE HOUVESSE UMA PASTA OU ESTRUTURA DE PASTAS BASTARIA INFORMAR APÓS SA BARRA "/"
    */
    const listRef = ref(storage, '/');

    /* O MÉTODO listAll LISTA TODOS OS NOMES DE ARQUIVOS DO NOSSO STORAGE NO GOOGLE FIREBASE */
    listAll(listRef)
    .then(
        (result)=>{
            //console.log(result);
            // result.prefixes.forEach((folderRef)=>{
                //console.log(folderRef);
            // });

            result.items.forEach((itemRef)=>{
                console.log(itemRef._location.path_);

                const pathReference = ref(storage, itemRef._location.path_);

                /* O MÉTODO getDownloadURL RECUPERA A URL COMPLETA DO ARQUIVO DO NOSSO STORAGE NO GOOGLE FIREBASE */
                getDownloadURL(pathReference)
                .then(
                    (url)=>{
                        //console.log(url);
                        console.log(`<img src=${url} />`);
                    }
                ).catch((error) => {
                    console.log(error);
                });


            })

            res.status(200).send({"MSG": "OK!"}); 
        }
    )
    .catch((error) => {
        console.log(error);
    });

});

app.listen(3000, ()=>{
    console.log('SERVIDOR RODANDO EM: http://localhost:3000');
});
var express = require("express");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cors = require("cors");
var morgan = require("morgan");
var app = express();
var path = require("path")
var SERVER_SECRET = process.env.SECRET || "1234";
var jwt = require('jsonwebtoken')
var { userModel, tweetmodel } = require('./dbcon/modules');
var authRoutes = require('./route/auth')
var http = require("http");
var socketIO = require("socket.io");
var server = http.createServer(app);
var io = socketIO(server);
var fs = require("fs")
var multer = require("multer")
// var admin = require("firebase-admin")



const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, `${new Date().getTime()}-${file.filename}.${file.mimetype.split("/")[1]}`)
    }
})

var upload = multer({ storage: storage })

const admin = require("firebase-admin");

// var serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT);
var serviceAccount = {
    "type": "service_account",
    "project_id": "tweeter-bc686",
    "private_key_id": "88e19c0a0185b6ed3a9a3c5ad6e1570da39efccf",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC4gy2T97sfLn6b\nzrMyFsyPci2S2IUk/HROThZYDTjJGulZlPWASI54MSI3bM5oLoXyIZr1peeq6bJg\nlgsXj+iO937GoXlQWDTtrF1auXeI80C54v+uMYn7jU07B3/aI/6QpDTKtk8O5rMa\ns1IJO3BgsKy5nC9wK3hAMro6cse4pRD/UzsFDDo8j/m3X05PVWFQrsAOGBmLwtfs\nh4KSbjOqXDS4sC7XSaU3tYsa90YC6Eq5GHQ6+l4dyL1Y+/p3epYP+rbmJjk38/Xc\nSeL+fHtUuYCDuhsQbsY1J39R9ohf/9PLpiTZ5Z7ZjDKlexIWPTO2hP2ERF13oDn8\n9xUOL+o/AgMBAAECggEADMJlgHn9Iqbgcn3Uvn39H15R8Hmwm2Ip2NBlkyk26BFI\nWb2HTJu33m/nYdXQYDv3X0sboCkc4CDRCQTXN4XoGxraVXoNHZU788OboQ56Saoo\nq7Ia5Dzgwdh/orleCgO7Mt1oGSyKQwmJESudXK4Tk1wkVaGLVkJrSmU3o5sUXJxP\ngbwoxWFG8dxJKopjlA+z/pD5tXbo+Oxo4j6A8Nug2KJdQxtqXvlM9vr6eAdr9YvZ\nGwDtaI4umwmUVhuhvtdsh4tkXwCgFrkhyrKekam2zNd8oj+f0G25m5aDA7WRm7Hg\ng+L8tPI4auzI6dOySgAO2Uli0O5Gt76KTLvFXAQioQKBgQDgQ6VYLOaa+ry1Gd4D\nW5zJVvwTkvo7d1forva8Cl0jtQj23ewYxwgTlF0gvY+hMea6mSJJRA/mfEFn2nXZ\n6QMg4XCnMs3OdtRJpk1w8mdU0NVOWzcHnw8MV+ts3jVpFrkE1RFwdEkas+PNWwqC\njHfdBgG9iFu5Q/dA7ECHgUGPMwKBgQDSn3Ragp9j4Z1SPQzPODlhnpX2dE2hiO3h\n/E0JcsuZi9oGo9J2onarmzbkqMPU44t3yYjJC4AXwoG4ejuShVzU0QA8wUxEYUCh\n06zXB8YKzhlvvocGyWgyclqnc/KH1EOiIC7+gwubIRImGoEMZFtSGDW+Ym2E6B9B\nLxlmeTBoxQKBgQCn4lwT/0D/Afdkx6GI9/sOSpzYdm33OGdJ3Dj/Ge8RvQOh8w48\nmjq0lZuF2AJ+1KF6TQr6uAYDMD+yZDtXTvU1ly7DK+gfyJsxK1rL09uBBfi4+NXg\nUbVtMyAd1tc6/XSyZmLwwUy8vbAqWh4rDsboYgfJgBvSPEwLgRDpn9yZOwKBgQCp\ndePOwtPtL+Q8+6OnwevhEBBGJ5MiSaJjtXRiCrunQa9cskgubU6fiZVj6ikNyzo2\nWa81WoxoEXX/cFEn9ScYj0Pqnfd3+OtgiIfCxp1fqi0rDBdlrXypQfqQSiizgmQc\nOFq3KcaXvMb2Y1K7Hq+e4J21HUpSqdQjxPphyVXapQKBgQCipR/odugNXLpLg3P8\nbQY4e2dsvJdavgd0wIEuu6W7y/k9AHYg0F/4spbi1RJQfo6N+ey9nBP/hfgIYvNU\nBkiksDyNmBQ9c3597kEtRcAipNTsCCtHeVUmXuCefWTXR3I6V3btFvYVTqvI8VbK\nJEhYkFfo8mHAEM4mQUu49PEWoQ==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-ddrg2@tweeter-bc686.iam.gserviceaccount.com",
    "client_id": "113975433620018476434",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ddrg2%40tweeter-bc686.iam.gserviceaccount.com"
  }
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://tweeter-bc686-default-rtdb.firebaseio.com/"
});
const bucket = admin.storage().bucket("gs://tweeter-bc686.appspot.com");

//==============================================


io.on("connection", () => {
    console.log("user Connected")
})


app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(morgan('dev'));

app.use("/", express.static(path.resolve(path.join(__dirname, "public"))))

app.use('/', authRoutes);
// app.use('/',authRoutes);

app.use(function (req, res, next) {

    console.log("req.cookies: ", req.cookies.jToken);
    if (!req.cookies.jToken) {
        res.status(401).send("include http-only credentials with every request")
        return;
    }
    jwt.verify(req.cookies.jToken, SERVER_SECRET, function (err, decodedData) {
        if (!err) {

            const issueDate = decodedData.iat * 1000;
            const nowDate = new Date().getTime();
            const diff = nowDate - issueDate;

            if (diff > 300000) {
                res.status(401).send("token expired")
            } else {
                var token = jwt.sign({
                    id: decodedData.id,
                    name: decodedData.name,
                    email: decodedData.email,
                }, SERVER_SECRET)
                res.cookie('jToken', token, {
                    maxAge: 86_400_000,
                    httpOnly: true
                });
                req.body.jToken = decodedData
                next();
            }
        } else {
            res.status(401).send("invalid token")
        }
    });
})

app.get("/profile", (req, res, next) => {

    console.log(req.body)

    userModel.findById(req.body.jToken.id, 'name email phone gender  createdOn profilePic',
        function (err, doc) {
            if (!err) {
                res.send({
                    profile: doc
                })

            } else {
                res.status(500).send({
                    message: "server error"
                })
            }
        })
})
app.post(`/tweet`, (req, res, next)=>{

    
    userModel.findOne({ email: req.body.userEmail }, (err, user) => {
        // console.log("khsajhfkjdha" + user)
        if (!err) {
            tweetmodel.create({
                "name": req.body.userName,
                "tweet": req.body.tweet,
                "profilePic": user.profilePic
            }).then((data) => {
                // console.log( "jdjhkasjhfdk" +  data)
                res.send({
                    status: 200,
                    message: "Post created",
                    data: data
                })
                
                console.log(data)
                io.emit("NEW_POST", data)
                
            }).catch(() => {
                console.log(err);
                res.status(500).send({
                    message: "user create error, " + err
                })
            })
        }
        else {
            console.log(err)
        }
    })
    
})

// app.post('/tweet', (req, res, next) => {
//     // console.log(req.body)

//     if (!req.body.userName && !req.body.tweet || !req.body.userEmail) {
//         res.status(403).send({
//             message: "please provide email or tweet/message"
//         })
//     }
//     var newTweet = new tweetmodel({
//         "name": req.body.userName,
//         "tweet": req.body.tweet
//     })
//     newTweet.save((err, data) => {
//         if (!err) {
//             res.send({
//                 status: 200,
//                 message: "Post created",
//                 data: data
//             })
//             console.log(data.tweet)
//             io.emit("NEW_POST", data)
//         } else {
//             console.log(err);
//             res.status(500).send({
//                 message: "user create error, " + err
//             })
//         }
//     });
// })

app.get('/getTweets', (req, res, next) => {

    console.log(req.body)
    tweetmodel.find({}, (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            console.log(data)
            // data = data[data.length -1]
            res.send(data)
        }
    })
})

/////////////////////////////// profile

app.post("/upload", upload.any(), (req, res, next) => {

    console.log("req.body: ", req.body);
    console.log("req.body: ", JSON.parse(req.body.myDetails));
    console.log("req.files: ", req.files);

    console.log("uploaded file name: ", req.files[0].originalname);
    console.log("file type: ", req.files[0].mimetype);
    console.log("file name in server folders: ", req.files[0].filename);
    console.log("file path in server folders: ", req.files[0].path);

    bucket.upload(
        req.files[0].path,
        // {
        //     destination: `${new Date().getTime()}-new-image.png`, // give destination name if you want to give a certain name to file in bucket, include date to make name unique otherwise it will replace previous file with the same name
        // },
        function (err, file, apiResponse) {
            if (!err) {
                // console.log("api resp: ", apiResponse);

                file.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491'
                }).then((urlData, err) => {
                    if (!err) {
                        console.log("public downloadable url: ", urlData[0]) // this is public downloadable url 
                        console.log(req.body.email)
                        userModel.findOne({ email: req.body.email }, (err, users) => {
                            console.log(users)
                            if (!err) {
                                users.update({ profilePic: urlData[0] }, {}, function (err, data) {
                                    console.log(users)
                                    res.send({
                                        status: 200,
                                        message: "image uploaded",
                                        picture: users.profilePic
                                    });
                                })
                            }
                            else {
                                res.send({
                                    message: "error"
                                });
                            }
                        })
                        try {
                            fs.unlinkSync(req.files[0].path)

                        } catch (err) {
                            console.error(err)
                        }


                    }
                })
            } else {
                console.log("err: ", err)
                res.status(500).send();
            }
        });
})



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("server is running on: ", PORT);
})
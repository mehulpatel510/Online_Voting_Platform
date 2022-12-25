const express = require("express");
const flash = require("connect-flash");
var csrf = require("tiny-csrf")

//const { engine } = require('express-handlebars');

const app = express();

//app.engine('handlebars', engine());
//app.set('view engine', 'handlebars');
//app.set('views', './views');

//app.engine('.ejs', engine({extname: '.ejs'}));
app.set('view engine', '.ejs');


const { Voter, User, Election, Question, Option, Vote, Model, sequelize } = require("./models");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const session = require('express-session');
const LocalStrategy = require('passport-local');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const path = require("path");
//const { Console } = require("console");

//const createImage = require("./models/result");
//const election = require("./models/election");
//const __dirname = path.resolve();
// eslint-disable-next-line no-undef
app.set("views", path.join(__dirname, "views"));
app.use(flash());



app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("123456789iamasecret987654321look", ["POST", "PUT", "DELETE"]));
app.use(express.static("public"));

app.use(session({
    resave: false,//added 
    saveUninitialized: true,//added 
    role: 'guest',
    electionId: -1,
    questionIndex: 1,
    secret: "my-super-secret-key-123123123123",
    cookie: {
        maxAge: 24 * 60 * 60 * 100
    }
}));

app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy({
    usernameField: 'voterId',
    passwordField: 'password'
}, (username, password, done) => {
    console.log("Authentication for " + username)
    if (username.includes("admin")) {
        User.findOne({ where: { email: username } })
            .then(async (user) => {
                if (user) {
                    console.log("Check password for " + user)
                    const result = await bcrypt.compare(password, user.password);
                    console.log(result)
                    if (result) {
                        console.log("Login Result:" + result)
                        console.log("User:" + user.email)
                        session.role = 'admin'
                        return done(null, user);
                    }
                    else {
                        console.log("Invalid password");
                        return done(null, false, { message: "Invalid Email ID/Password" });
                    }
                }
                else {
                    console.log("Invalid Email ID");
                    return done(null, false, { message: "Invalid Email ID/Password" });
                }
            })
            .catch((error) => {
                console.log("Fail email id: " + error)
                return (error)
            })
        console.log("Complete Authentication");
    } else {
        Voter.findOne({ where: { voterId: username } })
            .then(async (user) => {
                if (user) {
                    console.log("Check password for " + user)
                    const result = await bcrypt.compare(password, user.password);
                    console.log(result)
                    if (result) {
                        console.log("Login Result:" + result)
                        session.role = 'voter'
                        session.questionIndex = 0
                        return done(null, user);
                    }
                    else {
                        console.log("Invalid password");
                        return done(null, false, { message: "Invalid Voter ID/Password" });
                    }
                }
                else {
                    console.log("Invalid Voter ID");
                    return done(null, false, { message: "Invalid Voter ID/Password" });
                }
            })
            .catch((error) => {
                console.log("Fail Voter id: " + error)
                return (error)
            })
        console.log("Complete Authentication");
    }

}
))

passport.serializeUser((user, done) => {
    console.log("Serializing user in session", user.id);
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    console.log("Deserializing user in session", id);
    if (session.role == 'admin') {
        User.findByPk(id)
            .then(user => {
                done(null, user)
            })
            .catch((error) => {
                done(error, null)
            })
    } else if (session.role == 'voter') {
        Voter.findByPk(id)
            .then(user => {
                done(null, user)
            })
            .catch((error) => {
                done(error, null)
            })
    }
})

app.set("view engine", "ejs");

app.use(function (request, response, next) {
    response.locals.messages = request.flash();
    next();
});

///// Setting Routes ///////

app.get("/", (request, response) => {
    response.render("index");
});

app.get("/signup", (request, response) => {
    return response.render("signup", { csrfToken: request.csrfToken() });
});

app.get("/login", (request, response) => {
    response.render("login", { csrfToken: request.csrfToken() });
});

app.post("/session",
    passport.authenticate('local', {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    (request, response) => {
        console.log("Login as " + session.role)

        if (session.role == 'admin')
            response.redirect("/elections")
        else if (session.role == 'voter') {

            if (session.electionId == undefined) {
                request.flash('error', "Invalid election URL");
                return response.redirect("/login")
            } else {
                let url = "/elections/" + session.electionId + "/vote";
                console.log("URL:" + url)
                response.redirect(url)
            }
        }
        else {
            request.flash('error', { message: "Invalid election URL" });
            response.redirect("/login")
        }
    });

app.get("/signout", (request, response, next) => {
    request.logout((err) => {
        if (err)
            return next(err);
        else
            return response.redirect("/");
    })
});

app.get("/elections", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {

    const allElections = await Election.getElections();

    response.render("elections", {
        csrfToken: request.csrfToken(),
        allElections,
        username: request.user.firstName + " " + request.user.lastName
    });


});

app.get("/elections/new", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {

    response.render("newElection", {
        csrfToken: request.csrfToken()
    });


});

app.post("/elections/new", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    try {
        console.log("Start to insert new election")
        const loggedUserId = request.user.id;
        const election = await Election.addElection(request.body, loggedUserId)

        console.log("Inserted New Election");
        if (request.accepts("html")) {
            console.log("Html Request");
            return response.redirect("/elections");
        }
        else {
            return response.json(election);
        }
    } catch (error) {
        request.flash('error', { message: error.message });
        console.log(error);
        return response.redirect("/elections/new");
    }

});

app.get("/elections/:id", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    const election = await Election.findByPk(request.params.id);
    const questions = await Question.findAll({ where: { electionId: election.id } });

    const voters = await Voter.findAll({ where: { electionId: election.id } });
    const fullUrl = request.protocol + "://" + request.hostname + ":" + app.get('PORT') + "/elections/" + election.id + "/vote";
    console.log("launched:" + election.launched)
    response.render("ballot", {
        csrfToken: request.csrfToken(), election, questions, voters, fullUrl
    });

});

app.put("/elections/:id/launch", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    const election = await Election.findByPk(request.params.id);
    console.log("Launched Election:" + election.electionName)
    try {
        if (election.userId == request.user.id) {
            const updatedElection = await election.setLaunchedStatus(request.body.launched);
            return response.json(updatedElection);
        }
        else {
            console.log("update fail for : " + election)
            return response.json(election);
        }
    } catch (error) {
        console.log("PUT Request:" + error);
        request.flash('error', { message: error.message });
        return response.status(422).json(error);
    }

});

app.get("/elections/:id/vote", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    console.log("On vote page")
    try {

        session.electionId = request.params.id;
        console.log("Voter id:" + request.user.id)
        console.log("Role:" + session.role)
        console.log("Election ID:" + session.electionId)
        if (session.role) {
            console.log("Role:" + session.role)
            if (session.role == 'voter') {
                let temp = session.questionIndex;
                if (temp == undefined) {
                    session.questionIndex = 0;
                }
                const election = await Election.findByPk(request.params.id);
                const questions = await Question.findAll({ where: { electionId: election.id } });
                console.log("Questions length:" + questions.length)
                if (session.questionIndex < questions.length) {
                    const question = questions[session.questionIndex];
                    console.log("question:" + question.id)
                    const options = await Option.findAll({ where: { questionId: question.id } });
                    console.log("Option length:" + options.length);


                    response.render("vote", {
                        csrfToken: request.csrfToken(), election, questions, session, question, options
                    });
                } else {
                    response.render("vote", {
                        csrfToken: request.csrfToken(), election, questions, session
                    });

                }

            }
            else {
                let error = new Error()
                error.message = 'Invalid user/login as voter'
                throw error;
                //throw(new Error('Invalid User'))

            }
        } else {
            let error = new Error()
            error.message = 'Invalid user/login as voter'
            throw error;
            //throw(new Error('Invalid User'))
        }
    } catch (error) {
        console.log("For Voter error:" + error.message)
        request.flash('error', error.message);
        return response.redirect("/login");
    }

});

app.post("/elections/:id/vote", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    const election = await Election.findByPk(request.params.id);
    console.log("Voter id:" + request.user.id)
    console.log("Election ID:" + election.Id)
    console.log("Question ID:" + request.body.questionId)
    console.log("Option ID: " + request.body.optionId)
    //const questions = await Question.findAll({where:{electionId:election.id}}); 

    try {
        console.log("Start to insert new vote")

        const vote = await Vote.addVote(request.user.id, request.body.questionId, request.body.optionId)
        console.log("Inserted Vote ID: " + vote.id)
        session.questionIndex += 1;

        if (request.accepts("html")) {
            console.log("Html Request");
            return response.redirect("/elections/" + election.id + "/vote");
        }
        else {
            return response.json(election);
        }
    } catch (error) {
        request.flash('error', { message: error.message });
        console.log(error);
        return response.redirect("/elections/" + election.id + "/vote");
    }
});

app.get("/elections/:id/preview",
    //connectEnsureLogin.ensureLoggedIn(), 
    async function (request, response) {
        const election = await Election.findByPk(request.params.id);
        const voters = await Voter.findAll({ where: { electionId: election.id } });
        const questions = await Question.findAll({ where: { electionId: election.id } });
        // const options = await Option.findAll({
        //     include: {
        //         model: Question,
        //         include: {
        //             model: Election,
        //             where: { id: election.id }
        //         }
        //     }
        // });

        const countVotes = await Vote.findAll({
            attributes: [[sequelize.fn('count', sequelize.col('Vote.optionId')), 'count']],
            include: [
                { model: Option, required: true, attribute: ['optionText'] },
                {
                    model: Question, required: true, attribute: ['questionText'],
                    include: [
                        {
                            model: Election, required: true, attribute: ['id'],
                            where: { id: request.params.id },
                        }]
                },
            ],

            group: ['Question->Election.id', 'Question.id', 'Option.id'],
            //raw: true
            //order: ['']
        });
        const jsonVotes = JSON.stringify(countVotes, null, 2);
        console.log(jsonVotes);
        console.log("count: " + countVotes.length)
        console.log("rows: " + countVotes)
        countVotes.forEach((item) => {
            console.log(item)
            // console.log(item.count)
            console.log(item.dataValues.count)
        })


        // const countVotes = await Vote.findAll({
        //     attributes: ['Vote.questionId', 'Vote.optionId', [sequelize.fn('count', sequelize.col('Vote.id')), 'count']],
        //     include: [
        //         {
        //             model: Option, attributes: ['optionText','questionId'],
        //            // where: { id: Vote.optionId },
        //            required: true,
        //             include: {
        //                 model: Question, attributes: ['questionText','electionId'],
        //                 //where: { id: Vote.questionId },
        //                 required: true,
        //                 include: {
        //                     model: Election, attributes: ['id'],
        //                    where: { id: request.params.id },
        //                    required: true
        //                 }
        //             },
        //         },

        //     ],
        //     group: ['electionId','Vote.questionId', 'Option.id'],
        //     //raw: true
        //     //order: ['']
        // });
        // console.log(JSON.stringify(countVotes, null, 2));

        // const { count, rows } = await Vote.findAndCountAll({
        //     // include: [
        //     //     {model: Question, attributes: ['questionText']},
        //     //     {model: Option, attributes: ['optionText'] } // I need to count this. model.
        //     // ],
        //     group: ['Vote.questionId', 'Vote.optionId']
        // });
        // console.log("count: " + countVotes.length)
        // console.log("rows: " + countVotes)
        // countVotes.forEach((item) => {
        //     console.log(item.dataValues.count)
        // })


        // const countVotes = await Vote.findAll({
        //     //attributes:[Vote.questionId,Vote.optionId],
        //     //model: Vote, required: true,
        //     // include: {
        //     //model: Option, required: true,
        //     //     include: {
        //     //         model: Question,
        //     //         include: {
        //     //             model: Election, required: true,
        //     //             where: { id: election.id }
        //     //         }
        //     //     }
        //     //  },
        //     //        where: { electionId: election.id },
        //     group: ['Vote.questionId', 'Vote.optionId', 'Vote.id']
        // });

        // console.log("Votes Length: " + countVotes.length)
        // const votes = await Vote.count({ group: ['questionId', 'optionId'] });

        response.render("preview", {
            csrfToken: request.csrfToken(), election, voters, questions, Question, countVotes
        });

    });

app.get("/elections/:id/voters", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    const election = await Election.findByPk(request.params.id);
    const voters = await Voter.findAll({ where: { electionId: election.id } });


    response.render("voters", {
        csrfToken: request.csrfToken(), election, voters
    });

});

app.post("/elections/:id/voters", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    const election = await Election.findByPk(request.params.id);
    //const questions = await Question.findAll({where:{electionId:election.id}}); 

    try {
        console.log("Start to insert new voter")
        //        const loggedUserId = request.user.id;

        const voter = await Voter.addVoter(request.body, election.id)
        console.log("Inserted Voter ID: " + voter.id)
        if (request.accepts("html")) {
            console.log("Html Request");
            return response.redirect("/elections/" + election.id + "/voters");
        }
        else {
            return response.json(election);
        }
    } catch (error) {
        request.flash('error', { message: error.message });
        console.log(error);
        return response.redirect("/elections/" + election.id + "/voters");
    }
});

app.delete("/voters/:id", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    console.log("We have to delete a Voter with ID: ", request.params.id);
    // First, we have to query our database to delete a Todo by ID.
    const voter = await Voter.findByPk(request.params.id);
    try {
        if (voter == null)
            return response.send(false);
        else {
            voter.deleteVoter();
            return response.send(true);
        }
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }

});

app.get("/elections/:id/questions", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    const election = await Election.findByPk(request.params.id);
    const questions = await Question.findAll({ where: { electionId: election.id } });
    if (election.launched == false) {
        response.render("questions", {
            csrfToken: request.csrfToken(), election, questions
        });
    }
    else {
        return response.redirect("/elections/" + election.id);
    }

});

app.get("/elections/:id/questions/new", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    const election = await Election.findByPk(request.params.id);
    const questions = await Question.findAll({ where: { electionId: election.id } });

    response.render("newQuestion", {
        csrfToken: request.csrfToken(), election, questions
    });

});

app.post("/elections/:id/questions/new", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    const election = await Election.findByPk(request.params.id);
    //const questions = await Question.findAll({where:{electionId:election.id}}); 

    try {
        console.log("Start to insert new question")
        //        const loggedUserId = request.user.id;

        const question = await Question.addQuestion(request.body, election.id)
        console.log("Inserted Question ID: " + question.id)
        console.log("Inserted New Election");
        if (request.accepts("html")) {
            console.log("Html Request");
            return response.redirect("/questions/" + question.id);
        }
        else {
            return response.json(election);
        }
    } catch (error) {
        request.flash('error', { message: error.message });
        console.log(error);
        return response.redirect("/elections/" + election.id + "/questions/new");
    }
});

app.get("/questions/:id", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    const question = await Question.findByPk(request.params.id);
    const options = await Option.findAll({ where: { questionId: question.id } });

    response.render("options", {
        csrfToken: request.csrfToken(), question, options
    });

});

app.post("/questions/:id", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    const question = await Question.findByPk(request.params.id);

    try {
        const option = await Option.addOption(request.body, question.id);
        console.log("Option Created: " + option.id);

        if (request.accepts("html")) {
            console.log("Html Request");
            return response.redirect("/questions/" + question.id);
        }
        else {
            return response.json(option);
        }
    } catch (error) {
        request.flash('error', { message: error.message });
        console.log(error);
        return response.redirect("/questions/" + question.id);
    }

});


app.post("/users", async (request, response) => {
    const hashedPassword = await bcrypt.hash(request.body.password, saltRounds);
    try {
        console.log("Going to create new user")

        //const newUser = 
        User.create({
            firstName: request.body.firstName,
            lastName: request.body.lastName,
            email: request.body.email,
            password: hashedPassword
        })
            .then(user => {
                request.login(user, (err) => {
                    if (err) {
                        console.log("Login Issue:" + err);
                    }
                });
                console.log(user);
                response.redirect("/");
            })
            .catch(err => {
                console.log("Error at Sign up:" + err);
                //request.flash('error', err);
                err.errors.map(e => {
                    console.log(e.message);
                    request.flash('error', { message: e.message });
                });

                response.redirect("/signup");
                //throw err;
            });

    } catch (error) {
        console.log("Sign up Error at post:\n");

        //request.flash('error', { message: error.messages });
        //return response.redirect("/");
        response.redirect("/signup");
    }
});

app.put("/elections/:id", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    const election = await Election.findByPk(request.params.id);
    try {
        if (election.userId == request.user.id) {

            const updatedElection = await Election.setLaunchedStatus(request.body.launched);
            return response.json(updatedElection);
        }
        else {
            console.log("update fail for : " + election)
            return response.json(election);
        }
    } catch (error) {
        console.log("PUT Request:" + error);
        return response.status(422).json(error);
    }
});

app.delete("/elections/:id", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    console.log("We have to delete a Election with ID: ", request.params.id);
    // First, we have to query our database to delete a Todo by ID.
    const election = await Election.findByPk(request.params.id);
    try {
        if (election == null)
            return response.send(false);
        if (election.userId == request.user.id) {
            election.deleteElection();
            return response.send(true);
        }
        else {
            return response.send(false);
        }
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }

});

app.get("/users", async (request, response) => {
    const allUsers = await User.getUsers();
    response.json({ allUsers });
})


module.exports = app;

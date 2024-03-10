import passport from "passport";
import local from 'passport-local';
import { userModel } from "../dao/models/user.model.js";
import { createHash, isvalidPassword } from "../utils/bcrypt.js";
import { Strategy as GitHubStrategy } from "passport-github2";

const localStrategy = local.Strategy;

const initializePassport = () => {
    passport.use('register', new localStrategy(
        {passReqToCallback: true, usernameField: 'email'},
        async (req, username, password, done) => {
            const {first_name, last_name, email, age} = req.body;
            try {
                const user = await userModel.findOne({email: username});
            if (user) {
                console.log('user already exists');
                return done(null, false);
            }
            const newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password)
            }

            const result = await userModel.create(newUser);
            return done(null, result);
            } catch (error) {
                return done('error to obtain the user' + error);
            }
        }
    ));

    passport.use('login', new localStrategy(
        {usernameField: 'email'},
        async (username, password, done) => {
            try {
                const user = await userModel.findOne({email: username});
                if (!user) {
                    console.log('User doesnt exists');
                    return done(null, false);
                }
                if (!isvalidPassword(user, password)) {
                    return done(null, false);
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.use('github', new GitHubStrategy(
        {
            clientID: 'Iv1.ad2d450150ad6e63',
            callbackURL: 'http://localhost:8080/api/session/githubcallback',
            clientSecret: '2079445bb88a52e5d65810e6ad05180fc8663147'
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const user = await userModel.findOne({email: profile._json.email});
                if (!user) {
                    const newUser = {
                        first_name: profile._json.name,
                        last_name: '',
                        age: 18,
                        email: profile.username,
                        password: 'GithubGenerated'
                    }
                    const result = await userModel.create(newUser);
                    return done(null, result);
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ))

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        const user = await userModel.findOne({_id: id});
        done(null, user);
    });
};

export default initializePassport;
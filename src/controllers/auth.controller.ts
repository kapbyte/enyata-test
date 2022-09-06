import { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
// import { OAuth2Client, TokenPayload } from 'google-auth-library';
// const GoogleClient = new OAuth2Client('1095239571775-plv65brugicj8fdf7e6neuekg8r5par3.apps.googleusercontent.com');
import { 
  SERVER_ROOT_URI, 
  GOOGLE_CLIENT_ID, 
  GOOGLE_CLIENT_SECRET,
  COOKIE_NAME,
  JWT_SECRET,
} from '../config/config';
import querystring from "querystring";


const redirectURI = "auth/google";

function getGoogleAuthURL() {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: `${SERVER_ROOT_URI}/${redirectURI}`,
    client_id: GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  return `${rootUrl}?${querystring.stringify(options)}`;
}


// Getting login URL
const GetLoginURLController = async (req: Request, res: Response) => {
  return res.send(getGoogleAuthURL());
};


async function getTokens({ code, clientId, clientSecret, redirectUri }: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<{
  access_token: string;
  expires_in: Number;
  refresh_token: string;
  scope: string;
  id_token: string;
}> {
  /*
   * Uses the code to get tokens
   * that can be used to fetch the user's profile
   */
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  };

  return axios
    .post(url, querystring.stringify(values), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Failed to fetch auth tokens`);
      throw new Error(error.message);
    });
};


// Getting the user from Google with the code
const GetGoogleUser = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  const { id_token, access_token } = await getTokens({
    code,
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: `${SERVER_ROOT_URI}/${redirectURI}`,
  });

  // Fetch the user's profile with the access token and bearer
  const googleUser = await axios
    .get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    )
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Failed to fetch user`);
      throw new Error(error.message);
    });

  const token = jwt.sign(googleUser, JWT_SECRET);

  res.cookie(COOKIE_NAME, token, {
    maxAge: 900000,
    httpOnly: true,
    secure: false,
  });

  res.redirect(`${SERVER_ROOT_URI}/auth/verify`);
};

// Getting the current user
const AuthenticateGoogleUser = async (req: Request, res: Response) => {
  try {
    const decoded = jwt.verify(req.cookies[COOKIE_NAME], JWT_SECRET) as jwt.JwtPayload;
    console.log("decoded :=> ", decoded);

    const { name, email, verified_email, id } = decoded;

    // user email has been verified
    if (verified_email) {
      // Generate token
      const signedToken = jwt.sign({ email, id }, JWT_SECRET, { expiresIn: '1d' });

      const foundUser = await User.findOne({ email });
      if (foundUser) {
        // return login response token to client
        res.status(200).json({ 
          success: true, 
          token: signedToken, 
          user: foundUser._id,
          message: 'User Login Successful.'
        });
      }

      if (!foundUser) {
        // Create new user and save to MongoDB
        const user = User.build({
          email,
          name,
          token: signedToken
        });

        user.save();

        res.status(201).json({ 
          success: true,
          token: signedToken,
          id: user._id, 
          message: 'User Registration Successful.'
        });
      }
    } 
  } catch (err) {
    console.log(err);
    res.send(null);
  }
};

export {
  GetLoginURLController,
  GetGoogleUser,
  AuthenticateGoogleUser
}
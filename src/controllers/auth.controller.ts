import { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { 
  SERVER_ROOT_URI, 
  GOOGLE_CLIENT_ID, 
  GOOGLE_CLIENT_SECRET,
  COOKIE_NAME,
  JWT_SECRET,
  JWT_TIME,
  PREMIUM,
  FREEMIUM
} from '../config/config';
import querystring from 'querystring';
import { permissionRequestValidator } from '../helpers/request.validator';


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
    .get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
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

    const { name, email, verified_email, id } = decoded;

    // user email has been verified
    if (verified_email) {

      const foundUser = await User.findOne({ email });
      if (foundUser) {
        const signedToken = jwt.sign({ email, id, access: foundUser.subscription }, JWT_SECRET, { expiresIn: JWT_TIME });

        // return login response token to client
        res.status(200).json({ 
          success: true, 
          token: signedToken, 
          user: foundUser._id,
          message: 'User Login Successful.'
        });
      }

      if (!foundUser) {
        const newUserSignedToken = jwt.sign({ email, id, access: FREEMIUM }, JWT_SECRET, { expiresIn: JWT_TIME });

        // create new user and save to MongoDB
        const user = User.build({ email, name, token: newUserSignedToken });
        user.save();

        res.status(201).json({ 
          success: true,
          token: newUserSignedToken,
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

const RevokeAccountController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.user_id
    const filter = { id: userId };
    const update = { token: '' };
    
    let doc = await User.findOneAndUpdate(filter, update, {
      new: true
    });

    res.status(200).send(doc);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

const AccessPermissionController = async (req: Request, res: Response) => {
  try {
    const { error } = permissionRequestValidator.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const userId = req.params.user_id
    const filter = { id: userId };

    const { subscription } = req.body;
    if (subscription !== PREMIUM && subscription !== FREEMIUM) {
      return res.status(400).json({
        message: 'Please enter the correct permission access (premium | freemium)'
      });
    }

    const authHeader = req.headers;
    const userToken = authHeader['token'] as string;
    
    const decoded = jwt.verify(userToken, `${JWT_SECRET}`) as jwt.JwtPayload;
    const { email, id } = decoded;

    const updatedUserSignedToken = jwt.sign({ email, id, access: subscription }, JWT_SECRET, { expiresIn: JWT_TIME });

    const update = { 
      subscription: subscription, 
      token: updatedUserSignedToken 
    };
    
    let doc = await User.findOneAndUpdate(filter, update, {
      new: true
    });

    res.status(200).json({ 
      token: updatedUserSignedToken,
      id: doc?._id,
      email: doc?.email,
      message: 'User token updated successfully.'
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export {
  GetLoginURLController,
  GetGoogleUser,
  AuthenticateGoogleUser,
  RevokeAccountController,
  AccessPermissionController
}
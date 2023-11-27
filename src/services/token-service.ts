import { promisify } from 'util';
import crypto from 'crypto';
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

export const generateJwtToken = (payload: object, option: SignOptions = { expiresIn: process.env.JWT_EXPIRES_IN }) => {
  return jwt.sign(payload, process.env.JWT_SECRET, option);
};

// export const verifyJwtToken = (token: string) => {
//   return promisify(jwt.verify)(token as string, process.env.JWT_SECRET) as Promise<JwtPayload>;
// };


const verifyJwt = (token: string, secret: string, callback: (error: any, decoded: JwtPayload | undefined) => void) => {
  jwt.verify(token, secret, callback);
};

export const verifyJwtToken = async (token: string): Promise<JwtPayload> => {
  // Convert the custom wrapper function into a promise using the promisify utility.
  const verifyPromise = promisify(verifyJwt);

  // Verify the JWT using the promisified verifyJwt function and the JWT_SECRET from the environment.
  const decodedPayload = await verifyPromise(token, process.env.JWT_SECRET);

  // Return the decoded payload as a Promise.
  return Promise.resolve(decodedPayload);
};


export const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

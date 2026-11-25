import { env } from '../config/env';

export type Credentials = {
  username: string;
  password: string;
};

export type InvalidLoginScenario = Credentials & {
  name: string;
  expectedError: string;
};

export const standardUser: Credentials = {
  username: env.SAUCE_USERNAME,
  password: env.SAUCE_PASSWORD,
};

/**
 * Negative sign-in cases. Parameterised from one array so a new case is a data
 * change, not a new test body.
 */
export const invalidLoginScenarios: InvalidLoginScenario[] = [
  {
    name: 'a locked-out user',
    username: 'locked_out_user',
    password: 'secret_sauce',
    expectedError: 'Sorry, this user has been locked out',
  },
  {
    name: 'a wrong password',
    username: 'standard_user',
    password: 'wrong_password',
    expectedError: 'Username and password do not match',
  },
  {
    name: 'a missing username',
    username: '',
    password: 'secret_sauce',
    expectedError: 'Username is required',
  },
  {
    name: 'a missing password',
    username: 'standard_user',
    password: '',
    expectedError: 'Password is required',
  },
];

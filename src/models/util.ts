import * as _ from "lodash";

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const generateRandomString = (length = 5): string => {
  let randomString = "";
  for (let i = 0; i < length; i++) {
    const random = _.random(0, characters.length - 1);
    randomString += characters.charAt(random);
  }
  return randomString;
};

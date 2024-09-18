export const getLink = (
  origin: string,
  pathname: string,
  gistID: string
): string => {
  let link = origin;
  if (pathname !== "/") {
    link += pathname;
  }
  if (pathname.endsWith("/") && pathname !== "/") {
    link += pathname.substring(0, pathname.length - 1);
  }
  link += `#?state=${gistID}`;
  return link;
};

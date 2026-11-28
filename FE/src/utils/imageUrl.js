export const getSecureImageUrl = (src) => {
  if (typeof src !== "string") return src;

  return src.replace(/^http:\/\//i, "https://");
};

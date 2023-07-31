export function sortQueryString(queryString: string): string {
  if (!queryString) {
    return queryString;
  }
  const cleanQueryString =
    queryString.charAt(0) === '?' ? queryString.slice(1) : queryString;
  const params = cleanQueryString.split('&');
  params.sort();
  const sortedQueryString = params.join('&');
  return sortedQueryString;
}

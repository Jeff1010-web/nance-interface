export function downloadJSON(
  filename: string,
  json: any,
) {
  const content = 'data:text/;charset=utf-8,' + JSON.stringify(json, null, 2);
  const encodedUri = encodeURI(content);

  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.json`);

  document.body.appendChild(link);

  link.click();
}

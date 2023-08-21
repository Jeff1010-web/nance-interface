export function openInDiscord(url: string) {
  try {
    // use URL object to replace https:// with discord://
    const discordUrl = new URL(url);
    discordUrl.protocol = 'discord:';
    return discordUrl.toString();
  } catch (error) {
    return url;
  }
}
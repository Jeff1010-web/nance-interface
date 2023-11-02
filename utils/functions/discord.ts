import { discordAuthUrl } from './discordURL';

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

export function discordContactMessage(form: { name: string, email: string, message: string}) {
  const body = {
    embeds: [
      {
        title: 'New Message from nance.app',
        description: `At <t:${Math.floor(Date.now() / 1000)}>:`,
        color: 0xEFF6FF,
        fields: [
          {
            name: 'Name',
            value: form.name ? form.name : 'No name provided.',
            inline: false,
          },
          {
            name: 'Contact',
            value: form.email ? form.email : 'No contact provided.',
            inline: true,
          },
          {
            name: 'Message',
            value: form.message,
            inline: false,
          },
        ],
      },
    ],
  };
  return body;
}

export const discordAuthWindow = () => {
  return window.open(discordAuthUrl(), '_blank', 'width=400,height=700,noopener,noreferrer');
};

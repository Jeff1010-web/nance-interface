import { NextApiRequest, NextApiResponse } from "next";
import { LOCAL_STORAGE_KEY_DISCORD_STATUS } from '../../../libs/discordURL';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { status } = req.query;

  res.setHeader('Content-Type', 'text/html');
  res.end(`
    <html>
      <body>
        <script>
          localStorage.setItem('${LOCAL_STORAGE_KEY_DISCORD_STATUS}', '${status}');
          window.close();
        </script>
      </body>
    </html>
  `);
}

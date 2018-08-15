import http2 from 'http2';

import draftHandler from './Draft/index.js';
import { registerHandler } from './User/index.js';

const postRoutes = (stream, path, user) => {
  let body = ''
  stream.on('data', chunk => {
    body += chunk.toString();
  });
  stream.on('end', () => {
    switch(path.route) {
      case 'register':
        registerHandler(stream, JSON.parse(body), user);
        break;
      case 'draft':
        draftHandler(stream,  JSON.parse(body), user);
        break;
    }
  })
}

export default postRoutes

import http2 from 'http2';

import draftHandler from './Draft/index.js';
import { registerHandler } from './User/index.js';

const postRoutes = (stream, headers, path) => {
  let body = ''
  stream.on('data', chunk => {
    body += chunk.toString();
  });
  stream.on('end', () => {
    switch(path.route) {
      case 'register':
        registerHandler(stream, headers, JSON.parse(body));
        break;
      case 'draft':
        draftHandler(stream, headers, JSON.parse(body));
        break;
    }
  })
}

export default postRoutes

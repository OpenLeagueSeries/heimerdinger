import http2 from 'http2';

import draftHandler from './Draft/index.js';
import { registerHandler } from './User/index.js';
import { detailsChanger } from './Details/index.js';

const postRoutes = (stream, path, user) => {
  let body = ''
  stream.on('data', chunk => {
    body += chunk.toString();
  });
  stream.on('end', () => {
    switch(path.route) {
      case 'register':
        console.log('postRoutes: register');
        registerHandler(stream, JSON.parse(body), user);
        break;
      case 'draft':
        console.log('postRoutes: draft');
        draftHandler(stream, JSON.parse(body), user);
        break;
      case 'edit':
        console.log('postRoutes: edit');
        detailsChanger(stream, user, path.options, JSON.parse(body));
        break;

    }
  })
}

export default postRoutes

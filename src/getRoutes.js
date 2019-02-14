import http2 from 'http2';

import tournamentHandler from './Tournament/index.js';
import { userHandler } from './User/index.js';
import draftHandler from './Draft/index.js';
import { detailsHandler, meHandler } from './Details/index.js';
//import { authHandler } from './Auth/index.js';

const getRoutes = (stream, path, user) => {

  switch(path.route) {
   case 'tournament':
     tournamentHandler(stream, user);
     break;
   case 'users':
     userHandler(stream, user);
     break;
   case 'me':
     meHandler(stream, user);
     break;
   case 'draft':
     draftHandler(stream, false, user);
     break;
   case 'details':
     detailsHandler(stream, user, path.options);
     break;

    }
}

export default getRoutes

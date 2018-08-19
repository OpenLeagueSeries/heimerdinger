import http2 from 'http2';

import tournamentHandler from './Tournament/index.js';
import { userHandler } from './User/index.js';
import draftHandler from './Draft/index.js';


const getRoutes = (stream, path, user) => {

  switch(path.route) {
   case 'tournament':
     tournamentHandler(stream, user)
     break;
   case 'users':
     userHandler(stream, user)
     break;
   case 'draft':
     draftHandler(stream, false, user)
     break;
    }
}

export default getRoutes

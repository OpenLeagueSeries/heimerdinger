import http2 from 'http2';

import tournamentHandler from './Tournament/index.js';
import userHandler from './User/index.js';
import draftHandler from './Draft/index.js';


const getRoutes = (stream, headers, path) => {

  switch(path.route) {
   case 'tournament':
     tournamentHandler(stream, headers)
     break;
   case 'user':
     userHandler(stream, headers)
     break;
   case 'draft':
     draftHandler(stream, headers, false)
     break;
    }
}

export default getRoutes

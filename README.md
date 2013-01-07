# KiCadCloud.com

# JSON API

 * http://www.kicadcloud.com/search.json?q=< query >
 * http://www.kicadcloud.com/edaItem/< id >.json
 * http://www.kicadcloud.com/edaItem/all.json?page=< page number >

# Running your own server

 * Install redis (this is used for session management)
 * git clone git://github.com/joeferner/kicadcloud.com.git
 * cd kicadcloud.com
 * npm install (this will install the dependencies)
 * cp database.json.defaults database.json
 * edit database.json
 * bin/server.js --port 8888 --sessionSecret secret --passwordSalt testPasswordSaltForTestServer --workers 1

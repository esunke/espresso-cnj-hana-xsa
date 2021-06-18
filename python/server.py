import os
import logging
from flask import Flask
from flask import jsonify
from sap import xssec
from cfenv import AppEnv
from hdbcli import dbapi
import statistics as s 
from flask import request
from flask import abort
from sap.cf_logging import flask_logging


app = Flask(__name__)
env = AppEnv()

flask_logging.init(app, logging.INFO)

port = int(os.environ.get('PORT', 3000))
hana = env.get_service(label='hana')
uaa_service = env.get_service(label='xsuaa').credentials

@app.route('/')
def domath():

    logger = logging.getLogger('route.logger')
    logger.info('Someone accessed us')

    average = 0
    jokecount = 0

    if 'authorization' not in request.headers:
        abort(403)
    access_token = request.headers.get('authorization')[7:]
    security_context = xssec.create_security_context(access_token, uaa_service)
    isAuthorized = security_context.check_scope('$XSAPPNAME.access')
    if not isAuthorized:
        abort(403)
    
    logger.info('Authorization successful')

    conn = dbapi.connect(address=hana.credentials['host'], port=int(hana.credentials['port']), user=hana.credentials['user'], password=hana.credentials['password'],CURRENTSCHEMA=hana.credentials['schema'])
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT REVIEW FROM DB_JOKES")
        result =  [i[0] for i in cursor.fetchall()]
        average = round(s.mean(result),1)
        jokecount = len(result)
        cursor.close()
        conn.close()
        return jsonify(reviews=average,resultcount=jokecount)
    
    except:
        logger.error('DB read error')
        return jsonify(reviews=0,resultcount=0)

if __name__ == '__main__':
    app.run(port=port)
from google.appengine.ext import db
from handlers.index_handler import IndexHandler
import json
import time
import webapp2

class DataFlushHandler(webapp2.RequestHandler):
    
    def post(self):
        '''this method removes all the data in the search index, and models'''
        response = {}
        
        if(self.request.get("password") == "12345"):
            # clean index
            IndexHandler().removeAllDocuments()
            # purge models
            self.purge_model("Crisis")
            self.purge_model("Organization")
            self.purge_model("Person")
            response["success"] = {"message" : "Hi how are you?"}
        else:
            response["error"] = {"message": "Access Denied!"}
            
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(response))
        

    def purge_model(self, model):
        "this method deletes all the data associated with a given model"
        try:
            while True:
                q = db.GqlQuery("SELECT __key__ FROM " + model)
                if not q.count():
                    raise Exception
                
                db.delete(q.fetch(200))
                time.sleep(0.5)
        except Exception, e:
            pass

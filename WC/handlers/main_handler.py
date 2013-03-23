import webapp2
from __init__ import jinja_environment

class MainHandler(webapp2.RequestHandler):
    def get(self):
        template = jinja_environment.get_template('templates/main.html')
        self.response.write(template.render({'upload_url' : "/upload" }))
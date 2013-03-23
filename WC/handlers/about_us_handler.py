import webapp2
from __init__ import jinja_environment

class AboutUsHandler(webapp2.RequestHandler):
    def get(self):
        template = jinja_environment.get_template('templates/about_us.html')
        self.response.write(template.render({}))

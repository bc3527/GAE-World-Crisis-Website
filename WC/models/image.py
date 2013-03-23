from google.appengine.ext import db

class Image(db.Model):
	url = db.StringProperty(required = True)
	blob_key = db.StringProperty(required = True)

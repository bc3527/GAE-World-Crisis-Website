from google.appengine.ext import db

class Person(db.Model):
	name = db.StringProperty()
	alternate_names = db.StringProperty()
	category = db.StringProperty()
	description = db.TextProperty()
	country = db.StringProperty()
	state = db.StringProperty()
	city = db.StringProperty()
	longitude = db.FloatProperty()
	latitude = db.FloatProperty()

	videos_youtube = db.ListProperty(str)
	videos_vimeo = db.ListProperty(str)
	social_facebook = db.ListProperty(str)
	social_twitter = db.ListProperty(str)
	social_youtube = db.ListProperty(str)
	image_source = db.ListProperty(db.Link)
	image_description = db.ListProperty(str)
	map_source = db.ListProperty(db.Link)
	map_description = db.ListProperty(str)
	citation_source = db.ListProperty(db.Link)
	citation_description = db.ListProperty(str)
	external_link_source = db.ListProperty(db.Link)
	external_link_description = db.ListProperty(str)

	crisis_link = db.ListProperty(db.Key)
	organization_link = db.ListProperty(db.Key)

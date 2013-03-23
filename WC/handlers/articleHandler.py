import webapp2
from google.appengine.ext import db
from handlers.image_compression import compress
from models.person_model import Person
from models.org_model import Organization
from models.crisis_model import Crisis

from __init__ import jinja_environment

class ArticleHandler(webapp2.RequestHandler):

	def commonInfo(self, dictionary, someEntity):
		dictionary["name"] = someEntity.name
		dictionary["alternate_names"] = someEntity.alternate_names
		dictionary["category"] = someEntity.category
		dictionary["description"] = someEntity.description
		dictionary["country"] = someEntity.country
		dictionary["state"] = someEntity.state
		dictionary["city"] = someEntity.city
		dictionary["latitude"] = someEntity.latitude
		dictionary["longitude"] = someEntity.longitude
		dictionary["image_source"] = map(lambda x: {"src": x[0], "desc":x[1], "thumb":compress(x[0], 150, 150)}, zip(someEntity.image_source, someEntity.image_description))
		dictionary["map_source"] = map(lambda x: str(x), someEntity.map_source)	
		dictionary["citation_source"] = map(lambda x:{"src": x[0], "desc":x[1]}, zip(someEntity.citation_source, someEntity.citation_description))
		# assert len(someEntity.external_source) == 0
		dictionary["external_source"] = map(lambda x:{"src": x[0], "desc":x[1]}, zip(someEntity.external_link_source, someEntity.external_link_description))
	
	def createHtmlLinks(self, dictionary, someEntity):
		dictionary["videos_youtube"] = map(lambda x: {"src":'http://www.youtube.com/embed/' + str(x), "img_src": "http://img.youtube.com/vi/"+str(x)+"/0.jpg"}, someEntity.videos_youtube)
		dictionary["videos_vimeo"] = map(lambda x: {"src": "http://www.player.vimeo.com/video/" + str(x) + "?", "img_src": "#"}, someEntity.videos_vimeo)
		dictionary["social_facebook"] = map(lambda x: "http://www.facebook.com/" + x, someEntity.social_facebook)
		dictionary["social_twitter"] = map(lambda x:"https://www.twitter.com/" + x, someEntity.social_twitter)
		dictionary["social_youtube"] = map(lambda x:"http://www.youtube.com/user/" + x, someEntity.social_youtube)
		
	def populateDictForCrisis(self, dictionary, someEntity):
		self.commonInfo(dictionary, someEntity)
		self.createHtmlLinks(dictionary, someEntity)
		tokens = str(someEntity.start_date).split('T')
		dictionary["start_date"] = str(tokens[0])
		if (len(tokens)>1):
			dictionary["start_time"] = str(tokens[1])
		dictionary["economic_impact"] = someEntity.economic_impact
		dictionary["ways_to_help"] = someEntity.ways_to_help
		dictionary["deaths"] = someEntity.deaths
		dictionary["injured"] = someEntity.injured
		dictionary["missing"] = someEntity.missing
		dictionary["displaced"] = someEntity.displaced
		
		dictionary["person_link"] = map(lambda x: {"src" : db.get(x).key().name(), "desc": db.get(x).name}, someEntity.person_link)
		dictionary["organization_link"] = map(lambda x: { "src": db.get(x).key().name(), "desc": db.get(x).name}, someEntity.organization_link)
			
	def populateDictForOrganization(self, dictionary, someEntity):
		self.commonInfo(dictionary, someEntity)
		self.createHtmlLinks(dictionary, someEntity)
		dictionary["address"] = someEntity.address
		dictionary["email"] = str(someEntity.email)
		dictionary["phone"] = someEntity.phone
		dictionary["person_link"] = map(lambda x: {"src" : db.get(x).key().name(), "desc": db.get(x).name}, someEntity.person_link)
		dictionary["crisis_link"] = map(lambda x: { "src": db.get(x).key().name(), "desc": db.get(x).name}, someEntity.crisis_link)
			
	def populateDictForPerson(self, dictionary, someEntity):
		self.commonInfo(dictionary, someEntity)
		self.createHtmlLinks(dictionary, someEntity)
		dictionary["organization_link"] = map(lambda x: {"src" : db.get(x).key().name(), "desc": db.get(x).name}, someEntity.organization_link)
		dictionary["crisis_link"] = map(lambda x: { "src": db.get(x).key().name(), "desc": db.get(x).name}, someEntity.crisis_link)
		
		
	def get(self, article):
		template = None;
		dictionary = {}
		someKey = db.Key.from_path("Person", article);
		someEntity = db.get(someKey)
		# decide which template should be applied, and pass that template to get_template
		if (someEntity != None):
			someKey = db.Key.from_path("Person", article)
			template = jinja_environment.get_template('templates/article_person.html')
			self.populateDictForPerson(dictionary, someEntity)
		
		else:
			someKey = db.Key.from_path("Organization", article);
			someEntity = db.get(someKey)
			
			if (someEntity != None):
				someKey = db.Key.from_path("Organization", article)
				template = jinja_environment.get_template('templates/article_organization.html')
				self.populateDictForOrganization(dictionary, someEntity)
			else:
				someKey = db.Key.from_path("Crisis", article);
				someEntity = db.get(someKey)
				if (someEntity != None):
					someKey = db.Key.from_path("Crisis", article)
					template = jinja_environment.get_template('templates/article_crisis.html')
					self.populateDictForCrisis(dictionary, someEntity)
		self.response.write(template.render(dictionary))

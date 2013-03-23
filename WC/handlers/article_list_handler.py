import webapp2
from models.person_model import Person
from models.org_model import Organization
from models.crisis_model import Crisis
from handlers.image_compression import compress
from __init__ import jinja_environment

class ArticleListHandler(webapp2.RequestHandler):
	def getProperModelList(self, pagetype):
		if (pagetype == 'people'):
			return Person.all()
		elif (pagetype == 'organizations'):
			return Organization.all()
		elif (pagetype == 'crises'):
			return Crisis.all()	


	def populateDict(self, ar, model):
		d = {
			'name' : model.name,
			'description' : model.description[0:300] + "...",
			'image_source' : compress(model.image_source[0], 200, 137) if (model.image_source) else "/assets/images/no_image.png",
			'button' : model.key().name()
			}
		ar.append(d)
		

	def get(self, pagetype):
		dictionary = {
					'article_list': [],
					'page_title': pagetype,
					}
		
		modelsQuery = self.getProperModelList(pagetype)
		for someModel in modelsQuery:
			self.populateDict(dictionary['article_list'], someModel)
		template = jinja_environment.get_template('templates/article_list.html')
		print(dictionary)
		self.response.write(template.render(dictionary))

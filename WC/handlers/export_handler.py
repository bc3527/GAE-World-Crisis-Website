from google.appengine.ext import db
from google.appengine.ext import webapp

from google.appengine.ext.webapp.util import run_wsgi_app

from xml.etree.ElementTree import Element, SubElement, Comment, tostring
from xml.etree.ElementTree import ElementTree
from xml.dom import minidom

from models.person_model import Person
from models.org_model import Organization
from models.crisis_model import Crisis 


class ExportHandler(webapp.RequestHandler):
	
	def getProperModelByKey(self,pagetype, link):
		if (pagetype == "person-refs"):
			return Person.get(link)
		elif (pagetype == "organization-refs"):
			return Organization.get(link)
		else:
			return Crisis.get(link)
			
	def getProperList(self,pagetype, t):
		#print pagetype
		if (pagetype == "person-refs"):
			return t.person_link
		elif (pagetype == "organization-refs"):
			return t.organization_link
		else:
			return t.crisis_link
	
	def organization_details(self, organization, t) :
	
		# contact info
		if t.address != None :
			address = SubElement(organization, "address")
			address.text = str(t.address)
		if t.email != None :
			email = SubElement(organization, "email")
			email.text = str(t.email)
		if t.phone != None :
			phone = SubElement(organization, "phone")
			phone.text = str(t.address)
	
	def crisis_details(self, crisis, t) :
	
		# dates
		start = SubElement(crisis, "start-date")
		start.text = str(t.start_date)

		
		# human impact block
		human_impact = SubElement(crisis, "human-impact")
		if t.deaths != None :
			deaths = SubElement(human_impact, "deaths")
			deaths.text = str(t.deaths)
		if t.missing != None :
			missing = SubElement(human_impact, "missing")
			missing.text = str(t.missing)
		if t.injured != None :
			injured = SubElement(human_impact, "injured")
			injured.text = str(t.injured)
		if t.displaced != None :
			displaced = SubElement(human_impact, "displaced")
			displaced.text = str(t.displaced)
			
		# economic impact, resources, ways to help
		economic_impact = SubElement(crisis, "economic-impact")
		economic_impact.text = str(t.economic_impact)
		
		resources_needed = SubElement(crisis, "resources-needed")
			
		for l in t.resources_needed :
			resource = SubElement(resources_needed, 'resource')
			resource.text = str(l)
		

		ways = SubElement(crisis, "ways-to-help")
			
		for l in t.ways_to_help :
			way = SubElement(ways, 'way')
			way.text = str(l)

			
	def processPageTypes(self, pagetype, mainTag):
		linkTypes = {"people":["crisis-refs", "organization-refs"], "organizations":[ "crisis-refs", "person-refs"], "crises":["organization-refs", "person-refs"]}
		pageType = SubElement(mainTag, pagetype)
		tags = []
		childType = ""
		if (pagetype == "people"):
			tags = Person.all()
			childType = "person"
		elif (pagetype == "organizations"):
			tags = Organization.all()
			childType = "organization"
		else:
			#print pagetype
			tags = Crisis.all()
			childType = "crisis"
	    	
		for t in tags:
		
			# element instantiation and unique id
			child = SubElement(pageType, childType)
			child.attrib['id'] = t.key().name()
		
			# general info block
			name = SubElement(child, 'name')
			name.text = str(t.name)
			
			if t.alternate_names != None :
				alternate_names = SubElement(child, 'alternate-names')
				alternate_names.text = t.alternate_names
				
			category = SubElement(child, 'kind')
			category.text = t.category
			description = SubElement(child, 'description')
			description.text = t.description
			
			
			# location block
			location = SubElement(child, 'location')
			if t.city != None :
				city = SubElement(location, 'city')
				city.text = str(t.city)
			if t.state != None :
				state = SubElement(location, 'state')
				state.text = str(t.state)
			country = SubElement(location, 'country')
			country.text = str(t.country)

			if t.latitude != None:
				latitude = SubElement(location, 'latitude')
				latitude.text = str(t.latitude)
			if (t.latitude != None):
				longitude = SubElement(location, 'longitude')
				longitude.text = str(t.longitude)
			# image block
			if t.image_source != None :
				images = SubElement(child, "images")
				c = 0
				for l in t.image_source :
					image = SubElement(images, "image")
					image_source = SubElement(image, 'source')
					image_source.text = str(l)
					i = 0
					for k in t.image_description :
						if i == c :
							image_description = SubElement(image, 'description')
							image_description.text = str(k)
						i += 1
					c += 1
			
			
			# map block
			if t.map_source != None :
				maps = SubElement(child, "maps")
				c = 0
				for l in t.map_source :
					map = SubElement(maps, "map")
					map_source = SubElement(map, 'source')
					map_source.text = str(l)
					i = 0
					for k in t.map_description :
						if i == c :
							map_description = SubElement(map, 'description')
							map_description.text = str(k)
						i += 1
					c += 1
			
			
			# videos block
			if t.videos_youtube != None or t.videos_vimeo != None:
				videos = SubElement(child, "videos")
				if t.videos_youtube != None :
					for l in t.videos_youtube :
						youtube = SubElement(videos, "youtube")
						youtube.text = str(l)
				
				if t.videos_vimeo != None :
					for l in t.videos_vimeo :
						vimeo = SubElement(videos, 'vimeo')
						vimeo.text = str(l)
			
				
			# social block
			if t.social_youtube != None or t.social_facebook != None or t.social_twitter != None:
				social = SubElement(child, "social")
				
				if t.social_facebook != None :
					for l in t.social_facebook :
						social_facebook = SubElement(social, 'facebook')
						social_facebook.text = str(l)
						
				if t.social_twitter != None :
					for l in t.social_twitter :
						social_twitter = SubElement(social, 'twitter')
						social_twitter.text = str(l)
				
				if t.social_youtube != None :
					for l in t.social_youtube :
						social_youtube = SubElement(social, 'youtube')
						social_youtube.text = str(l)
			
				
			# citation block
			if t.citation_source != None :
				citations = SubElement(child, "citations")
				c = 0
				for l in t.citation_source :
					citation = SubElement(citations, "citation")
					citation_source = SubElement(citation, 'source')
					citation_source.text = str(l)
					i = 0
					for k in t.citation_description :
						if i == c :
							citation_description = SubElement(citation, 'description')
							citation_description.text = k
						i += 1
					c += 1
			
			
			# external block
			if t.external_link_source != None :
				external_links = SubElement(child, "external-links")
				c = 0
				for l in t.external_link_source :
					external_link = SubElement(external_links, "external-link")
					external_link_source = SubElement(external_link, 'source')
					external_link_source.text = str(l)
					i = 0
					for k in t.external_link_description :
						if i == c :
							external_link_description = SubElement(external_link, 'description')
							external_link_description.text = k
						i += 1
					c += 1
			
			
			# individual details
			if (pagetype == "crises"):
				self.crisis_details(child, t)
			if (pagetype == "organizations"):
				self.organization_details(child, t)

			# id ref links
			for someLink in linkTypes[pagetype]:
				properLinkList = self.getProperList(someLink, t)
#				if ("Copiapo" in t.name and someLink == 'person-refs'):
#					print properLinkList
#					assert False
				if properLinkList != None and len(properLinkList) > 0:
					linkTag = SubElement(child, someLink)
					linkTag.text = ""
					for l in properLinkList :
				   		someLinkModel = self.getProperModelByKey(someLink, l)#Organization.get(l)
				   		linkTag.text += " " + str(someLinkModel.key().name())
			
	def get(self):
		
		# create main element and sub elements
		main = Element('world-crises')
		self.processPageTypes("crises", main)
		self.processPageTypes("organizations", main)
		self.processPageTypes("people", main)
		#crises = SubElement(main, 'crises')
		#organizations = SubElement(main, 'organizations')
		
		xml='<?xml version="1.0" encoding="UTF-8"?>\n<site>\n'
		
		# cycle through all person models and add to Element Tree
		# print
		self.response.headers['Content-Type']='text/xml; charset=utf-8'
		r = tostring(main, 'utf-8')
		rstar = minidom.parseString(r)
		self.response.out.write(rstar.toprettyxml(indent="	"))
 


application = webapp.WSGIApplication([(r'.*', ExportHandler)], debug=True)

def main():
	run_wsgi_app(application)

if __name__ == "__main__":
	main()

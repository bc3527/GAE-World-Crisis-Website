from handlers.export_handler import ExportHandler
from handlers.index_handler import IndexHandler
from handlers.search_handler import SearchHandler
from handlers.articleHandler import ArticleHandler

from google.appengine.ext import testbed 
from handlers.xml_upload_worker import XMLUploadWorker
from models.crisis_model import Crisis
from models.org_model import Organization
from models.person_model import Person
import unittest
import webapp2
from vendors.minixsv import pyxsval as xsv
import re
from google.appengine.ext import db
from google.appengine.api import search
from google.appengine.ext import testbed
from google.appengine.api import memcache
from google.appengine.api.search import stub
from xml.etree.ElementTree import Element, SubElement, Comment, tostring
from xml.etree.ElementTree import ElementTree

class TestImportHandler(unittest.TestCase):

	def setUp(self):
		self.x = XMLUploadWorker()
		#self.testbed = testbed.Testbed()
		#self.testbed.init_urlfetch_stub()
		
		
	def test_isURLWithDescription1(self):
		keyword = 'external-links'
		self.assert_(self.x.isUrlWithDescription(keyword))
		
	def test_isURLWithDescription2(self):
		keyword = 'maps'
		self.assert_(self.x.isUrlWithDescription(keyword))
	
	def test_isURLWithDescription3(self):
		keyword = "images"
		self.assert_(self.x.isUrlWithDescription(keyword))
		
	def test_isURLWithDescription4(self):
		keyword = "citations"
		self.assert_(self.x.isUrlWithDescription(keyword))
		
	def test_validate_xml1(self):
		xmlfile = open('test/test.xml','r')	
		validXML = self.x.validate_xml(xmlfile.read(), 'test/test.xsd', False)
		self.assert_(validXML)
		
	def test_validate_xml2(self):		
		validXML = self.x.validate_xml("Anirudh Sridhar", 'test/test.xsd', False)
		self.assert_(not validXML)
		
	def test_validate_xml3(self):
		xmlfile = open('test/TestWC1.py')
		validXML = self.x.validate_xml(xmlfile.read(), 'test/test.xsd', False)	
		self.assert_(not validXML)
		
	def test_validate_xml4(self):
		xmlfile = open('test/incorrect.xml','r')
		validXML = self.x.validate_xml(xmlfile.read(), 'test/test.xsd', False)
		self.assert_(not validXML)
		
	def test_validate_xml5(self):
		xmlfile = open('test/test2.xml','r')
		validXML = self.x.validate_xml(xmlfile.read(), 'test/test.xsd', False)
		self.assert_(validXML)
		
	def test_validate_xml6(self):
		xmlfile = open('test/test2.xml','r')
		validXML = self.x.validate_xml(xmlfile.read(), 'test/test.xsd', False)
		self.assert_(validXML)
	
		
	def test_createModels1(self):
		xsdFileInput = open("test/test.xsd", 'r')
		xmlfile = open('test/test.xml','r')
		xmleval = xsv.parseAndValidateString(re.sub('&', '&amp;', xmlfile.read()), xsdFileInput.read(), xmlIfClass=xsv.XMLIF_ELEMENTTREE)
		etree = xmleval.getTree()
		root = etree.getroot()
		self.x.createModels(root.find("people"))	
		somePerson =  db.get(db.Key.from_path("Person", "george-w-bush"))
		self.assert_(somePerson.name == "George W. Bush")
		self.assert_(somePerson.alternate_names == "GWB")
		self.assert_(len(somePerson.description) > 0)
		self.assert_(somePerson.country == "USA")
		self.assert_("President" in somePerson.category)
		
	def test_createModels2(self):
		xsdFileInput = open("test/test.xsd", 'r')
		xmlfile = open('test/test.xml','r')
		xmleval = xsv.parseAndValidateString(re.sub('&', '&amp;', xmlfile.read()), xsdFileInput.read(), xmlIfClass=xsv.XMLIF_ELEMENTTREE)
		etree = xmleval.getTree()
		root = etree.getroot()
		self.x.createModels(root.find("organizations"))	
		someOrganization =  db.get(db.Key.from_path("Organization", "nyfd"))
		self.assert_(someOrganization.name == "New York City Fire Department")
		self.assert_(someOrganization.description[:11] == "The origins")
		self.assert_(someOrganization.country == "USA")
		self.assert_(someOrganization.state == "NY")
		self.assert_(someOrganization.city == "Staten Island")
		self.assert_(someOrganization.email == "contactus@nycgov.com")
		self.assert_(someOrganization.phone == "911")
		self.assert_("FDNY" in someOrganization.social_facebook)
		
	def test_createModels3(self):
		xsdFileInput = open("test/test.xsd", 'r')
		xmlfile = open('test/test.xml','r')
		xmleval = xsv.parseAndValidateString(re.sub('&', '&amp;', xmlfile.read()), xsdFileInput.read(), xmlIfClass=xsv.XMLIF_ELEMENTTREE)
		etree = xmleval.getTree()
		root = etree.getroot()
		self.x.createModels(root.find("crises"))	
		someCrisis =  db.get(db.Key.from_path("Crisis", "beslan-school-siege"))
		self.assert_("Beslan" in someCrisis.name)
		self.assert_(len(someCrisis.description)>0)
		self.assert_(someCrisis.country == "Russian Federation")
		self.assert_(someCrisis.category.lower() == "terrorist attack")
		self.assert_(someCrisis.deaths > 0)
		
	def test_createLinks1(self):
		xsdFileInput = open("test/test.xsd", 'r')
		xmlfile = open('test/test.xml','r')
		xmleval = xsv.parseAndValidateString(re.sub('&', '&amp;', xmlfile.read()), xsdFileInput.read(), xmlIfClass=xsv.XMLIF_ELEMENTTREE)
		etree = xmleval.getTree()
		root = etree.getroot()
		self.x.createModels(root.find("people"))	
		self.x.createModels(root.find("crises"))	
		self.x.createModels(root.find("organizations"))
		
		self.x.createLinks(root.find("people"), False)
		somePerson =  db.get(db.Key.from_path("Person", "vladimir-putin"))
		someCrisis = db.get(somePerson.crisis_link[0])
		self.assert_("Beslan" in someCrisis.name)
		self.assert_(len(someCrisis.description)>0)
		self.assert_(someCrisis.country == "Russian Federation")
		self.assert_(someCrisis.category.lower() == "terrorist attack")
		self.assert_(someCrisis.deaths > 0)
		
	def test_createLinks2(self):
		xsdFileInput = open("test/test.xsd", 'r')
		xmlfile = open('test/test.xml','r')
		xmleval = xsv.parseAndValidateString(re.sub('&', '&amp;', xmlfile.read()), xsdFileInput.read(), xmlIfClass=xsv.XMLIF_ELEMENTTREE)
		etree = xmleval.getTree()
		root = etree.getroot()
		self.x.createModels(root.find("people"))	
		self.x.createModels(root.find("crises"))	
		self.x.createModels(root.find("organizations"))	
		
		self.x.createLinks(root.find("organizations"), False)
		someOrganization =  db.get(db.Key.from_path("Organization", "nyfd"))
		somePerson = db.get(someOrganization.person_link[0])
		self.assert_(somePerson.name == "George W. Bush")
		self.assert_(somePerson.alternate_names == "GWB")
		self.assert_(somePerson.description[:30] == "The airborne terrorist attacks")
		self.assert_(somePerson.country == "USA")
		self.assert_("President" in somePerson.category)
		
	def test_createLinks3(self):
		xsdFileInput = open("test/test.xsd", 'r')
		xmlfile = open('test/test.xml','r')
		xmleval = xsv.parseAndValidateString(re.sub('&', '&amp;', xmlfile.read()), xsdFileInput.read(), xmlIfClass=xsv.XMLIF_ELEMENTTREE)
		etree = xmleval.getTree()
		root = etree.getroot()
		self.x.createModels(root.find("people"))	
		self.x.createModels(root.find("crises"))	
		self.x.createModels(root.find("organizations"))	
		
		self.x.createLinks(root.find("crises"), False)
		someCrisis =  db.get(db.Key.from_path("Crisis", "september11"))
		someOrganization = db.get(someCrisis.organization_link[0])
		self.assert_(someOrganization.name == "New York City Fire Department")
		self.assert_(len(someCrisis.description)>0)
		self.assert_(someOrganization.country == "USA")
		self.assert_(someOrganization.state == "NY")
		self.assert_(someOrganization.city == "Staten Island")
		self.assert_(someOrganization.email == "contactus@nycgov.com")
		self.assert_(someOrganization.phone == "911")
		self.assert_("FDNY" in someOrganization.social_facebook)

class TestArticleHandler(unittest.TestCase):
	def setUp(self):
		# First, create an instance of the Testbed class.
		self.testbed = testbed.Testbed()
   	  	self.testbed.activate()
   	 	self.testbed.init_datastore_v3_stub()
		self.testbed.init_memcache_stub()
		
		self.handler = ArticleHandler()
		self.x = XMLUploadWorker()
		xsdFileInput = open("test/test.xsd", 'r')
		xmlfile = open('test/test2.xml','r')
		xmleval = xsv.parseAndValidateString(re.sub('&', '&amp;', xmlfile.read()), xsdFileInput.read(), xmlIfClass=xsv.XMLIF_ELEMENTTREE)
		etree = xmleval.getTree()
		root = etree.getroot()
		self.x.createModels(root.find("people"))	
		self.x.createModels(root.find("crises"))	
		self.x.createModels(root.find("organizations"))	
		
		self.x.createLinks(root.find("crises"), False)
		self.x.createLinks(root.find("people"), False)
		self.x.createLinks(root.find("organizations"), False)
		
	def test_commonInfo1(self):
		dictionary = {}
		someEntity =  db.get(db.Key.from_path("Person", "bill-clinton")) 
		self.assert_(not (someEntity == None))
		self.handler.commonInfo(dictionary, someEntity)
		self.assert_(dictionary['name'] == "Bill Clinton")
		self.assert_(dictionary['category'] == "President of The USA")
		self.assert_(dictionary['description'])
		self.assert_(dictionary['country'] == "USA")
		self.assert_(dictionary['city'] == "Washington D.C.")
		self.assert_(str(type(dictionary["image_source"])) == str(type([])))
		self.assert_(len(dictionary["image_source"]) > 1)
		self.assert_(dictionary["image_source"][0]['src'] == 'http://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Bill_Clinton.jpg/220px-Bill_Clinton.jpg')
		self.assert_(dictionary["image_source"][0]['desc'])
		self.assert_(dictionary["image_source"][1]['src'] == 'http://photos.state.gov/galleries/ankara/9104/between_friends_photo_exhibit/clinton_and_kids.jpg')
		self.assert_(dictionary["image_source"][1]['desc'])
		self.assert_(str(type(dictionary["external_source"])) == str(type([])))
		self.assert_(len(dictionary["external_source"]) > 0)
		self.assert_(dictionary["external_source"][0]['src'] == 'http://en.wikipedia.org/wiki/Clinton_Foundation')
		self.assert_(dictionary["external_source"][0]['desc'])
		self.assert_(str(type(dictionary["external_source"])) == str(type([])))
		self.assert_(len(dictionary["citation_source"]) > 0)
		self.assert_(dictionary["citation_source"][0]['src'] == 'http://politicalhumor.about.com/cs/quotethis/a/clintonquotes.htm')
		self.assert_(dictionary["citation_source"][0]['desc'])
		
	def test_commonInfo2(self):
		dictionary = {}
		someEntity =  db.get(db.Key.from_path("Person", "yao-ming")) 
		self.assert_(not (someEntity == None))
		self.handler.commonInfo(dictionary, someEntity)
		self.assert_(dictionary['name'] == "Yao Ming")
		self.assert_(dictionary['category'])
		self.assert_(dictionary['description'])
		self.assert_(dictionary['country'] == "USA")
		self.assert_(str(type(dictionary["image_source"])) == str(type([])))
		self.assert_(len(dictionary["image_source"]) > 1)
		self.assert_(dictionary["image_source"][0]['src'] == 'http://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/YaoMingonoffense2.jpg/399px-YaoMingonoffense2.jpg')
		self.assert_(dictionary["image_source"][0]['desc'])
		self.assert_(dictionary["image_source"][1]['src'] == 'http://saceweb.com/yahoo_site_admin/assets/images/Yaoming_Earthquate_Donation_resize.13594706.JPG')
		self.assert_(dictionary["image_source"][1]['desc'])
		self.assert_(str(type(dictionary["external_source"])) == str(type([])))
		self.assert_(len(dictionary["external_source"]) > 0)
		self.assert_(dictionary["external_source"][0]['src'] == 'http://en.wikipedia.org/wiki/Yao_Ming')
		self.assert_(dictionary["external_source"][0]['desc'])
		self.assert_(str(type(dictionary["external_source"])) == str(type([])))
		self.assert_(len(dictionary["citation_source"]) > 0)
		self.assert_(dictionary["citation_source"][0]['src'] == 'http://www.brainyquote.com/quotes/authors/y/yao_ming.html')
		self.assert_(dictionary["citation_source"][0]['desc'])
		
	def test_commonInfo3(self):
		dictionary = {}
		someEntity =  db.get(db.Key.from_path("Crisis", "beslan-school-siege")) 
		self.assert_(not (someEntity == None))
		self.handler.commonInfo(dictionary, someEntity)
		self.assert_(dictionary['name'] == "Beslan School Siege")
		self.assert_(dictionary['category'] == "Terrorist Attack")
		self.assert_(dictionary['description'])
		self.assert_(dictionary['country'] == "Russian Federation")
		self.assert_(str(type(dictionary["image_source"])) == str(type([])))
		self.assert_(len(dictionary["image_source"]) > 1)
		self.assert_(dictionary["image_source"][0]['src'] == 'http://www.zindamagazine.com/html/archives/2004/9.21.04/pix/beslan.jpg')
		self.assert_(len(dictionary["image_source"][0]['desc']) > 0)
		self.assert_(dictionary["image_source"][1]['src'] == 'http://thefamilywithoutborders.com/wp-content/uploads/2010/07/beslan-school-gymnasium.jpg')
		self.assert_(len(dictionary["image_source"][1]['desc']) > 0)
		self.assert_(str(type(dictionary["external_source"])) == str(type([])))
		self.assert_(len(dictionary["external_source"]) > 0)
		self.assert_(dictionary["external_source"][0]['src'] == 'http://en.wikipedia.org/wiki/Beslan_school_hostage_crisis')
		self.assert_(len(dictionary["external_source"][0]['desc']) > 0)
		self.assert_(str(type(dictionary["external_source"])) == str(type([])))
		self.assert_(len(dictionary["map_source"]) > 0)
		self.assert_(dictionary["map_source"][0] == 'https://maps.google.com/maps?q=%D0%B1%D0%B5%D1%81%D0%BB%D0%B0%D0%BD+%D0%BA%D0%B0%D1%80%D1%82%D0%B0&ie=UTF-8&hq=&hnear=0x40507a3d42902631:0x44b473c66c3f5648,Beslan,+Respublika+Severnaya+Osetiya-Alaniya,+Russia&gl=us&ei=VFWIUK6WCOfE2gXb_IGABg&ved=0CB8Q8gEwAA')
		
	def test_createHtmlLinks1(self):
		dictionary = {}
		someEntity =  db.get(db.Key.from_path("Person", "george-w-bush")) 
		self.assert_(not (someEntity == None))
		self.handler.createHtmlLinks(dictionary, someEntity)
		self.assert_(str(type(dictionary["videos_youtube"])) == str(type([])))
		self.assert_(dictionary["videos_youtube"][0]['src'] == 'http://www.youtube.com/embed/4RbAZj9RB94')
		self.assert_(dictionary["videos_youtube"][0]['img_src'] == 'http://img.youtube.com/vi/4RbAZj9RB94/0.jpg')
		self.assert_(str(type(dictionary["social_facebook"])) == str(type([])))
		self.assert_("http://www.facebook.com/georgewbush" in dictionary["social_facebook"][0])
		self.assert_(str(type(dictionary["social_twitter"])) == str(type([])))
		self.assert_("https://www.twitter.com/@GeorgeBush" in dictionary["social_twitter"][0])
		
	def test_createHtmlLinks2(self):
		dictionary = {}
		someEntity =  db.get(db.Key.from_path("Person", "vladimir-putin")) 
		self.assert_(not (someEntity == None))
		self.handler.createHtmlLinks(dictionary, someEntity)
		self.assert_(str(type(dictionary["videos_youtube"])) == str(type([])))
		self.assert_(len(dictionary["videos_youtube"]) == 2)
		self.assert_(dictionary["videos_youtube"][0]['src'] == 'http://www.youtube.com/embed/TNiWnSOsAnE')
		self.assert_(dictionary["videos_youtube"][0]['img_src'] == 'http://img.youtube.com/vi/TNiWnSOsAnE/0.jpg')
		self.assert_(dictionary["videos_youtube"][1]['src'] == 'http://www.youtube.com/embed/ZR84oXysqoA')
		self.assert_(dictionary["videos_youtube"][1]['img_src'] == 'http://img.youtube.com/vi/ZR84oXysqoA/0.jpg')
		self.assert_(len(dictionary["videos_vimeo"]) > 0)
		self.assert_(dictionary["videos_vimeo"][0]['src'] == 'http://www.player.vimeo.com/video/38458300?')
		self.assert_(str(type(dictionary["social_facebook"])) == str(type([])))
		self.assert_("http://www.facebook.com/vladimirputinandrussia" in dictionary["social_facebook"][0])
		self.assert_(str(type(dictionary["social_twitter"])) == str(type([])))
		self.assert_("https://www.twitter.com/@kremlinrussia_e" in dictionary["social_twitter"][0])
		
	def test_createHtmlLinks3(self):
		dictionary = {}
		someEntity =  db.get(db.Key.from_path("Crisis", "beslan-school-siege")) 
		self.assert_(not (someEntity == None))
		self.handler.createHtmlLinks(dictionary, someEntity)
		self.assert_(str(type(dictionary["videos_youtube"])) == str(type([])))
		self.assert_(len(dictionary["videos_youtube"]) > 0)
		self.assert_(dictionary["videos_youtube"][0]['src'] == 'http://www.youtube.com/embed/csr9TPGPoxs')
		self.assert_(dictionary["videos_youtube"][0]['img_src'] == 'http://img.youtube.com/vi/csr9TPGPoxs/0.jpg')
		self.assert_(len(dictionary["videos_vimeo"]) > 0)
		self.assert_(dictionary["videos_vimeo"][0]['src'] == 'http://www.player.vimeo.com/video/34659973?')
		self.assert_(str(type(dictionary["social_facebook"])) == str(type([])))
		self.assert_("http://www.facebook.com/vladimirputinandrussia" in dictionary["social_facebook"][0])
		self.assert_(str(type(dictionary["social_twitter"])) == str(type([])))
		self.assert_("https://www.twitter.com/@SOssetia" in dictionary["social_twitter"][0])
		
	def test_createHtmlLinks4(self):
		dictionary = {}
		someEntity =  db.get(db.Key.from_path("Organization", "nyfd")) 
		self.assert_(not (someEntity == None))
		self.handler.createHtmlLinks(dictionary, someEntity)
		self.assert_(str(type(dictionary["videos_youtube"])) == str(type([])))
		self.assert_(len(dictionary["videos_youtube"]) == 2)
		self.assert_(dictionary["videos_youtube"][0]['src'] == 'http://www.youtube.com/embed/YZ4hK1aGY7Q')
		self.assert_(dictionary["videos_youtube"][0]['img_src'] == 'http://img.youtube.com/vi/YZ4hK1aGY7Q/0.jpg')
		self.assert_(dictionary["videos_youtube"][1]['src'] == 'http://www.youtube.com/embed/UINW1Ls64T8')
		self.assert_(dictionary["videos_youtube"][1]['img_src'] == 'http://img.youtube.com/vi/UINW1Ls64T8/0.jpg')
		self.assert_(str(type(dictionary["social_facebook"])) == str(type([])))
		self.assert_("http://www.facebook.com/FDNY" in dictionary["social_facebook"][0])
		self.assert_(str(type(dictionary["social_twitter"])) == str(type([])))
		self.assert_("https://www.twitter.com/@FDNY" in dictionary["social_twitter"][0])

class TestExportHandler(unittest.TestCase):
	def setUp(self):
		self.x = XMLUploadWorker()
		self.handler = ExportHandler()
		xsdFileInput = open("test/test.xsd", 'r')
		xmlfile = open('test/test2.xml','r')
		xmleval = xsv.parseAndValidateString(re.sub('&', '&amp;', xmlfile.read()), xsdFileInput.read(), xmlIfClass=xsv.XMLIF_ELEMENTTREE)
		etree = xmleval.getTree()
		root = etree.getroot()
		self.x.createModels(root.find("people"))	
		self.x.createModels(root.find("crises"))	
		self.x.createModels(root.find("organizations"))	
		
		self.x.createLinks(root.find("crises"), False)
		self.x.createLinks(root.find("people"), False)
		self.x.createLinks(root.find("organizations"), False)
	
	def test_getProperModelByKey1(self):
		pagetype = "person-refs"
		key = db.get(db.Key.from_path("Person","george-w-bush")).key()
		model = self.handler.getProperModelByKey(pagetype, key)
		self.assert_(model != None)
		self.assert_(model.name == "George W. Bush")
		self.assert_(model.city == "Washington D.C.")
		
	def test_getProperModelByKey2(self):
		pagetype = "organization-refs"
		key = db.get(db.Key.from_path("Organization","nyfd")).key()
		model = self.handler.getProperModelByKey(pagetype, key)
		self.assert_(model != None)
		self.assert_(model.name == "New York City Fire Department")
		self.assert_(model.city == "Staten Island")
	
	def test_getProperModelByKey3(self):
		pagetype = "crisis-refs"
		key = db.get(db.Key.from_path("Crisis","beslan-school-siege")).key()
		model = self.handler.getProperModelByKey(pagetype, key)
		self.assert_(model != None)
		self.assert_(model.name == "Beslan School Siege")
		self.assert_(model.city == "Beslan")
		
	def test_getProperList1(self):
		pagetype = "person-refs"
		key = db.get(db.Key.from_path("Person","george-w-bush")).key()
		model = self.handler.getProperModelByKey(pagetype, key)
		pagetype = "organization-refs"
		
		keys = self.handler.getProperList(pagetype, model)
		someModel = Organization.get(keys[0])
		
		self.assert_(someModel != None)
		self.assert_(someModel.name == "New York City Fire Department")
		self.assert_(someModel.city == "Staten Island")
		
	def test_getProperList2(self):
		pagetype = "organization-refs"
		key = db.get(db.Key.from_path("Organization","nyfd")).key()
		model = self.handler.getProperModelByKey(pagetype, key)
		pagetype = "crisis-refs"
		
		keys = self.handler.getProperList(pagetype, model)
		someModel = Crisis.get(keys[0])
		
		self.assert_(someModel != None)
		self.assert_(someModel.city == "New York")
	
	def test_getProperList3(self):
		pagetype = "crisis-refs"
		key = db.get(db.Key.from_path("Crisis","beslan-school-siege")).key()
		model = self.handler.getProperModelByKey(pagetype, key)
		pagetype = "person-refs"
		
		keys = self.handler.getProperList(pagetype, model)
		someModel = Person.get(keys[0])
		
		self.assert_(someModel != None)
		self.assert_(someModel.name == "Vladimir Putin")
		self.assert_(someModel.city == "Moscow")
		
	def test_organization_details(self) :
		pagetype = "organization-refs"
		key = db.get(db.Key.from_path("Organization","nyfd")).key()
		model = self.handler.getProperModelByKey(pagetype, key)
		
		element = Element("main")
		self.handler.organization_details(element, model)
		
		self.assert_(element.find("address") != None)
		self.assert_(element.find("address").text == "New York City, NY, United States")
		self.assert_(element.find("email") != None)
		self.assert_(element.find("email").text == "contactus@nycgov.com")
		self.assert_(element.find("phone") != None)
		self.assert_(element.find("phone").text)
		
	def test_crisis_details(self) :
		pagetype = "crisis-refs"
		key = db.get(db.Key.from_path("Crisis","beslan-school-siege")).key()
		model = self.handler.getProperModelByKey(pagetype, key)
		
		element = Element("main")
		self.handler.crisis_details(element, model)
		impact = element.find("human-impact")
		
		self.assert_(element.find("start-date") != None)
		self.assert_(element.find("start-date").text == "2004-09-01T09:00:00")
		self.assert_(impact.find("deaths") != None)
		self.assert_(impact.find("deaths").text == "380")
		self.assert_(impact.find("missing") != None)
		self.assert_(impact.find("missing").text == "0")
		self.assert_(impact.find("injured") != None)
		self.assert_(impact.find("injured").text == "783")
		self.assert_(impact.find("displaced") != None)
		self.assert_(impact.find("displaced").text == "0")

	
